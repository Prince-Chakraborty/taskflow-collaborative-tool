const express = require('express');
const router = express.Router();
const {
  createCard,
  getCard,
  updateCard,
  moveCard,
  deleteCard,
  addComment,
  deleteComment,
  addChecklist,
  updateChecklist,
  deleteChecklist,
  searchCards,
  getSubtasks,
  addSubtask,
  toggleSubtask,
  deleteSubtask
} = require('../controllers/card.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes protected
router.use(protect);

// Card routes
router.post('/', createCard);
router.get('/search', searchCards);
router.get('/:cardId', getCard);
router.put('/:cardId', updateCard);
router.put('/:cardId/move', moveCard);
router.delete('/:cardId', deleteCard);

// Comment routes
router.post('/:cardId/comments', addComment);
router.delete('/:cardId/comments/:commentId', deleteComment);

// Checklist routes
router.post('/:cardId/checklists', addChecklist);
router.put('/:cardId/checklists/:checklistId', updateChecklist);
router.delete('/:cardId/checklists/:checklistId', deleteChecklist);

// Subtask routes
router.get('/:cardId/subtasks', protect, getSubtasks);
router.post('/:cardId/subtasks', protect, addSubtask);
router.put('/subtasks/:subtaskId/toggle', protect, toggleSubtask);
router.delete('/subtasks/:subtaskId', protect, deleteSubtask);

module.exports = router;
