const { query } = require('../config/db');
const AppError = require('../utils/errorHandler');

// Check if user is workspace member
const isWorkspaceMember = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    const userId = req.user.id;

    const result = await query(
      'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [workspaceId, userId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('You are not a member of this workspace', 403));
    }

    req.workspaceRole = result.rows[0].role;
    next();
  } catch (err) {
    return next(new AppError('Error checking workspace membership', 500));
  }
};

// Check if user is workspace admin
const isWorkspaceAdmin = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    const userId = req.user.id;

    const result = await query(
      'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [workspaceId, userId]
    );

    if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
      return next(new AppError('You must be an admin to perform this action', 403));
    }

    req.workspaceRole = result.rows[0].role;
    next();
  } catch (err) {
    return next(new AppError('Error checking workspace role', 500));
  }
};

module.exports = { isWorkspaceMember, isWorkspaceAdmin };
