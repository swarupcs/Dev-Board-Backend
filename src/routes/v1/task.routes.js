import express from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validateApiKey } from '../../middlewares/apiKey.middleware.js';
import { createTask, deleteTask, getTasksByProject, updateTask } from '../../controllers/task.controller.js';


const taskRouter = express.Router();


// All task-related routes require JWT + API key
taskRouter.use(requireAuth);
taskRouter.use(validateApiKey);

// Create task under a project
taskRouter.post('/projects/:projectId/tasks', createTask);

// List tasks for a project
taskRouter.get('/projects/:projectId/tasks', getTasksByProject);

// Update/delete by task id
taskRouter.put('/tasks/:id', updateTask);
taskRouter.delete('/tasks/:id', deleteTask);

export default taskRouter;