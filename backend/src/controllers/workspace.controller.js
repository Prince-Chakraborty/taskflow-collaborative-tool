const { query } = require('../config/db');
const AppError = require('../utils/errorHandler');
const { successResponse } = require('../utils/responseHandler');
const { v4: uuidv4 } = require('uuid');

// @desc    Create workspace
// @route   POST /api/workspaces
// @access  Private
const createWorkspace = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    if (!name) {
      return next(new AppError('Workspace name is required', 400));
    }

    // Create workspace
    const result = await query(
      `INSERT INTO workspaces (id, name, description, owner_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [uuidv4(), name, description, userId]
    );

    const workspace = result.rows[0];

    // Add creator as admin member
    await query(
      `INSERT INTO workspace_members (id, workspace_id, user_id, role, joined_at)
       VALUES ($1, $2, $3, 'admin', NOW())`,
      [uuidv4(), workspace.id, userId]
    );

    return successResponse(res, 201, 'Workspace created successfully', workspace);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Get all workspaces for current user
// @route   GET /api/workspaces
// @access  Private
const getMyWorkspaces = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT w.*, wm.role as member_role,
       u.name as owner_name, u.email as owner_email,
       COUNT(DISTINCT b.id) as board_count,
       COUNT(DISTINCT wm2.id) as member_count
       FROM workspaces w
       JOIN workspace_members wm ON w.id = wm.workspace_id
       JOIN users u ON w.owner_id = u.id
       LEFT JOIN boards b ON w.id = b.workspace_id AND b.is_archived = false
       LEFT JOIN workspace_members wm2 ON w.id = wm2.workspace_id
       WHERE wm.user_id = $1
       GROUP BY w.id, wm.role, u.name, u.email
       ORDER BY w.created_at DESC`,
      [userId]
    );

    return successResponse(res, 200, 'Workspaces fetched successfully', result.rows);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Get single workspace
// @route   GET /api/workspaces/:workspaceId
// @access  Private
const getWorkspace = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    const result = await query(
      `SELECT w.*, wm.role as member_role,
       u.name as owner_name
       FROM workspaces w
       JOIN workspace_members wm ON w.id = wm.workspace_id
       JOIN users u ON w.owner_id = u.id
       WHERE w.id = $1 AND wm.user_id = $2`,
      [workspaceId, userId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Workspace not found or access denied', 404));
    }

    return successResponse(res, 200, 'Workspace fetched successfully', result.rows[0]);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Update workspace
// @route   PUT /api/workspaces/:workspaceId
// @access  Private (Admin only)
const updateWorkspace = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { name, description } = req.body;

    const result = await query(
      `UPDATE workspaces SET name = COALESCE($1, name),
       description = COALESCE($2, description),
       updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [name, description, workspaceId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Workspace not found', 404));
    }

    return successResponse(res, 200, 'Workspace updated successfully', result.rows[0]);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Delete workspace
// @route   DELETE /api/workspaces/:workspaceId
// @access  Private (Admin only)
const deleteWorkspace = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    // Check if user is owner
    const workspace = await query(
      'SELECT owner_id FROM workspaces WHERE id = $1',
      [workspaceId]
    );

    if (workspace.rows.length === 0) {
      return next(new AppError('Workspace not found', 404));
    }

    if (workspace.rows[0].owner_id !== userId) {
      return next(new AppError('Only the owner can delete this workspace', 403));
    }

    await query('DELETE FROM workspaces WHERE id = $1', [workspaceId]);

    return successResponse(res, 200, 'Workspace deleted successfully');
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Add member to workspace
// @route   POST /api/workspaces/:workspaceId/members
// @access  Private (Admin only)
const addMember = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { email, role } = req.body;

    // Find user by email
    const userResult = await query(
      'SELECT id, name, email FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return next(new AppError('User with this email not found', 404));
    }

    const user = userResult.rows[0];

    // Check if already a member
    const existingMember = await query(
      'SELECT id FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [workspaceId, user.id]
    );

    if (existingMember.rows.length > 0) {
      return next(new AppError('User is already a member of this workspace', 400));
    }

    // Add member
    await query(
      `INSERT INTO workspace_members (id, workspace_id, user_id, role, joined_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [uuidv4(), workspaceId, user.id, role || 'member']
    );

    return successResponse(res, 201, 'Member added successfully', user);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Get workspace members
// @route   GET /api/workspaces/:workspaceId/members
// @access  Private
const getMembers = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    const result = await query(
      `SELECT u.id, u.name, u.email, u.avatar, wm.role, wm.joined_at
       FROM workspace_members wm
       JOIN users u ON wm.user_id = u.id
       WHERE wm.workspace_id = $1
       ORDER BY wm.joined_at ASC`,
      [workspaceId]
    );

    return successResponse(res, 200, 'Members fetched successfully', result.rows);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Remove member from workspace
// @route   DELETE /api/workspaces/:workspaceId/members/:userId
// @access  Private (Admin only)
const removeMember = async (req, res, next) => {
  try {
    const { workspaceId, userId } = req.params;

    await query(
      'DELETE FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [workspaceId, userId]
    );

    return successResponse(res, 200, 'Member removed successfully');
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

module.exports = {
  createWorkspace,
  getMyWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  getMembers,
  removeMember
};
