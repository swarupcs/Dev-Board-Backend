/**
 * - **`POST /auth/register`** → Register a user
- **`POST /auth/login`** → Login with email/password, return JWT
- **`GET /auth/me`** → Get current user details
 * 
 * 
 */

import express from 'express';


const authRouter = express.Router();



export default authRouter;