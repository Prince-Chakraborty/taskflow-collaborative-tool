const express = require('express');
const router = express.Router();
const {
  createWorkspace,
  getMyWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  getMembers,
  removeMember
} = require('../controllers/workspace.controller');
const { protect } = require('../middleware/auth.middleware');
const { isWorkspaceAdmin, isWorkspaceMember } = require('../middleware/role.middleware');

// All routes protected
router.use(protect);

router.post('/', createWorkspace);
router.get('/', getMyWorkspaces);
router.get('/:workspaceId', isWorkspaceMember, getWorkspace);
router.put('/:workspaceId', isWorkspaceAdmin, updateWorkspace);
router.delete('/:workspaceId', deleteWorkspace);

// Member routes
router.post('/:workspaceId/members', isWorkspaceAdmin, addMember);
router.get('/:workspaceId/members', isWorkspaceMember, getMembers);
router.delete('/:workspaceId/members/:userId', isWorkspaceAdmin, removeMember);

module.exports = router;
