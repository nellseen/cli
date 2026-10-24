# CommandVault — Linux & CLI Command Library

CommandVault is a developer-focused CLI command reference library built with React, Vite, Tailwind CSS, and Cloud Firestore. It is designed with an Apple-inspired Liquid Glass aesthetic: subtle glassmorphism, translucent surfaces, refined typography, and neutral colors.

## Features

- **Public & Private Library**: Anyone can browse, search, and copy public commands. Authenticated users can create and manage their own private commands securely isolated in Cloud Firestore.
- **Copy to Clipboard**: One-click copying of command syntax with visual feedback, preserving line breaks for multiline scripts without executing commands on the host machine.
- **Safety Analyzer**: Automatically flags potentially destructive or high-risk CLI operations (e.g. recursive disk erasures, firewall resets, mass permission escalations) with caution badges and explanations.
- **Role-Based Access Control**:
  - Regular users can manage their own private commands and bookmark favorites.
  - Authorized Administrators (`nellstoree59@gmail.com` or users with records in the `admins` collection) can publish, update, and manage the public library and seed the database.
- **Global Search & Filter**: Real-time debounced query search across names, commands, descriptions, and tags. Filter by scope (All, Public, Private, Favorites), CLI domain (Linux, Bash, Git, Docker, NPM, Python, Networking, System Admin), and sort order.
- **Light & Dark Themes**: Responsive Liquid Glass styling with theme persistence.
- **JSON Backup Export**: Export full personal and public command libraries with syntax and metadata in JSON format.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

## Firebase Architecture & Security Rules

### Security Rules (`firestore.rules`)
Firestore Security Rules enforce Zero-Trust access:
- `commands/{commandId}`:
  - `read`: Public commands readable by all; private commands only readable by their `ownerUid`.
  - `create`: Private commands allowed by authenticated users with matching `ownerUid`. Public commands restricted to administrators.
  - `update` / `delete`: Owner can update their private commands; administrators can update public commands. Immutable fields (`createdAt`, `ownerUid`) are enforced.
- `users/{userId}/favorites/{commandId}`:
  - Completely isolated subcollection where only `request.auth.uid == userId` can read or write.

### Deploying Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Administrator Configuration
The administrator UID/email is bootstrapped in `firestore.rules` and `src/context/AuthContext.tsx` (`nellstoree59@gmail.com`). To grant administrator privileges to additional users, create a document in the `admins` Firestore collection with document ID matching the user's Firebase Authentication UID:
```json
{
  "email": "admin@example.com",
  "role": "admin",
  "createdAt": "2026-10-23T00:00:00Z"
}
```
