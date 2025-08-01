/**
 * - **`POST /auth/register`** → Register a user
- **`POST /auth/login`** → Login with email/password, return JWT
- **`GET /auth/me`** → Get current user details
 * 
 * 
 */

import express from 'express';
import { checkAdminAccess, generateUserApiKey, getUserDetails, login, logout, register } from '../../controllers/auth.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';


const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', requireAuth, getUserDetails);
authRouter.post('/logout', requireAuth, logout);
// add rate limiting middleware here if needed
authRouter.post('/api-key', requireAuth, generateUserApiKey);


authRouter.get('/checkAdmin', requireAuth, checkAdminAccess);


export default authRouter;