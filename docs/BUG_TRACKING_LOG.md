# TaskFlow — Bug Tracking Log

## Summary
| Total Bugs | Critical | Major | Minor | Fixed | Open |
|-----------|---------|-------|-------|-------|------|
| 22 | 3 | 8 | 11 | 22 | 0 |

---

## Bug Reports

### BUG-001 — Critical
**Title**: Board column headers hidden behind navbar  
**Severity**: Critical  
**Priority**: P1  
**Status**: ✅ Fixed  
**Description**: Board page used `h-screen overflow-hidden` causing column headers to be cut off behind the navbar.  
**Steps to Reproduce**:
1. Login → open any board
2. Column headers (To Do, In Progress, Done) not visible
**Fix**: Changed layout to use `marginLeft: 256px, paddingTop: 56px` with proper flex column layout.

---

### BUG-002 — Critical
**Title**: Login fails with correct credentials  
**Severity**: Critical  
**Priority**: P1  
**Status**: ✅ Fixed  
**Description**: After migrating to Neon DB, users could not login because local DB users were not migrated.  
**Steps to Reproduce**:
1. Enter correct email/password
2. Gets "Invalid email or password"
**Fix**: Migrated all users from local PostgreSQL to Neon using COPY command.

---

### BUG-003 — Critical
**Title**: File uploads failing silently  
**Severity**: Critical  
**Priority**: P1  
**Status**: ✅ Fixed  
**Description**: Cloudinary credentials were placeholder values causing all file uploads to fail.  
**Steps to Reproduce**:
1. Open card modal → Attachments tab
2. Try uploading file → fails
**Fix**: Added real Cloudinary credentials to .env file.

---

### BUG-004 — Major
**Title**: Workspace board cards cut off on left edge  
**Severity**: Major  
**Priority**: P2  
**Status**: ✅ Fixed  
**Description**: Board card names (Jp, Pbc) were being clipped by the sidebar overlap.  
**Fix**: Added `paddingLeft: 16px` to workspace page container.

---

### BUG-005 — Major
**Title**: Navbar search redirects to dashboard  
**Severity**: Major  
**Priority**: P2  
**Status**: ✅ Fixed  
**Description**: Typing in navbar search bar redirected user away from board page.  
**Fix**: Disabled navbar search redirect, board page has its own search.

---

### BUG-006 — Major
**Title**: Card modal background black instead of blur overlay  
**Severity**: Major  
**Priority**: P2  
**Status**: ✅ Fixed  
**Description**: Card modal overlay was completely black, hiding the board behind it.  
**Fix**: Changed to `bg-black/50 backdrop-blur-sm` with correct z-index.

---

### BUG-007 — Major
**Title**: Socket disconnect showing as error  
**Severity**: Major  
**Priority**: P2  
**Status**: ✅ Fixed  
**Description**: Socket disconnect log used ❌ emoji causing confusion with real errors.  
**Fix**: Changed to 🔌 emoji for disconnect messages.

---

### BUG-008 — Major
**Title**: Stray }; causing syntax error in Navbar  
**Severity**: Major  
**Priority**: P2  
**Status**: ✅ Fixed  
**Description**: handleSearch function deletion left orphaned closing brace causing compile error.  
**Fix**: Removed stray }; from Navbar.tsx line 24.

---

### BUG-009 — Major
**Title**: Progress bar hardcoded values  
**Severity**: Major  
**Priority**: P2  
**Status**: ✅ Fixed  
**Description**: Progress bars showed hardcoded 60% for In Progress, 100% for Done regardless of actual card count.  
**Fix**: Made progress bars dynamic based on actual card counts per column.

---

### BUG-010 — Major
**Title**: TypeScript errors in Board and Card types  
**Severity**: Major  
**Priority**: P2  
**Status**: ✅ Fixed  
**Description**: Board type missing list_count/card_count, Card type missing list_name.  
**Fix**: Added missing fields to TypeScript interfaces in types/index.ts.

---

