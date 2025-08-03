import { Project } from "../models/projects.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

/**
 * POST /projects
 */
export const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) throw new ApiError(400, 'Project name is required');
  if (!description) throw new ApiError(400, 'Description is required');

  const project = await Project.create({
    name,
    description: description || '',
    owner: req.user._id,
  });

  return new ApiResponse(201, project, 'Project created successfully').send(
    res
  );
});

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    owner: req.user._id,
    isDeleted: false,
  }).sort({ createdAt: -1 });

  return new ApiResponse(200, projects, 'Projects fetched successfully').send(
    res
  );
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!project) throw new ApiError(404, 'Project not found');
  if (!project.owner.equals(req.user._id)) {
    throw new ApiError(403, 'Unauthorized access to project');
  }

  return new ApiResponse(200, project, 'Project retrieved successfully').send(
    res
  );
});

export const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const project = await Project.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!project) throw new ApiError(404, 'Project not found');
  if (!project.owner.equals(req.user._id)) {
    throw new ApiError(403, 'Only owner can update this project');
  }

  if (name !== undefined) project.name = name;
  if (description !== undefined) project.description = description;

  await project.save();
  return new ApiResponse(200, project, 'Project updated successfully').send(
    res
  );
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!project) throw new ApiError(404, 'Project not found');
  if (!project.owner.equals(req.user._id)) {
    throw new ApiError(403, 'Only owner can delete this project');
  }

  project.isDeleted = true;
  await project.save();

  return new ApiResponse(200, null, 'Project deleted successfully').send(res);
});
