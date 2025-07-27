/**
 * - **`POST /auth/register`** → Register a user
- **`POST /auth/login`** → Login with email/password, return JWT
- **`GET /auth/me`** → Get current user details
 * 
 * 
 */

import express from 'express';
import { getUserDetails, login, register } from '../../controllers/auth.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';


const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', requireAuth, getUserDetails);




export default authRouter;