import express from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validateApiKey } from '../../middlewares/apiKey.middleware.js';
import { createProject, deleteProject, getProjectById, getProjects, updateProject } from '../../controllers/project.controller.js';


const projectRouter = express.Router();


// All project routes require JWT and valid API key
projectRouter.use(requireAuth);
projectRouter.use(validateApiKey);

projectRouter.post('/', createProject);
projectRouter.get('/', getProjects);
projectRouter.get('/:id', getProjectById);
projectRouter.put('/:id', updateProject);
projectRouter.delete('/:id', deleteProject);

export default projectRouter;