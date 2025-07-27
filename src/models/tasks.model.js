import mongoose, { Schema } from 'mongoose';

const taskSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    description: {
      type: String,
      default: '',
      maxlength: 2000,
      trim: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // For bonus: support attachments, comments, etc.
  },
  { timestamps: true }
);

export const Task = mongoose.model('Task', taskSchema);
