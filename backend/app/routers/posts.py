from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.post import Post
from app.models.post_tag import PostTag
from app.models.reaction import Reaction, ReactionTypeEnum
from app.models.comment import Comment
from app.schemas.post import PostCreate, PostResponse, PostUpdate, AuthorResponse, ReactionSummary
from app.utils.dependencies import get_current_user, get_optional_user
from app.models.user import User
import bleach

router = APIRouter(prefix="/api/posts", tags=["Posts"])

# allowed HTML tags and attributes for rich text content
ALLOWED_TAGS = [
    "b", "i", "u", "em", "strong", "a",
    "ul", "ol", "li", "blockquote",
    "code", "p", "br"
]
ALLOWED_ATTRIBUTES = {
    "a": ["href", "target", "rel"]
}

def sanitize_content(content: str) -> str:
    return bleach.clean(
        content,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        strip=True
    )

def build_post_response(post: Post, db: Session) -> dict:
    author = None
    if not post.is_anonymous and post.user_id:
        user = db.query(User).filter(User.id == post.user_id).first()
        if user:
            author = AuthorResponse(
                username=user.username,
                profile_picture_url=user.profile_picture_url
            )

    raw_reactions = db.query(Reaction).filter(Reaction.post_id == post.id).all()
    reaction_counts = {r.value: 0 for r in ReactionTypeEnum}
    for r in raw_reactions:
        reaction_counts[r.reaction_type.value] += 1
    total_reactions = sum(reaction_counts.values())

    reactions = [
        ReactionSummary(
            id=r.id,
            user_id=r.user_id,
            reaction_type=r.reaction_type.value,
            created_at=r.created_at
        )
        for r in raw_reactions
    ]

    comment_count = db.query(Comment).filter(
        Comment.post_id == post.id,
        Comment.is_deleted == False
    ).count()

    return {
        "id": post.id,
        "content": post.content,
        "is_anonymous": post.is_anonymous,
        "user_id": post.user_id,
        "author": author,
        "mood": post.mood,
        "visibility": post.visibility.value if post.visibility else "public",
        "is_flagged": post.is_flagged,
        "created_at": post.created_at,
        "reactions": reactions,
        "reaction_counts": reaction_counts,
        "total_reactions": total_reactions,
        "comment_count": comment_count,
    }

@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(data: PostCreate, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_user)):
    post = Post(
        content=sanitize_content(data.content),
        is_anonymous=data.is_anonymous,
        mood=data.mood,
        visibility=data.visibility,
        user_id=current_user.id if current_user and not data.is_anonymous else None
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    for tag_id in data.tag_ids:
        db.add(PostTag(post_id=post.id, tag_id=tag_id))
    db.commit()
    db.refresh(post)
    return build_post_response(post, db)

@router.get("/", response_model=List[PostResponse])
def get_all_posts(skip: int = 0, limit: int = 20, mood: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Post).filter(Post.is_deleted == False, Post.visibility == "public")
    if mood:
        query = query.filter(Post.mood == mood)
    posts = query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    return [build_post_response(post, db) for post in posts]

@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id, Post.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return build_post_response(post, db)

@router.put("/{post_id}", response_model=PostResponse)
def update_post(post_id: int, data: PostUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id, Post.user_id == current_user.id, Post.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found or not authorized")
    for field, value in data.model_dump(exclude_none=True).items():
        if field == "content":
            value = sanitize_content(value)
        setattr(post, field, value)
    db.commit()
    db.refresh(post)
    return build_post_response(post, db)

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id, Post.user_id == current_user.id, Post.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found or not authorized")
    post.is_deleted = True
    db.commit()