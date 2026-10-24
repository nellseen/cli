import React, { useMemo } from 'react';
import {
  Layers,
  Globe,
  Lock,
  Star,
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Plus,
  Terminal,
  X,
} from 'lucide-react';
import { Command, FilterView, SortOrder } from '../types';
import { CommandCard } from '../components/commands/CommandCard';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import { useAuth } from '../context/AuthContext';

interface LibraryProps {
  publicCommands: Command[];
  privateCommands: Command[];
  favorites: string[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: FilterView;
  onFilterChange: (f: FilterView) => void;
  selectedCategory: string | null;
  onCategorySelect: (cat: string | null) => void;
  sortOrder: SortOrder;
  onSortChange: (sort: SortOrder) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onViewDetails: (cmd: Command) => void;
  onEditCommand: (cmd: Command) => void;
  onDeleteCommand: (cmd: Command) => void;
  onToggleFavorite: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenAuthModal: () => void;
  isLoading: boolean;
}

export const Library: React.FC<LibraryProps> = ({
  publicCommands,
  privateCommands,
  favorites,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  selectedCategory,
  onCategorySelect,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
  onViewDetails,
  onEditCommand,
  onDeleteCommand,
  onToggleFavorite,
  onOpenAddModal,
  onOpenAuthModal,
  isLoading,
}) => {
  const { user } = useAuth();

  // Combine accessible commands based on user auth
  const accessiblePool = useMemo(() => {
    if (activeFilter === 'public') return publicCommands;
    if (activeFilter === 'private') return user ? privateCommands : [];
    if (activeFilter === 'favorites') {
      const all = [...publicCommands, ...(user ? privateCommands : [])];
      return all.filter((c) => favorites.includes(c.id));
    }
    // 'all'
    return [...publicCommands, ...(user ? privateCommands : [])];
  }, [activeFilter, publicCommands, privateCommands, favorites, user]);

  // Extract all distinct categories from commands
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    DEFAULT_CATEGORIES.forEach((c) => set.add(c.name));
    accessiblePool.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [accessiblePool]);

  // Filter & Search
  const filteredCommands = useMemo(() => {
    let result = [...accessiblePool];

    // Filter by Category
    if (selectedCategory) {
      result = result.filter(
        (c) => c.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((c) => {
        const matchName = c.name.toLowerCase().includes(q);
        const matchCmd = c.command.toLowerCase().includes(q);
        const matchDesc = c.description.toLowerCase().includes(q);
        const matchCat = c.category.toLowerCase().includes(q);
        const matchTags = c.tags?.some((t) => t.toLowerCase().includes(q));
        return matchName || matchCmd || matchDesc || matchCat || matchTags;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOrder === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }
      if (sortOrder === 'updated') {
        const timeA = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0;
        const timeB = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0;
        return timeB - timeA;
      }
      // 'recent'
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return timeB - timeA;
    });

    return result;
  }, [accessiblePool, selectedCategory, searchQuery, sortOrder]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {activeFilter === 'all' && 'Command Reference Library'}
            {activeFilter === 'public' && 'Public Community Library'}
            {activeFilter === 'private' && 'My Private Commands'}
            {activeFilter === 'favorites' && 'Bookmarked Favorites'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {filteredCommands.length} {filteredCommands.length === 1 ? 'command' : 'commands'} matching current filters
          </p>
        </div>

        {/* View Mode & Add Button */}
        <div className="flex items-center gap-2">
          {/* Grid / List toggle */}
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Compact List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl transition shadow-sm shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Command</span>
          </button>
        </div>
      </div>

      {/* Scope Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onFilterChange('all')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
              : 'glass-card text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Commands</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {publicCommands.length + (user ? privateCommands.length : 0)}
          </span>
        </button>

        <button
          onClick={() => onFilterChange('public')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeFilter === 'public'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
              : 'glass-card text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Public Library</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {publicCommands.length}
          </span>
        </button>

        <button
          onClick={() => {
            if (!user) onOpenAuthModal();
            else onFilterChange('private');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeFilter === 'private'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
              : 'glass-card text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>My Private</span>
          {user && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {privateCommands.length}
            </span>
          )}
        </button>

        <button
          onClick={() => onFilterChange('favorites')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeFilter === 'favorites'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
              : 'glass-card text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>Favorites</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {favorites.length}
          </span>
        </button>
      </div>

      {/* Category Pills & Sorting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
          <button
            onClick={() => onCategorySelect(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              selectedCategory === null
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Categories
          </button>
          {allCategories.map((catName) => (
            <button
              key={catName}
              onClick={() => onCategorySelect(selectedCategory === catName ? null : catName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === catName
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {catName}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center">
            <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={sortOrder}
              onChange={(e) => onSortChange(e.target.value as SortOrder)}
              className="pl-8 pr-7 py-1.5 text-xs rounded-xl glass-input appearance-none text-slate-700 dark:text-slate-300 font-medium cursor-pointer focus:outline-none"
            >
              <option value="recent">Recently Added</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
              <option value="updated">Recently Updated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Search & Category Badge Chips */}
      {(searchQuery || selectedCategory) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">Active filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
              Query: "{searchQuery}"
              <button onClick={() => onSearchChange('')} className="hover:text-indigo-900 dark:hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
              Category: {selectedCategory}
              <button onClick={() => onCategorySelect(null)} className="hover:text-indigo-900 dark:hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={() => {
              onSearchChange('');
              onCategorySelect(null);
            }}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 rounded-2xl glass-card animate-pulse p-5 space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
              <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded w-full" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredCommands.length > 0 ? (
        /* Commands Grid or List */
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
              : 'space-y-3'
          }
        >
          {filteredCommands.map((command) => (
            <CommandCard
              key={command.id}
              command={command}
              isFavorite={favorites.includes(command.id)}
              onToggleFavorite={onToggleFavorite}
              onViewDetails={onViewDetails}
              onEdit={onEditCommand}
              onDelete={onDeleteCommand}
              onSelectCategory={(cat) => onCategorySelect(cat)}
              compact={viewMode === 'list'}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 rounded-3xl glass-panel text-center max-w-lg mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Terminal className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No commands found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {searchQuery || selectedCategory
              ? 'Try modifying your search keywords or clearing active category filters.'
              : activeFilter === 'private'
              ? 'You have not created any private commands yet.'
              : activeFilter === 'favorites'
              ? 'You have not starred any favorite commands yet. Click the star icon on any command card to bookmark it.'
              : 'Start your collection by adding your first CLI command.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  onSearchChange('');
                  onCategorySelect(null);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-500/20"
            >
              Add Command
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
