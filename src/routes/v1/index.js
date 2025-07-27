import express from 'express';
import authRouter from './auth.routes.js';
import healthCheckRouter from './healthCheck.routes.js';

const v1Router = express.Router();

v1Router.use('/auth', authRouter);
v1Router.use('/', healthCheckRouter);


export default v1Router;