import mongoose, { Schema } from 'mongoose';

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    meeting: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Done'],
      default: 'To Do',
    },
    deadline: { type: String }, // Keep simple as string from AI
  },
  { timestamps: true }
);

export const Task = mongoose.model('Task', taskSchema);
