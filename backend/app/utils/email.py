import smtplib
import ssl
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, html_body: str):
    """Send an email using SMTP (Gmail).

    Supports both:
      - Port 465 with SSL  (preferred for cloud hosts like Render)
      - Port 587 with STARTTLS (fallback)

    Uses environment variables:
        SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, MAIL_FROM
    """
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 465))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    mail_from = os.getenv("MAIL_FROM")

    if not smtp_username or not smtp_password:
        raise RuntimeError("SMTP credentials not configured (SMTP_USERNAME / SMTP_PASSWORD)")

    logger.info(f"Sending email to {to} via {smtp_host}:{smtp_port}")

    msg = MIMEMultipart("alternative")
    msg["From"] = mail_from
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html"))

    context = ssl.create_default_context()

    try:
        if smtp_port == 465:
            # SSL connection (recommended for cloud hosts)
            with smtplib.SMTP_SSL(smtp_host, smtp_port, context=context, timeout=30) as server:
                server.login(smtp_username, smtp_password)
                server.sendmail(mail_from, to, msg.as_string())
        else:
            # STARTTLS connection (port 587)
            with smtplib.SMTP(smtp_host, smtp_port, timeout=30) as server:
                server.starttls(context=context)
                server.login(smtp_username, smtp_password)
                server.sendmail(mail_from, to, msg.as_string())

        logger.info(f"Email sent successfully to {to}")
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"SMTP auth failed: {e}")
        raise RuntimeError(f"SMTP authentication failed — check SMTP_USERNAME / SMTP_PASSWORD: {e}")
    except smtplib.SMTPConnectError as e:
        logger.error(f"SMTP connection failed: {e}")
        raise RuntimeError(f"Could not connect to SMTP server {smtp_host}:{smtp_port}: {e}")
    except TimeoutError as e:
        logger.error(f"SMTP timeout: {e}")
        raise RuntimeError(f"SMTP connection timed out — port {smtp_port} may be blocked by host: {e}")
    except Exception as e:
        logger.error(f"SMTP error: {type(e).__name__}: {e}")
        raise
