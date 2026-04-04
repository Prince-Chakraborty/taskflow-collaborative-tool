const { query } = require('../config/db');
const AppError = require('../utils/errorHandler');
const { successResponse } = require('../utils/responseHandler');
const { v4: uuidv4 } = require('uuid');

// @desc    Create card
// @route   POST /api/cards
// @access  Private
const createCard = async (req, res, next) => {
  try {
    const { title, description, listId, boardId, priority, dueDate, labels } = req.body;
    const userId = req.user.id;

    if (!title || !listId || !boardId) {
      return next(new AppError('Title, list ID and board ID are required', 400));
    }

    // Get max position in list
    const posResult = await query(
      'SELECT COALESCE(MAX(position), -1) as max_pos FROM cards WHERE list_id = $1',
      [listId]
    );
    const position = posResult.rows[0].max_pos + 1;

    const result = await query(
      `INSERT INTO cards (id, title, description, list_id, board_id, created_by, position, priority, due_date, labels, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING *`,
      [uuidv4(), title, description, listId, boardId, userId, position, priority || 'medium', dueDate || null, labels || '{}']
    );

    const card = result.rows[0];

    // Log activity
    await query(
      `INSERT INTO activity_logs (id, board_id, card_id, user_id, action, details, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [uuidv4(), boardId, card.id, userId, 'created_card', JSON.stringify({ cardTitle: title })]
    );

    return successResponse(res, 201, 'Card created successfully', card);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Get card by ID
// @route   GET /api/cards/:cardId
// @access  Private
const getCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;

    const cardResult = await query(
      `SELECT c.*,
       u1.name as created_by_name, u1.avatar as created_by_avatar,
       u2.name as assigned_to_name, u2.avatar as assigned_to_avatar,
       l.name as list_name
       FROM cards c
       LEFT JOIN users u1 ON c.created_by = u1.id
       LEFT JOIN users u2 ON c.assigned_to = u2.id
       LEFT JOIN lists l ON c.list_id = l.id
       WHERE c.id = $1`,
      [cardId]
    );

    if (cardResult.rows.length === 0) {
      return next(new AppError('Card not found', 404));
    }

    const card = cardResult.rows[0];

    // Get checklists
    const checklistResult = await query(
      'SELECT * FROM checklists WHERE card_id = $1 ORDER BY position ASC',
      [cardId]
    );

    // Get comments
    const commentsResult = await query(
      `SELECT cm.*, u.name as user_name, u.avatar as user_avatar
       FROM comments cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.card_id = $1
       ORDER BY cm.created_at ASC`,
      [cardId]
    );

    // Get attachments
    const attachmentsResult = await query(
      `SELECT a.*, u.name as uploaded_by_name
       FROM attachments a
       LEFT JOIN users u ON a.uploaded_by = u.id
       WHERE a.card_id = $1
       ORDER BY a.created_at DESC`,
      [cardId]
    );

    return successResponse(res, 200, 'Card fetched successfully', {
      ...card,
      checklists: checklistResult.rows,
      comments: commentsResult.rows,
      attachments: attachmentsResult.rows
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Update card
// @route   PUT /api/cards/:cardId
// @access  Private
const updateCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { title, description, priority, dueDate, labels, assignedTo, version } = req.body;
    const userId = req.user.id;

    // Optimistic locking - concurrency check
    if (version !== undefined) {
      const currentCard = await query('SELECT version FROM cards WHERE id = $1', [cardId]);
      if (currentCard.rows.length > 0 && currentCard.rows[0].version !== parseInt(version)) {
        return res.status(409).json({
          success: false,
          message: 'This card was modified by another user. Please refresh and try again.'
        });
      }
    }

    const result = await query(
      `UPDATE cards SET
       title = COALESCE($1, title),
       description = COALESCE($2, description),
       priority = COALESCE($3, priority),
       due_date = COALESCE($4, due_date),
       labels = COALESCE($5, labels),
       assigned_to = COALESCE($6, assigned_to),
       updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title, description, priority, dueDate, labels, assignedTo, cardId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Card not found', 404));
    }

    const card = result.rows[0];

    // Log activity
    await query(
      `INSERT INTO activity_logs (id, board_id, card_id, user_id, action, details, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [uuidv4(), card.board_id, cardId, userId, 'updated_card', JSON.stringify({ cardTitle: card.title })]
    );

    return successResponse(res, 200, 'Card updated successfully', card);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Move card (drag and drop)
// @route   PUT /api/cards/:cardId/move
// @access  Private
const moveCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { listId, position } = req.body;
    const userId = req.user.id;

    // Get old list info
    const oldCard = await query('SELECT list_id, board_id, title FROM cards WHERE id = $1', [cardId]);
    if (oldCard.rows.length === 0) {
      return next(new AppError('Card not found', 404));
    }

    const oldListId = oldCard.rows[0].list_id;
    const boardId = oldCard.rows[0].board_id;
    const cardTitle = oldCard.rows[0].title;

    // Get old and new list names for activity log
    const listsResult = await query(
      'SELECT id, name FROM lists WHERE id = ANY($1)',
      [[oldListId, listId]]
    );

    const listsMap = {};
    listsResult.rows.forEach(l => { listsMap[l.id] = l.name; });

    // Update positions of cards in old list
    await query(
      `UPDATE cards SET position = position - 1
       WHERE list_id = $1 AND position > (SELECT position FROM cards WHERE id = $2)`,
      [oldListId, cardId]
    );

    // Update positions of cards in new list
    await query(
      `UPDATE cards SET position = position + 1
       WHERE list_id = $1 AND position >= $2`,
      [listId, position]
    );

    // Move the card
    const result = await query(
      `UPDATE cards SET list_id = $1, position = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [listId, position, cardId]
    );

    // Log activity
    await query(
      `INSERT INTO activity_logs (id, board_id, card_id, user_id, action, details, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        uuidv4(), boardId, cardId, userId, 'moved_card',
        JSON.stringify({
          cardTitle,
          fromList: listsMap[oldListId] || oldListId,
          toList: listsMap[listId] || listId
        })
      ]
    );

    return successResponse(res, 200, 'Card moved successfully', result.rows[0]);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Delete card
// @route   DELETE /api/cards/:cardId
// @access  Private
const deleteCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;

    await query('DELETE FROM cards WHERE id = $1', [cardId]);

    return successResponse(res, 200, 'Card deleted successfully');
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Add comment to card
// @route   POST /api/cards/:cardId/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return next(new AppError('Comment content is required', 400));
    }

    const result = await query(
      `INSERT INTO comments (id, card_id, user_id, content, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [uuidv4(), cardId, userId, content]
    );

    const comment = result.rows[0];

    // Get user info
    const userResult = await query(
      'SELECT name, avatar FROM users WHERE id = $1',
      [userId]
    );

    // Get board_id for activity log
    const cardResult = await query('SELECT board_id FROM cards WHERE id = $1', [cardId]);

    // Log activity
    await query(
      `INSERT INTO activity_logs (id, board_id, card_id, user_id, action, details, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [uuidv4(), cardResult.rows[0].board_id, cardId, userId, 'added_comment', JSON.stringify({ comment: content })]
    );

    return successResponse(res, 201, 'Comment added successfully', {
      ...comment,
      user_name: userResult.rows[0].name,
      user_avatar: userResult.rows[0].avatar
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Delete comment
// @route   DELETE /api/cards/:cardId/comments/:commentId
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const result = await query(
      'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING id',
      [commentId, userId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Comment not found or not authorized', 404));
    }

    return successResponse(res, 200, 'Comment deleted successfully');
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Add checklist item
// @route   POST /api/cards/:cardId/checklists
// @access  Private
const addChecklist = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { title } = req.body;

    if (!title) {
      return next(new AppError('Checklist title is required', 400));
    }

    const posResult = await query(
      'SELECT COALESCE(MAX(position), -1) as max_pos FROM checklists WHERE card_id = $1',
      [cardId]
    );
    const position = posResult.rows[0].max_pos + 1;

    const result = await query(
      `INSERT INTO checklists (id, card_id, title, is_completed, position, created_at)
       VALUES ($1, $2, $3, false, $4, NOW())
       RETURNING *`,
      [uuidv4(), cardId, title, position]
    );

    return successResponse(res, 201, 'Checklist item added successfully', result.rows[0]);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Update checklist item
// @route   PUT /api/cards/:cardId/checklists/:checklistId
// @access  Private
const updateChecklist = async (req, res, next) => {
  try {
    const { checklistId } = req.params;
    const { title, isCompleted } = req.body;

    const result = await query(
      `UPDATE checklists SET
       title = COALESCE($1, title),
       is_completed = COALESCE($2, is_completed)
       WHERE id = $3
       RETURNING *`,
      [title, isCompleted, checklistId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Checklist item not found', 404));
    }

    return successResponse(res, 200, 'Checklist updated successfully', result.rows[0]);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Delete checklist item
// @route   DELETE /api/cards/:cardId/checklists/:checklistId
// @access  Private
const deleteChecklist = async (req, res, next) => {
  try {
    const { checklistId } = req.params;

    await query('DELETE FROM checklists WHERE id = $1', [checklistId]);

    return successResponse(res, 200, 'Checklist item deleted successfully');
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Search cards
// @route   GET /api/cards/search?q=query&boardId=id
// @access  Private
const searchCards = async (req, res, next) => {
  try {
    const { q, boardId, priority, assignedTo, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let queryStr = `
      SELECT c.*, u.name as assigned_to_name, l.name as list_name
      FROM cards c
      LEFT JOIN users u ON c.assigned_to = u.id
      LEFT JOIN lists l ON c.list_id = l.id
      WHERE c.is_archived = false
    `;
    const params = [];
    let paramCount = 1;

    if (boardId) {
      queryStr += ` AND c.board_id = $${paramCount}`;
      params.push(boardId);
      paramCount++;
    }

    if (q) {
      queryStr += ` AND (c.title ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`;
      params.push(`%${q}%`);
      paramCount++;
    }

    if (priority) {
      queryStr += ` AND c.priority = $${paramCount}`;
      params.push(priority);
      paramCount++;
    }

    if (assignedTo) {
      queryStr += ` AND c.assigned_to = $${paramCount}`;
      params.push(assignedTo);
      paramCount++;
    }

    queryStr += ` ORDER BY c.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`;

    const result = await query(queryStr, params);

    return successResponse(res, 200, 'Cards found', result.rows);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


// @desc    Get subtasks for a card
const getSubtasks = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const result = await query(
      'SELECT * FROM subtasks WHERE card_id = $1 ORDER BY position ASC',
      [cardId]
    );
    return successResponse(res, 200, 'Subtasks fetched', result.rows);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Add subtask to card
const addSubtask = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { title } = req.body;
    const userId = req.user.id;
    if (!title?.trim()) return next(new AppError('Title is required', 400));
    const posResult = await query(
      'SELECT COUNT(*) FROM subtasks WHERE card_id = $1',
      [cardId]
    );
    const position = parseInt(posResult.rows[0].count);
    const result = await query(
      'INSERT INTO subtasks (card_id, title, position, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [cardId, title.trim(), position, userId]
    );
    return successResponse(res, 201, 'Subtask added', result.rows[0]);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Toggle subtask completion
const toggleSubtask = async (req, res, next) => {
  try {
    const { subtaskId } = req.params;
    const result = await query(
      'UPDATE subtasks SET is_completed = NOT is_completed, updated_at = NOW() WHERE id = $1 RETURNING *',
      [subtaskId]
    );
    return successResponse(res, 200, 'Subtask updated', result.rows[0]);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Delete subtask
const deleteSubtask = async (req, res, next) => {
  try {
    const { subtaskId } = req.params;
    await query('DELETE FROM subtasks WHERE id = $1', [subtaskId]);
    return successResponse(res, 200, 'Subtask deleted', {});
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

module.exports = {
  createCard,
  getCard,
  updateCard,
  getSubtasks,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  moveCard,
  deleteCard,
  addComment,
  deleteComment,
  addChecklist,
  updateChecklist,
  deleteChecklist,
  searchCards
};