### BUG-011 — Major
**Title**: cardAPI.move sending extra boardId parameter  
**Severity**: Major  
**Priority**: P2  
**Status**: ✅ Fixed  
**Description**: Board.tsx was sending boardId in cardAPI.move body which caused TypeScript error.  
**Fix**: Removed boardId from cardAPI.move params.

---

### BUG-012 — Minor
**Title**: Dashboard stats grid breaks on mobile  
**Severity**: Minor  
**Priority**: P3  
**Status**: ✅ Fixed  
**Description**: Stats grid used fixed grid-cols-3 with no responsive breakpoints.  
**Fix**: Changed to `grid-cols-1 sm:grid-cols-3`.

---

### BUG-013 — Minor
**Title**: "1 members" grammatically incorrect  
**Severity**: Minor  
**Priority**: P3  
**Status**: ✅ Fixed  
**Description**: Dashboard showed "1 members" instead of "1 member".  
**Fix**: Added conditional: `count === 1 ? "member" : "members"`.

---

### BUG-014 — Minor
**Title**: Add List button invisible on dark background  
**Severity**: Minor  
**Priority**: P3  
**Status**: ✅ Fixed  
**Description**: Add List button used white text/border which was invisible on light backgrounds.  
**Fix**: Changed to gray text with blue hover effect.

---

### BUG-015 — Minor
**Title**: Notification badge pushing bell icon out of alignment  
**Severity**: Minor  
**Priority**: P3  
**Status**: ✅ Fixed  
**Description**: Notification count badge was causing bell icon to shift vertically.  
**Fix**: Changed badge position to `-top-1 -right-1` with fixed `w-9 h-9` button size.

---

### BUG-016 — Minor
**Title**: SSL warning in Neon DB connection  
**Severity**: Minor  
**Priority**: P3  
**Status**: ✅ Fixed  
**Description**: Using sslmode=require caused deprecation warning in pg library.  
**Fix**: Changed to sslmode=verify-full.

---

### BUG-017 — Minor
**Title**: Signup error silently swallowed  
**Severity**: Minor  
**Priority**: P3  
**Status**: ✅ Fixed  
**Description**: catch block in SignupForm was empty, errors not shown to user.  
**Fix**: Added error handling with toast notifications.

---

### BUG-018 — Minor
**Title**: Empty columns show no indicator  
**Severity**: Minor  
**Priority**: P3  
**Status**: ✅ Fixed  
**Description**: Empty columns had no visual indicator, looked broken.  
**Fix**: Added "No cards yet" empty state with icon.

---

### BUG-019 — Minor
**Title**: Loading state missing on workspace page  
**Severity**: Minor  
**Priority**: P3  
**Status**: ✅ Fixed  
**Description**: Workspace page showed blank white screen while loading boards.  
**Fix**: Added BoardSkeleton loading components.

---

### BUG-020 — Minor
**Title**: Copyright year outdated in auth forms  
**Severity**: Minor  
**Priority**: P3  
**Status**: ✅ Fixed  
**Description**: Login/Signup pages showed © 2024 TaskFlow.  
**Fix**: Updated to © 2025 TaskFlow.

---

### BUG-021 — Minor
**Title**: Jest tests not exiting cleanly  
**Severity**: Minor  
**Priority**: P3  
**Status**: ✅ Fixed  
**Description**: Jest test suite would hang after completion due to open DB pool.  
**Fix**: Added `--forceExit` flag and `pool.end()` in afterAll.

---

### BUG-022 — Minor
**Title**: nodemon starting wrong entry point  
**Severity**: Minor  
**Priority**: P3  
**Status**: ✅ Fixed  
**Description**: Running `nodemon app.js` from backend dir started wrong file.  
**Fix**: Always use `npm run dev` which runs `nodemon src/index.js`.

---

## Bug Lifecycle
```
New → Open → In Progress → Fixed → Verified → Closed
```
All 22 bugs have been moved through the complete lifecycle and are now **Closed** ✅
