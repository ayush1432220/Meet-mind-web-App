import { Task } from '../models/task.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';

/**
 * Creates tasks in the DB based on AI extraction.
 * Tries to match assignee names to real users.
 */
const createTasksFromAI = async (aiTasks, meetingId, participants) => {
  if (!aiTasks || aiTasks.length === 0) {
    return [];
  }

  const createdTaskIds = [];

  for (const task of aiTasks) {
    let assignedToId = null;

    // Try to find the user ID for the assignee
    if (task.assignee !== 'Unassigned' && participants.length > 0) {
      // Simple name matching (case-insensitive)
      const foundUser = await User.findOne({
        _id: { $in: participants },
        name: { $regex: new RegExp(`^${task.assignee}$`, 'i') }
      });
      if (foundUser) {
        assignedToId = foundUser._id;
      }
    }

    const newTask = await Task.create({
      title: task.title,
      assignedTo: assignedToId,
      deadline: task.deadline,
      meeting: meetingId,
      status: 'To Do',
    });
    createdTaskIds.push(newTask._id);
    
    // TODO: Send notification to assignedToId (e.g., email or socket)
  }
  
  return createdTaskIds;
};

export const taskService = {
  createTasksFromAI,
};
