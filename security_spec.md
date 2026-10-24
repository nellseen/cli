# Security Specification & Test TDD for CommandVault

## 1. Data Invariants
- **Public Read Access**: Any user (anonymous or signed in) can read commands where `visibility == 'public'`.
- **Private Read Isolation**: Only the authenticated user matching `ownerUid` can read commands where `visibility == 'private'`. Unauthenticated users or non-owners can NEVER read private commands.
- **Query Enforcer**: List operations must check `resource.data.visibility == 'public'` OR (`isSignedIn()` and `resource.data.ownerUid == request.auth.uid`).
- **Command Authorship Integrity**: When creating a command, `incoming().ownerUid` must strictly match `request.auth.uid`.
- **Public Command Authoring**: Creating, editing, or deleting a public command requires Administrator status or command owner privileges.
- **Private Command Authoring**: Any authenticated user can create/edit/delete their own private commands where `ownerUid == request.auth.uid`.
- **Favorites Isolation**: A user can only read, write, or delete documents in their own subcollection `/users/{userId}/favorites/{commandId}` where `request.auth.uid == userId`.
- **No Shadow Fields**: Strict keys validation ensures no unexpected fields or privilege escalations.
- **Temporal Integrity**: `createdAt` is immutable; `updatedAt` is updated to `request.time`.

## 2. The "Dirty Dozen" Threat Payloads
1. **Public Reading of Private Command**: Unauthenticated attacker attempts `get /commands/priv_123` where `visibility == 'private'`. Expected: PERMISSION_DENIED.
2. **Private Command Snooping by Other User**: Authenticated User B attempts `get /commands/priv_user_a` where `ownerUid == 'user_a'`. Expected: PERMISSION_DENIED.
3. **Ghost Field Injection**: Authenticated user attempts `create /commands/cmd_1` with payload containing `{ name, command, description, category, visibility: 'private', ownerUid, ghostField: 'hacked' }`. Expected: PERMISSION_DENIED.
4. **Identity Spoofing**: Authenticated User A (`uid_a`) attempts `create /commands/cmd_2` with `ownerUid: 'uid_b'`. Expected: PERMISSION_DENIED.
5. **Unauthorized Public Command Creation**: Non-admin authenticated user attempts `create /commands/cmd_pub` with `visibility: 'public'`. Expected: PERMISSION_DENIED.
6. **Cross-User Favorite Modification**: User A attempts `set /users/user_b/favorites/cmd_1`. Expected: PERMISSION_DENIED.
7. **Cross-User Favorite Peeking**: User A attempts `get /users/user_b/favorites/cmd_1`. Expected: PERMISSION_DENIED.
8. **Owner ID Mutability Attack**: Owner attempts `update /commands/cmd_1` altering `ownerUid` from `uid_a` to `uid_b`. Expected: PERMISSION_DENIED.
9. **Creation Timestamp Alteration**: Owner attempts `update /commands/cmd_1` rewriting `createdAt`. Expected: PERMISSION_DENIED.
10. **Denial-of-Wallet Payload Injection**: User attempts `create /commands/cmd_huge` with command text exceeding 5,000 characters. Expected: PERMISSION_DENIED.
11. **Path Variable ID Poisoning**: Attacker sends document request with invalid characters in ID e.g. `../../bad_id$$$`. Expected: PERMISSION_DENIED.
12. **Admin Privilege Escalation**: Regular user attempts `write /admins/{user_uid}` to register themselves as admin. Expected: PERMISSION_DENIED.

## 3. Test Runner Logic
All 12 dirty payloads are rigorously prevented by the rules defined in `firestore.rules`.
