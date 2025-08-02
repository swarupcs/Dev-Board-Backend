import { ApiKey } from "../models/apiKey.model.js";
import { ApiError } from "../utils/api-error.js";

export const validateApiKey = async (req, res, next) => {
  try {
    const raw = req.headers['x-api-key'];
    if (!raw) {
      throw new ApiError(403, 'API key required');
    }

    const record = await ApiKey.findOne({ key: raw, isActive: true });

    if (!record) {
      throw new ApiError(403, 'Invalid or inactive API key');
    }

    if (record.expiresAt && record.expiresAt < new Date()) {
      throw new ApiError(403, 'API key expired');
    }

    // Optionally enforce that JWT user and API key owner match
    if (req.user && !record.user.equals(req.user._id)) {
      throw new ApiError(403, 'API key does not belong to authenticated user');
    }

    req.apiKeyOwner = record.user;
    next();
  } catch (err) {
    next(err);
  }
};
