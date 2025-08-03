import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { Project } from '../models/projects.model.js';
import { Task } from '../models/tasks.model.js';

/**
 * POST /projects/:projectId/tasks
 * Create a new task under a project
 */
export const createTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { title, description, status, priority, dueDate } = req.body;

  if (!title) throw new ApiError(400, 'Task title is required');

  // verify project exists and belongs to user & not deleted
  const project = await Project.findOne({
    _id: projectId,
    isDeleted: false,
  });
  if (!project) throw new ApiError(404, 'Project not found');
  if (!project.owner.equals(req.user._id)) {
    throw new ApiError(403, 'Unauthorized: cannot add task to this project');
  }

  const task = await Task.create({
    title,
    description: description || '',
    status: status || undefined,
    priority: priority || undefined,
    dueDate: dueDate || null,
    project: projectId,
  });

  return new ApiResponse(201, task, 'Task created successfully').send(res);
});

/**
 * GET /projects/:projectId/tasks
 * List tasks for a project (with optional pagination)
 */
export const getTasksByProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

  // verify project and ownership
  const project = await Project.findOne({
    _id: projectId,
    isDeleted: false,
  });
  if (!project) throw new ApiError(404, 'Project not found');
  if (!project.owner.equals(req.user._id)) {
    throw new ApiError(403, 'Unauthorized: cannot view tasks for this project');
  }

  const filter = {
    project: projectId,
    isDeleted: false,
  };

  const total = await Task.countDocuments(filter);
  const tasks = await Task.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  return new ApiResponse(
    200,
    {
      tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    },
    'Tasks fetched successfully'
  ).send(res);
});

/**
 * PUT /tasks/:id
 * Update title/description/status/priority/dueDate
 */
export const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = (({ title, description, status, priority, dueDate }) => ({
    title,
    description,
    status,
    priority,
    dueDate,
  }))(req.body);

  const task = await Task.findOne({
    _id: id,
    isDeleted: false,
  });
  if (!task) throw new ApiError(404, 'Task not found');

  // verify project ownership
  const project = await Project.findOne({
    _id: task.project,
    isDeleted: false,
  });
  if (!project) throw new ApiError(404, 'Parent project not found');
  if (!project.owner.equals(req.user._id)) {
    throw new ApiError(403, 'Unauthorized: cannot modify task in this project');
  }

  // apply allowed updates
  if (updates.title !== undefined) task.title = updates.title;
  if (updates.description !== undefined) task.description = updates.description;
  if (updates.status !== undefined) task.status = updates.status;
  if (updates.priority !== undefined) task.priority = updates.priority;
  if (updates.dueDate !== undefined) task.dueDate = updates.dueDate;

  await task.save();
  return new ApiResponse(200, task, 'Task updated successfully').send(res);
});

/**
 * DELETE /tasks/:id
 * Soft delete
 */
export const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findOne({
    _id: id,
    isDeleted: false,
  });
  if (!task) throw new ApiError(404, 'Task not found');

  // verify project ownership
  const project = await Project.findOne({
    _id: task.project,
    isDeleted: false,
  });
  if (!project) throw new ApiError(404, 'Parent project not found');
  if (!project.owner.equals(req.user._id)) {
    throw new ApiError(403, 'Unauthorized: cannot delete task in this project');
  }

  task.isDeleted = true;
  await task.save();

  return new ApiResponse(200, null, 'Task deleted successfully').send(res);
});
