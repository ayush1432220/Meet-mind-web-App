import mongoose, { Schema } from 'mongoose';

const speakerStatSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  speakTime: { type: Number, default: 0 }, // in seconds
});

const transcriptEntrySchema = new Schema({
  speakerName: { type: String, required: true },
  speakerId: { type: String }, // Can be Zoom user ID
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const meetingSchema = new Schema(
  {
    zoomMeetingId: { type: String, required: true, unique: true },
    title: { type: String, required: true, default: 'Untitled Meeting' },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    host: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['SCHEDULED', 'LIVE', 'PROCESSING', 'COMPLETED', 'ERROR'],
      default: 'SCHEDULED',
    },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    audioS3Url: { type: String },
    transcript: [transcriptEntrySchema],
    summary: { type: String },
    keyDecisions: [{ type: String }],
    actionItems: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    analytics: {
      speakerStats: [speakerStatSchema],
      wordCloud: { type: Map, of: Number },
      sentiment: { type: String, enum: ['Positive', 'Negative', 'Neutral'] }
    },
  },
  { timestamps: true }
);

export const Meeting = mongoose.model('Meeting', meetingSchema);
