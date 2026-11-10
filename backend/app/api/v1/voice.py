from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.voice import VoiceParseRequest, VoiceParseResponse, VoiceQueryRequest, VoiceQueryResponse
from app.services.voice_service import VoiceService
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/parse", response_model=VoiceParseResponse)
def parse_voice(
    request: VoiceParseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Parses natural Kannada and Kannada-English mixed speech.
    Extracts customer, garments, pricing, advance payment, and delivery date.
    Intelligently aggregates with existing draft if draft_id is supplied.
    """
    return VoiceService.process_voice_transcript(
        db=db,
        user_id=current_user.id,
        transcript=request.transcript,
        draft_id=request.draft_id
    )

@router.post("/query", response_model=VoiceQueryResponse)
def query_voice(
    request: VoiceQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Answers voice questions using live database records.
    Example queries:
    - 'ಇವತ್ತು ಎಷ್ಟು ಹಣ ಬಂತು?'
    - 'ಲಕ್ಷ್ಮಿ ಎಷ್ಟು ಹಣ ಕೊಡಬೇಕು?'
    - 'ಈ ತಿಂಗಳು ಎಷ್ಟು ಆದಾಯ ಬಂದಿದೆ?'
    - 'ನಾಳೆ ಯಾರ ಬಟ್ಟೆ ಕೊಡಬೇಕು?'
    - 'ಯಾವ ಆರ್ಡರ್ಗಳು ಇನ್ನೂ ಬಾಕಿ ಇವೆ?'
    - 'ರಮ್ಯಾ ಯಾವಾಗ ಬಟ್ಟೆ ಕೊಟ್ಟಿದ್ದರು?'
    """
    return VoiceService.answer_voice_query(
        db=db,
        user_id=current_user.id,
        query=request.query
    )

@router.post("/transcribe")
async def fallback_transcribe_audio(
    audio: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Replaceable backend Speech-To-Text fallback architecture.
    Accepts recorded audio from mobile browsers that lack built-in SpeechRecognition.
    Can be connected to Whisper / Google Cloud Speech / Azure Speech.
    Currently provides architecture stub with friendly Kannada fallback prompt.
    """
    contents = await audio.read()
    if not contents:
        raise HTTPException(status_code=400, detail="ಖಾಲಿ ಧ್ವನಿ ಕಡತ (Empty audio file received)")
    
    # Provider architecture: in environments with local Whisper / Speech API credentials,
    # audio is passed to the speech engine. Here we provide the standard response payload.
    return {
        "status": "success",
        "audio_bytes_received": len(contents),
        "content_type": audio.content_type,
        "message_kannada": "ಧ್ವನಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ. ಬ್ರೌಸರ್ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಲಭ್ಯವಿದ್ದಾಗ ನೇರ ಇನ್‌ಪುಟ್ ವೇಗವಾಗಿರುತ್ತದೆ."
    }
