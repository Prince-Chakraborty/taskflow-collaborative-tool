const { query, withTransaction } = require('../config/db');
const AppError = require('../utils/errorHandler');
const { successResponse } = require('../utils/responseHandler');
const { v4: uuidv4 } = require('uuid');

// @desc    Create board
// @route   POST /api/boards
// @access  Private
const createBoard = async (req, res, next) => {
  try {
    const { name, description, workspaceId, backgroundColor } = req.body;
    const userId = req.user.id;

    if (!name || !workspaceId) {
      return next(new AppError('Board name and workspace ID are required', 400));
    }

    // Check if user is workspace member
    const memberCheck = await query(
      'SELECT id FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [workspaceId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return next(new AppError('You are not a member of this workspace', 403));
    }

    const result = await query(
      `INSERT INTO boards (id, name, description, workspace_id, created_by, background_color, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [uuidv4(), name, description, workspaceId, userId, backgroundColor || '#0079BF']
    );

    const board = result.rows[0];

    // Create default lists
    const defaultLists = ['To Do', 'In Progress', 'Done'];
    for (let i = 0; i < defaultLists.length; i++) {
      await query(
        `INSERT INTO lists (id, name, board_id, position, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [uuidv4(), defaultLists[i], board.id, i]
      );
    }

    // Log activity
    await query(
      `INSERT INTO activity_logs (id, board_id, user_id, action, details, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [uuidv4(), board.id, userId, 'created_board', JSON.stringify({ boardName: name })]
    );

    return successResponse(res, 201, 'Board created successfully', board);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Get all boards in a workspace
// @route   GET /api/boards/workspace/:workspaceId
// @access  Private
const getBoardsByWorkspace = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    // Check membership
    const memberCheck = await query(
      'SELECT id FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [workspaceId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return next(new AppError('Access denied', 403));
    }

    const result = await query(
      `SELECT b.*, u.name as created_by_name,
       COUNT(DISTINCT l.id) as list_count,
       COUNT(DISTINCT c.id) as card_count
       FROM boards b
       LEFT JOIN users u ON b.created_by = u.id
       LEFT JOIN lists l ON b.id = l.board_id AND l.is_archived = false
       LEFT JOIN cards c ON b.id = c.board_id AND c.is_archived = false
       WHERE b.workspace_id = $1 AND b.is_archived = false
       GROUP BY b.id, u.name
       ORDER BY b.created_at DESC`,
      [workspaceId]
    );

    return successResponse(res, 200, 'Boards fetched successfully', result.rows);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Get single board with lists and cards
// @route   GET /api/boards/:boardId
// @access  Private
const getBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.id;

    // Get board
    const boardResult = await query(
      `SELECT b.*, u.name as created_by_name
       FROM boards b
       LEFT JOIN users u ON b.created_by = u.id
       WHERE b.id = $1 AND b.is_archived = false`,
      [boardId]
    );

    if (boardResult.rows.length === 0) {
      return next(new AppError('Board not found', 404));
    }

    const board = boardResult.rows[0];

    // Check membership
    const memberCheck = await query(
      'SELECT id FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [board.workspace_id, userId]
    );

    if (memberCheck.rows.length === 0) {
      return next(new AppError('Access denied', 403));
    }

    // Get lists
    const listsResult = await query(
      `SELECT * FROM lists WHERE board_id = $1 AND is_archived = false ORDER BY position ASC`,
      [boardId]
    );

    // Get cards for each list
    const cardsResult = await query(
      `SELECT c.*, 
       u1.name as created_by_name,
       u2.name as assigned_to_name,
       u2.avatar as assigned_to_avatar
       FROM cards c
       LEFT JOIN users u1 ON c.created_by = u1.id
       LEFT JOIN users u2 ON c.assigned_to = u2.id
       WHERE c.board_id = $1 AND c.is_archived = false
       ORDER BY c.position ASC`,
      [boardId]
    );

    // Attach cards to lists
    const lists = listsResult.rows.map(list => ({
      ...list,
      cards: cardsResult.rows.filter(card => card.list_id === list.id)
    }));

    return successResponse(res, 200, 'Board fetched successfully', {
      ...board,
      lists
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Update board
// @route   PUT /api/boards/:boardId
// @access  Private
const updateBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { name, description, backgroundColor } = req.body;

    const result = await query(
      `UPDATE boards SET 
       name = COALESCE($1, name),
       description = COALESCE($2, description),
       background_color = COALESCE($3, background_color),
       updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, description, backgroundColor, boardId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Board not found', 404));
    }

    return successResponse(res, 200, 'Board updated successfully', result.rows[0]);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Delete board
// @route   DELETE /api/boards/:boardId
// @access  Private
const deleteBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;

    await query('DELETE FROM boards WHERE id = $1', [boardId]);

    return successResponse(res, 200, 'Board deleted successfully');
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Create list in board
// @route   POST /api/boards/:boardId/lists
// @access  Private
const createList = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
      return next(new AppError('List name is required', 400));
    }

    // Get max position
    const posResult = await query(
      'SELECT COALESCE(MAX(position), -1) as max_pos FROM lists WHERE board_id = $1',
      [boardId]
    );
    const position = posResult.rows[0].max_pos + 1;

    const result = await query(
      `INSERT INTO lists (id, name, board_id, position, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [uuidv4(), name, boardId, position]
    );

    // Log activity
    await query(
      `INSERT INTO activity_logs (id, board_id, user_id, action, details, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [uuidv4(), boardId, userId, 'created_list', JSON.stringify({ listName: name })]
    );

    return successResponse(res, 201, 'List created successfully', result.rows[0]);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Update list
// @route   PUT /api/boards/:boardId/lists/:listId
// @access  Private
const updateList = async (req, res, next) => {
  try {
    const { listId } = req.params;
    const { name, position } = req.body;

    const result = await query(
      `UPDATE lists SET
       name = COALESCE($1, name),
       position = COALESCE($2, position),
       updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [name, position, listId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('List not found', 404));
    }

    return successResponse(res, 200, 'List updated successfully', result.rows[0]);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Delete list
// @route   DELETE /api/boards/:boardId/lists/:listId
// @access  Private
const deleteList = async (req, res, next) => {
  try {
    const { listId } = req.params;

    await query('DELETE FROM lists WHERE id = $1', [listId]);

    return successResponse(res, 200, 'List deleted successfully');
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Get activity logs for board
// @route   GET /api/boards/:boardId/activity
// @access  Private
const getBoardActivity = async (req, res, next) => {
  try {
    const { boardId } = req.params;

    const result = await query(
      `SELECT al.*, u.name as user_name, u.avatar as user_avatar
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.board_id = $1
       ORDER BY al.created_at DESC
       LIMIT 50`,
      [boardId]
    );

    return successResponse(res, 200, 'Activity fetched successfully', result.rows);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

module.exports = {
  createBoard,
  getBoardsByWorkspace,
  getBoard,
  updateBoard,
  deleteBoard,
  createList,
  updateList,
  deleteList,
  getBoardActivity
};
