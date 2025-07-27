/**
 * - **`POST /auth/register`** → Register a user
- **`POST /auth/login`** → Login with email/password, return JWT
- **`GET /auth/me`** → Get current user details
 * 
 * 
 */

import express from 'express';
import { register } from '../../controllers/auth.controller.js';


const authRouter = express.Router();

authRouter.post('/register', register);



export default authRouter;