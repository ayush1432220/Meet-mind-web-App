import { Router } from 'express';
import authRouter from './auth.routes.js';
import meetingRouter from './meeting.routes.js';
// import taskRouter from './task.routes.js';

const router = Router();

router.use('/auth',(req,res,next)=>{
    console.log(`request`)
    next();
} ,authRouter);
router.use('/meetings', meetingRouter);
// router.use('/tasks', taskRouter); // TODO: Add task routes (CRUD)

export default router;
