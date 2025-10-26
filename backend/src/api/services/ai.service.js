import { GoogleGenerativeAI } from '@google/generative-ai';
import { ApiError } from '../utils/apiError.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getAIPrompt = (transcriptText) => `
You are MeetMind, an expert meeting analysis agent.
Analyze the following meeting transcript.
Your response MUST be a single, valid JSON object. Do not add any text before or after the JSON.

The transcript is:
---
${transcriptText}
---

Extract the following information:

1.  **summary**: A concise, 1-2 paragraph professional summary of the meeting.
2.  **keyDecisions**: A string array of key decisions, if any.
3.  **tasks**: An array of objects for action items. For each task, extract:
    * **title**: The actionable task.
    * **assignee**: The name of the person assigned. If unassigned, use "Unassigned".
    * **deadline**: The deadline (e.g., "Friday", "EOD"), or "N/A" if not mentioned.

JSON RESPONSE:
`;

const generateSummaryAndTasks = async (transcript) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Convert transcript array to a simple string for the prompt
    const transcriptText = transcript.map(entry => 
      `${entry.speakerName} (${entry.timestamp}): ${entry.text}`
    ).join('\n');

    const prompt = getAIPrompt(transcriptText);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean and parse the JSON response
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiResult = JSON.parse(cleanedJson);
    
    return aiResult;

  } catch (error) {
    console.error('Error generating AI summary:', error);
    throw new ApiError(500, 'Failed to generate AI analysis.');
  }
};

export const aiService = {
  generateSummaryAndTasks
};
