const express = require('express');
const router = express.Router();
const {
  createBoard,
  getBoardsByWorkspace,
  getBoard,
  updateBoard,
  deleteBoard,
  createList,
  updateList,
  deleteList,
  getBoardActivity
} = require('../controllers/board.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes protected
router.use(protect);

// Board routes
router.post('/', createBoard);
router.get('/workspace/:workspaceId', getBoardsByWorkspace);
router.get('/:boardId', getBoard);
router.put('/:boardId', updateBoard);
router.delete('/:boardId', deleteBoard);

// List routes
router.post('/:boardId/lists', createList);
router.put('/:boardId/lists/:listId', updateList);
router.delete('/:boardId/lists/:listId', deleteList);

// Activity routes
router.get('/:boardId/activity', getBoardActivity);

module.exports = router;
