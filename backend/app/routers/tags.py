from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.tag import Tag
from app.schemas.tag import TagCreate, TagResponse

router = APIRouter(prefix="/api/tags", tags=["Tags"])

@router.post("/", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(data: TagCreate, db: Session = Depends(get_db)):
    tag = Tag(name=data.name, slug=data.slug)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag

@router.get("/", response_model=List[TagResponse])
def get_all_tags(db: Session = Depends(get_db)):
    return db.query(Tag).all()