// utils/apiKey.js
import { randomBytes, createHash } from 'crypto';

export const generateRawApiKey = () => {
  return randomBytes(32).toString('hex'); // 64-char hex
};

export const hashKey = (raw) => {
  return createHash('sha256').update(raw).digest('hex');
};
