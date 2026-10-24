import React, { useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Sun,
  Moon,
  Menu,
  Shield,
  LogIn,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_CATEGORIES } from '../../utils/categories';

interface TopNavProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenAddModal: () => void;
  onOpenAuthModal: () => void;
  onToggleSidebar: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  isDark,
  onToggleTheme,
  onOpenAddModal,
  onOpenAuthModal,
  onToggleSidebar,
}) => {
  const { user, isAdmin } = useAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: '/' focuses the search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        if (!['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-18 px-4 sm:px-6 glass-panel border-b border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between gap-4">
      {/* Left section: mobile hamburger & search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search commands, syntax, tags, categories..."
            className="w-full pl-10 pr-10 py-2 text-xs sm:text-sm rounded-xl glass-input text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          ) : (
            <span className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 pointer-events-none">
              /
            </span>
          )}
        </div>
      </div>

      {/* Right section: Category filter, Theme toggle, Add command, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Category quick filter selector */}
        <div className="hidden md:flex items-center gap-1.5">
          <div className="relative">
            <select
              value={selectedCategory || ''}
              onChange={(e) => onCategorySelect(e.target.value || null)}
              className="pl-8 pr-7 py-2 text-xs rounded-xl glass-input appearance-none text-slate-700 dark:text-slate-300 cursor-pointer font-medium focus:outline-none"
            >
              <option value="">All Categories</option>
              {DEFAULT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Add Command Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl transition shadow-sm shadow-indigo-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Command</span>
        </button>

        {/* Auth profile avatar / Sign in */}
        {user ? (
          <div className="flex items-center gap-2 pl-1">
            <div
              title={`${user.email}${isAdmin ? ' (Admin)' : ''}`}
              className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-medium text-xs flex items-center justify-center shadow-sm cursor-pointer border border-white/20"
            >
              {user.email?.slice(0, 2).toUpperCase() || 'U'}
              {isAdmin && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center text-[8px] text-white ring-2 ring-white dark:ring-slate-900">
                  <Shield className="w-2.5 h-2.5" />
                </span>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
