import React from 'react';
import {
  Layers,
  Globe,
  Lock,
  Star,
  Clock,
  ArrowRight,
  Terminal,
  Sparkles,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { Command, FilterView } from '../types';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import { CommandCard } from '../components/commands/CommandCard';

interface DashboardProps {
  publicCommands: Command[];
  privateCommands: Command[];
  favorites: string[];
  onNavigate: (view: string, filter?: FilterView, category?: string | null) => void;
  onViewDetails: (command: Command) => void;
  onEditCommand: (command: Command) => void;
  onDeleteCommand: (command: Command) => void;
  onToggleFavorite: (commandId: string) => void;
  onOpenAddModal: () => void;
  onOpenAuthModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  publicCommands,
  privateCommands,
  favorites,
  onNavigate,
  onViewDetails,
  onEditCommand,
  onDeleteCommand,
  onToggleFavorite,
  onOpenAddModal,
  onOpenAuthModal,
}) => {
  const { user, isAdmin } = useAuth();

  const totalAccessible = publicCommands.length + (user ? privateCommands.length : 0);
  const allAccessibleCommands = [...publicCommands, ...(user ? privateCommands : [])];

  // Recently added commands (sorted newest first)
  const recentCommands = [...allAccessibleCommands]
    .sort((a, b) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, 6);

  // Category counts
  const categoryCounts = DEFAULT_CATEGORIES.map((cat) => {
    const count = allAccessibleCommands.filter((c) => c.category.toLowerCase() === cat.name.toLowerCase()).length;
    return { ...cat, count };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/50 dark:border-indigo-800/50 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Developer CLI Reference Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            CommandVault Library
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Curated syntax references for Linux, Bash, Git, Docker, and developer tools. Copy commands instantly to your clipboard with clean syntax formatting and safety auditing.
          </p>

          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <button
              onClick={() => onNavigate('library', 'all')}
              className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl transition shadow-md shadow-indigo-500/20"
            >
              <Layers className="w-4 h-4" />
              <span>Browse All Commands</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 glass-card hover:bg-white dark:hover:bg-slate-800 rounded-xl transition border border-slate-200/80 dark:border-slate-700/80"
            >
              <Plus className="w-4 h-4" />
              <span>Add Command</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-400/10 dark:bg-indigo-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Understated Statistic Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Accessible */}
        <div
          onClick={() => onNavigate('library', 'all')}
          className="p-5 rounded-2xl glass-card cursor-pointer group hover:scale-[1.01] transition"
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Commands</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {totalAccessible}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Available in library</p>
        </div>

        {/* Public Library */}
        <div
          onClick={() => onNavigate('library', 'public')}
          className="p-5 rounded-2xl glass-card cursor-pointer group hover:scale-[1.01] transition"
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Public Library</span>
            <Globe className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {publicCommands.length}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Shared reference library</p>
        </div>

        {/* Private Commands */}
        <div
          onClick={() => {
            if (user) onNavigate('library', 'private');
            else onOpenAuthModal();
          }}
          className="p-5 rounded-2xl glass-card cursor-pointer group hover:scale-[1.01] transition"
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">My Private</span>
            <Lock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {user ? privateCommands.length : 0}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {user ? 'Only visible to you' : 'Sign in to access'}
          </p>
        </div>

        {/* Bookmarks */}
        <div
          onClick={() => onNavigate('library', 'favorites')}
          className="p-5 rounded-2xl glass-card cursor-pointer group hover:scale-[1.01] transition"
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Favorites</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {favorites.length}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Saved for quick access</p>
        </div>
      </div>

      {/* Popular Categories Quick Access */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Popular Categories</h2>
          <button
            onClick={() => onNavigate('categories')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categoryCounts.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('library', 'all', cat.name)}
              className="p-3.5 rounded-2xl glass-card text-left flex items-center justify-between group hover:border-indigo-400/40 transition"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  {cat.name}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                  {cat.count} {cat.count === 1 ? 'command' : 'commands'}
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition" />
            </button>
          ))}
        </div>
      </div>

      {/* Recently Added Commands */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Recently Added Commands</h2>
          </div>
          <button
            onClick={() => onNavigate('library', 'all')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Explore Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentCommands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recentCommands.map((command) => (
              <CommandCard
                key={command.id}
                command={command}
                isFavorite={favorites.includes(command.id)}
                onToggleFavorite={onToggleFavorite}
                onViewDetails={onViewDetails}
                onEdit={onEditCommand}
                onDelete={onDeleteCommand}
                onSelectCategory={(cat) => onNavigate('library', 'all', cat)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl glass-panel text-center">
            <Terminal className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No commands loaded yet</p>
            <p className="text-xs text-slate-500 mt-1">Get started by creating your first CLI command.</p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl"
            >
              Add Command
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
