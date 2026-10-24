export type Visibility = 'public' | 'private';

export interface Command {
  id: string;
  name: string;
  nameId?: string;
  command: string;
  description: string;
  descriptionId?: string;
  category: string;
  tags?: string[];
  visibility: Visibility;
  ownerUid: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface CommandFormData {
  name: string;
  command: string;
  description: string;
  category: string;
  tags: string[];
  visibility: Visibility;
  isFavorite?: boolean;
}

export interface CategoryInfo {
  id: string;
  name: string;
  nameId?: string;
  description: string;
  descriptionId?: string;
  color: string;
  icon: string;
}

export type FilterView = 'all' | 'public' | 'private' | 'favorites';

export type SortOrder = 'recent' | 'alphabetical' | 'updated';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

export interface SafetyAnalysis {
  isDestructive: boolean;
  severity: 'safe' | 'caution' | 'danger';
  warningTitle?: string;
  warningExplanation?: string;
}
