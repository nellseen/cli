import { Command } from '../types';

// Empty template commands array so user can populate manually
export const STARTER_COMMANDS: Omit<Command, 'ownerUid' | 'createdAt' | 'updatedAt'>[] = [];
