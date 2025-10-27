from fastapi import FastAPI, Request
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import uvicorn
import os


load_dotenv()

app = FastAPI()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.3
)

SYSTEM_PROMPT = """
You are an AI Meeting Assistant. Convert raw meeting transcript into a structured JSON.

Tasks:
1. Summarize the entire meeting professionally
2. Extract speaker-wise key points
3. Extract action tasks per person with deadlines if mentioned
4. Create final conclusion

Output format (MUST return valid JSON only):
{
 "meeting_summary": "",
 "speaker_summaries": [],
 "action_items": [],
 "conclusion": ""
}
"""


class TranscriptInput(BaseModel):
    transcript: str

@app.post("/process-transcript")
async def process_transcript(data: TranscriptInput):
    transcript = data.transcript

    prompt = f"{SYSTEM_PROMPT}\nMeeting Transcript:\n{transcript}"
    result = llm.invoke(prompt)
    
    return {"result": result.content}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
