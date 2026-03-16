# Requirements Traceability Matrix (RTM)
## TaskFlow — Real-Time Collaborative Management Tool

| Req ID | Requirement | Module | Test Case | Status |
|--------|------------|--------|-----------|--------|
| REQ-01 | User can sign up with name, email, password | Auth | TC-01: Valid signup | ✅ Pass |
| REQ-02 | User cannot sign up with invalid email | Auth | TC-02: Invalid email returns 400 | ✅ Pass |
| REQ-03 | User cannot sign up with short password | Auth | TC-03: Short password returns 400 | ✅ Pass |
| REQ-04 | Duplicate email returns error | Auth | TC-04: Duplicate email returns 400 | ✅ Pass |
| REQ-05 | User can login with correct credentials | Auth | TC-05: Valid login returns 200 | ✅ Pass |
| REQ-06 | User cannot login with wrong password | Auth | TC-06: Wrong password returns 401 | ✅ Pass |
| REQ-07 | Non-existent user returns error | Auth | TC-07: Unknown user returns 401 | ✅ Pass |
| REQ-08 | Empty login body returns error | Auth | TC-08: Empty body returns 400 | ✅ Pass |
| REQ-09 | All API endpoints require authentication | Security | TC-09: No token returns 401 | ✅ Pass |
| REQ-10 | Invalid token is rejected | Security | TC-10: Invalid token returns 401 | ✅ Pass |
| REQ-11 | JWT refresh token rotation | Auth | TC-11: Refresh token works | ✅ Pass |
| REQ-12 | User can create workspace | Workspace | TC-12: Create workspace | ✅ Pass |
| REQ-13 | User can view their workspaces | Workspace | TC-13: Get workspaces | ✅ Pass |
| REQ-14 | User can create board in workspace | Board | TC-14: Create board | ✅ Pass |
| REQ-15 | User can view board with lists and cards | Board | TC-15: Get board | ✅ Pass |
| REQ-16 | User can create list on board | Board | TC-16: Create list | ✅ Pass |
| REQ-17 | User can create card in list | Card | TC-17: Create card | ✅ Pass |
| REQ-18 | User can update card details | Card | TC-18: Update card | ✅ Pass |
| REQ-19 | User can move card between lists | Card | TC-19: Move card | ✅ Pass |
| REQ-20 | User can delete card | Card | TC-20: Delete card | ✅ Pass |
| REQ-21 | Drag and drop cards between columns | Board UI | TC-21: DnD works | ✅ Pass |
| REQ-22 | Real-time sync across browsers | Socket | TC-22: Socket sync | ✅ Pass |
| REQ-23 | User can add comment to card | Comment | TC-23: Add comment | ✅ Pass |
| REQ-24 | User can add checklist to card | Checklist | TC-24: Add checklist | ✅ Pass |
| REQ-25 | User can upload file to card | Upload | TC-25: Upload file | ✅ Pass |
| REQ-26 | Activity log records all changes | Activity | TC-26: Activity logged | ✅ Pass |
| REQ-27 | Search cards within board | Search | TC-27: Search works | ✅ Pass |
| REQ-28 | Filter cards by priority | Filter | TC-28: Filter works | ✅ Pass |
| REQ-29 | Rate limiting on API endpoints | Security | TC-29: Rate limit | ✅ Pass |
| REQ-30 | XSS prevention | Security | TC-30: XSS blocked | ✅ Pass |
| REQ-31 | SQL injection prevention | Security | TC-31: SQL safe | ✅ Pass |
| REQ-32 | Dark/Light mode toggle | UI | TC-32: Theme toggle | ✅ Pass |
| REQ-33 | Mobile responsive design | UI | TC-33: Mobile layout | ✅ Pass |
| REQ-34 | Loading skeletons | UI | TC-34: Skeletons show | ✅ Pass |
| REQ-35 | Empty states | UI | TC-35: Empty states | ✅ Pass |
| REQ-36 | Notifications bell | UI | TC-36: Bell works | ✅ Pass |
| REQ-37 | Progress bars on columns | UI | TC-37: Progress bars | ✅ Pass |
| REQ-38 | Keyboard shortcut N = new card | UI | TC-38: Shortcut works | ✅ Pass |
| REQ-39 | Role-based access control | Security | TC-39: RBAC works | ✅ Pass |
| REQ-40 | Concurrent edit handling | Backend | TC-40: Version lock | ✅ Pass |

## Coverage Summary
```
Total Requirements: 40
Tests Written:      40
Tests Passing:      40
Coverage:           100%
```
