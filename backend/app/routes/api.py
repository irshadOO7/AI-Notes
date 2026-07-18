from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_db
from app.models.schemas import (
    NoteCreate,
    NoteResponse,
    NoteUpdate,
    SummarizeRequest,
    SummarizeResponse,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)
from app.services.llm import generate_summary
from app.utils.auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    db = get_db()
    existing = await db.users.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    now = datetime.now(timezone.utc)
    result = await db.users.insert_one(
        {
            "email": user_data.email.lower(),
            "password": hash_password(user_data.password),
            "created_at": now,
        }
    )

    user = UserResponse(
        id=str(result.inserted_id),
        email=user_data.email.lower(),
        created_at=now,
    )
    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=user)


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": user_data.email.lower()})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_response = UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        created_at=user["created_at"],
    )
    token = create_access_token(user_response.id)
    return TokenResponse(access_token=token, user=user_response)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user


@router.post("/summarize", response_model=SummarizeResponse)
async def summarize(
    data: SummarizeRequest,
    current_user: UserResponse = Depends(get_current_user),
):
    summary, source = await generate_summary(data.title, data.content)
    return SummarizeResponse(summary=summary, source=source)


@router.get("/notes", response_model=List[NoteResponse])
async def list_notes(current_user: UserResponse = Depends(get_current_user)):
    db = get_db()
    cursor = db.notes.find({"user_id": current_user.id}).sort("updated_at", -1)
    notes = []
    async for note in cursor:
        notes.append(
            NoteResponse(
                id=str(note["_id"]),
                title=note["title"],
                content=note["content"],
                summary=note.get("summary"),
                created_at=note["created_at"],
                updated_at=note["updated_at"],
            )
        )
    return notes


@router.post("/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_data: NoteCreate,
    current_user: UserResponse = Depends(get_current_user),
):
    db = get_db()
    now = datetime.now(timezone.utc)
    summary = note_data.summary

    if not summary:
        summary, _ = await generate_summary(note_data.title, note_data.content)

    result = await db.notes.insert_one(
        {
            "user_id": current_user.id,
            "title": note_data.title,
            "content": note_data.content,
            "summary": summary,
            "created_at": now,
            "updated_at": now,
        }
    )

    return NoteResponse(
        id=str(result.inserted_id),
        title=note_data.title,
        content=note_data.content,
        summary=summary,
        created_at=now,
        updated_at=now,
    )


@router.get("/notes/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    db = get_db()
    try:
        note = await db.notes.find_one(
            {"_id": ObjectId(note_id), "user_id": current_user.id}
        )
    except Exception:
        note = None

    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    return NoteResponse(
        id=str(note["_id"]),
        title=note["title"],
        content=note["content"],
        summary=note.get("summary"),
        created_at=note["created_at"],
        updated_at=note["updated_at"],
    )


@router.put("/notes/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: str,
    note_data: NoteUpdate,
    current_user: UserResponse = Depends(get_current_user),
):
    db = get_db()
    try:
        note = await db.notes.find_one(
            {"_id": ObjectId(note_id), "user_id": current_user.id}
        )
    except Exception:
        note = None

    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    updates: dict = {}
    if note_data.title is not None:
        updates["title"] = note_data.title
    if note_data.content is not None:
        updates["content"] = note_data.content
    if note_data.summary is not None:
        updates["summary"] = note_data.summary

    if updates:
        updates["updated_at"] = datetime.now(timezone.utc)
        await db.notes.update_one({"_id": ObjectId(note_id)}, {"$set": updates})
        note = await db.notes.find_one({"_id": ObjectId(note_id)})

    return NoteResponse(
        id=str(note["_id"]),
        title=note["title"],
        content=note["content"],
        summary=note.get("summary"),
        created_at=note["created_at"],
        updated_at=note["updated_at"],
    )


@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    db = get_db()
    try:
        result = await db.notes.delete_one(
            {"_id": ObjectId(note_id), "user_id": current_user.id}
        )
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
