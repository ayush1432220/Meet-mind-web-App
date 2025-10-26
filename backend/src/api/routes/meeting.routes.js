import { Router } from 'express';
import { meetingController } from '../controllers/meeting.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate, startMeetingValidationRules, endMeetingValidationRules } from '../middlewares/validation.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// All meeting routes are protected
router.use(verifyJWT);

router.post(
  '/start', 
  startMeetingValidationRules(), 
  validate, 
  asyncHandler(meetingController.startMeeting)
);

router.post(
  '/:meetingId/end', 
  endMeetingValidationRules(), 
  validate, 
  asyncHandler(meetingController.endMeeting)
);

router.get(
  '/:meetingId', 
  asyncHandler(meetingController.getMeetingDetails)
);

router.get(
  '/', 
  asyncHandler(meetingController.getMyMeetings)
);


export default router;
