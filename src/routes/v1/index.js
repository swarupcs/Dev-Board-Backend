import express from 'express';
import authRouter from './auth.routes.js';
import healthCheckRouter from './healthCheck.routes.js';
import projectRouter from './project.routes.js';

const v1Router = express.Router();

v1Router.use('/auth', authRouter);
v1Router.use('/health-check', healthCheckRouter);
v1Router.use('/projects', projectRouter);


export default v1Router;