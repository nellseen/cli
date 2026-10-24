import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Globe,
  Lock,
  Star,
  FolderTree,
  Settings,
  Terminal,
  LogOut,
  LogIn,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FilterView } from '../../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string, filter?: FilterView, category?: string | null) => void;
  publicCount: number;
  privateCount: number;
  myPostsCount: number;
  favoritesCount: number;
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  publicCount,
  privateCount,
  myPostsCount,
  favoritesCount,
  isOpen,
  onClose,
  onOpenAuth,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    {
      id: 'dashboard',
      label: t('navOverview'),
      icon: LayoutDashboard,
      view: 'dashboard',
    },
    {
      id: 'library-all',
      label: t('navAllCommands'),
      icon: Layers,
      view: 'library',
      filter: 'all' as FilterView,
      count: publicCount + (user ? privateCount : 0),
    },
    {
      id: 'library-public',
      label: t('navPublicLibrary'),
      icon: Globe,
      view: 'library',
      filter: 'public' as FilterView,
      count: publicCount,
    },
    {
      id: 'library-my-posts',
      label: t('navMyPosts'),
      icon: UserCheck,
      view: 'library',
      filter: 'my-posts' as FilterView,
      count: user ? myPostsCount : 0,
      requiresAuth: true,
    },
    {
      id: 'library-private',
      label: t('navPrivateCommands'),
      icon: Lock,
      view: 'library',
      filter: 'private' as FilterView,
      count: user ? privateCount : 0,
      requiresAuth: true,
    },
    {
      id: 'library-favorites',
      label: t('navFavorites'),
      icon: Star,
      view: 'library',
      filter: 'favorites' as FilterView,
      count: favoritesCount,
    },
    {
      id: 'categories',
      label: t('navCategories'),
      icon: FolderTree,
      view: 'categories',
    },
    {
      id: 'settings',
      label: t('navSettings'),
      icon: Settings,
      view: 'settings',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 flex flex-col glass-panel border-r border-slate-200/80 dark:border-slate-800/80 transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-slate-800 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">CommandVault</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                  CLI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('brandSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('navHeading')}
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected =
              currentView === item.id ||
              (item.view === 'library' && currentView === `library-${item.filter}`) ||
              (currentView === item.view && !item.filter);

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.requiresAuth && !user) {
                    onOpenAuth();
                    return;
                  }
                  onNavigate(item.view, item.filter);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isSelected
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                      isSelected
                        ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Profile & Auth Status Section */}
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60">
          {user ? (
            <div className="p-3 rounded-2xl glass-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-sm">
                    {user.email ? user.email.slice(0, 2).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                {isAdmin && (
                  <span
                    title={t('authAdminBadge')}
                    className="shrink-0 p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-[11px]">
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {t('authAuthenticated')}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t('authSignOut')}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl glass-card text-center space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {t('authSignInPrompt')}
              </p>
              <button
                onClick={onOpenAuth}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl transition shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                {t('authSignInRegister')}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
