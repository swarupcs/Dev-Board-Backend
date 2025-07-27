import mongoose, { Schema } from 'mongoose';

/**
 * API Key Schema
 * - key: The unique API key string (hash or secure random).
 * - user: Reference to the User who owns this API key.
 * - isActive: Whether the key is currently active.
 * - createdAt: When the key was created.
 * - expiresAt: Optional - automatic expiry support (can be used for rotation).
 */
const apiKeySchema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    // In production, store a HASH of the key, not the raw value.
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Faster lookup for user-based queries
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  expiresAt: {
    type: Date,
    default: null, // Set if you want rotating keys or limited lifespan
  },
});

// (Optional) Set TTL index to auto-remove expired API keys (if needed)
// apiKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ApiKey = mongoose.model('ApiKey', apiKeySchema);
