import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Command, CommandFormData } from '../types';
import { STARTER_COMMANDS } from '../data/starterCommands';

const COMMANDS_COLLECTION = 'commands';

/**
 * Fetch all public commands from Firestore
 */
export async function getPublicCommands(): Promise<Command[]> {
  try {
    const q = query(collection(db, COMMANDS_COLLECTION), where('visibility', '==', 'public'));
    const snapshot = await getDocs(q);
    const list: Command[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Command, 'id'>) });
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COMMANDS_COLLECTION);
  }
}

/**
 * Fetch private commands owned by the authenticated user
 */
export async function getPrivateCommands(ownerUid: string): Promise<Command[]> {
  if (!ownerUid) return [];
  try {
    const q = query(
      collection(db, COMMANDS_COLLECTION),
      where('ownerUid', '==', ownerUid),
      where('visibility', '==', 'private')
    );
    const snapshot = await getDocs(q);
    const list: Command[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Command, 'id'>) });
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COMMANDS_COLLECTION);
  }
}

/**
 * Fetch single command by ID
 */
export async function getCommandById(commandId: string): Promise<Command | null> {
  const path = `${COMMANDS_COLLECTION}/${commandId}`;
  try {
    const snap = await getDoc(doc(db, COMMANDS_COLLECTION, commandId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<Command, 'id'>) };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

/**
 * Create a new command
 */
export async function createCommand(formData: CommandFormData, ownerUid: string): Promise<string> {
  const commandId = 'cmd_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
  const path = `${COMMANDS_COLLECTION}/${commandId}`;

  // Sanitize and adhere to blueprint bounds
  const cleanData = {
    name: formData.name.trim().slice(0, 120),
    command: formData.command.trim().slice(0, 5000),
    description: (formData.description || '').trim().slice(0, 1500),
    category: formData.category.trim().slice(0, 50),
    tags: (formData.tags || []).map((t) => t.trim().slice(0, 30)).filter(Boolean).slice(0, 15),
    visibility: formData.visibility,
    ownerUid: ownerUid.slice(0, 128),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, COMMANDS_COLLECTION, commandId), cleanData);
    return commandId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

/**
 * Update an existing command
 */
export async function updateCommand(commandId: string, formData: Partial<CommandFormData>): Promise<void> {
  const path = `${COMMANDS_COLLECTION}/${commandId}`;
  const updates: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };

  if (formData.name !== undefined) updates.name = formData.name.trim().slice(0, 120);
  if (formData.command !== undefined) updates.command = formData.command.trim().slice(0, 5000);
  if (formData.description !== undefined) updates.description = formData.description.trim().slice(0, 1500);
  if (formData.category !== undefined) updates.category = formData.category.trim().slice(0, 50);
  if (formData.visibility !== undefined) updates.visibility = formData.visibility;
  if (formData.tags !== undefined) {
    updates.tags = formData.tags.map((t) => t.trim().slice(0, 30)).filter(Boolean).slice(0, 15);
  }

  try {
    await updateDoc(doc(db, COMMANDS_COLLECTION, commandId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

/**
 * Delete a command
 */
export async function deleteCommand(commandId: string): Promise<void> {
  const path = `${COMMANDS_COLLECTION}/${commandId}`;
  try {
    await deleteDoc(doc(db, COMMANDS_COLLECTION, commandId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Fetch a user's favorite command IDs
 */
export async function getUserFavorites(userId: string): Promise<string[]> {
  if (!userId) return [];
  const path = `users/${userId}/favorites`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'favorites'));
    const favorites: string[] = [];
    snap.forEach((d) => favorites.push(d.id));
    return favorites;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

/**
 * Add a command to user's favorites
 */
export async function addFavorite(userId: string, commandId: string): Promise<void> {
  const path = `users/${userId}/favorites/${commandId}`;
  try {
    await setDoc(doc(db, 'users', userId, 'favorites', commandId), {
      userId,
      commandId,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

/**
 * Remove a command from user's favorites
 */
export async function removeFavorite(userId: string, commandId: string): Promise<void> {
  const path = `users/${userId}/favorites/${commandId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'favorites', commandId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Seed starter commands into Firestore
 */
export async function seedStarterLibrary(adminUid: string): Promise<number> {
  const batch = writeBatch(db);
  let count = 0;

  for (const starter of STARTER_COMMANDS) {
    const ref = doc(db, COMMANDS_COLLECTION, starter.id);
    batch.set(ref, {
      name: starter.name,
      command: starter.command,
      description: starter.description,
      category: starter.category,
      tags: starter.tags || [],
      visibility: 'public',
      ownerUid: adminUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    count++;
  }

  await batch.commit();
  return count;
}
