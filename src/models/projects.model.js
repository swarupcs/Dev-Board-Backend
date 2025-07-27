import mongoose, { Schema } from 'mongoose';

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      default: '',
      maxlength: 1000,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // For bonus features (e.g., project color, favorite flag)
  },
  { timestamps: true }
);



export const Project = mongoose.model('Project', projectSchema);
