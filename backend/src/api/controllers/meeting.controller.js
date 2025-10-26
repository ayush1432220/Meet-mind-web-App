import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { Meeting } from '../models/meeting.model.js';
import { meetingProcessingQueue } from '../../queues/meeting.queue.js';

// Create a new meeting (when a live meeting starts)
const startMeeting = asyncHandler(async (req, res) => {
  const { zoomMeetingId, title, participants } = req.body; // participants = array of user IDs
  const hostId = req.user._id;

  const newMeeting = await Meeting.create({
    zoomMeetingId,
    title,
    host: hostId,
    participants: participants || [hostId],
    status: 'LIVE',
  });

  // Notify participants via Socket.IO that meeting has started
  const io = req.app.get('io');
  if (participants) {
    participants.forEach(userId => {
      // You need a way to map userId to socketId (done in socket.handler.js)
      // This is a simplified example
      io.to(userId.toString()).emit('meeting:started', newMeeting);
    });
  }

  return res.status(201).json(new ApiResponse(201, newMeeting, 'Meeting started'));
});

// End a meeting and queue it for AI processing
const endMeeting = asyncHandler(async (req, res) => {
  const { meetingId } = req.params; // This is our DB ID
  const { transcript } = req.body; // Full transcript from frontend

  const meeting = await Meeting.findById(meetingId);
  if (!meeting) {
    throw new ApiError(404, 'Meeting not found');
  }
  if (meeting.host.toString() !== req.user._id.toString()) {
     throw new ApiError(403, 'Only the host can end the meeting');
  }

  // 1. Update meeting status to "PROCESSING"
  meeting.status = 'PROCESSING';
  meeting.endTime = new Date();
  meeting.transcript = transcript; // Save raw transcript
  // TODO: meeting.audioS3Url = req.body.audioS3Url;
  await meeting.save();

  // 2. Add job to the BullMQ queue for background processing
  await meetingProcessingQueue.add('process-ai-summary', {
    meetingId: meeting._id,
    transcript: meeting.transcript,
    participants: meeting.participants,
  });

  // 3. Respond to the user immediately
  return res
    .status(202) // 202 "Accepted"
    .json(new ApiResponse(202, meeting, 'Meeting ended. Summary processing has started.'));
});

// Get details of a single meeting (after processing)
const getMeetingDetails = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const meeting = await Meeting.findById(meetingId)
    .populate('participants', 'name email')
    .populate('host', 'name email')
    .populate('actionItems');
    
  if (!meeting) {
    throw new ApiError(404, 'Meeting not found');
  }
  
  // Check if user was a participant
  const isParticipant = meeting.participants.some(p => p._id.equals(req.user._id));
  if (!isParticipant && !req.user._id.equals(meeting.host._id)) {
     throw new ApiError(403, 'You do not have access to this meeting');
  }

  return res.status(200).json(new ApiResponse(200, meeting, 'Meeting details fetched'));
});

// Get all meetings for the logged-in user
const getMyMeetings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const meetings = await Meeting.find({
    $or: [{ host: userId }, { participants: userId }],
  })
  .select('title status startTime endTime')
  .sort({ startTime: -1 });

  return res.status(200).json(new ApiResponse(200, meetings, 'User meetings fetched'));
});

export const meetingController = {
  startMeeting,
  endMeeting,
  getMeetingDetails,
  getMyMeetings
};
