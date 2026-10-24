import React from 'react';
import {
  Terminal,
  Code2,
  GitBranch,
  Box,
  Package,
  FileCode2,
  Globe,
  Server,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Command, FilterView } from '../types';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface CategoriesPageProps {
  publicCommands: Command[];
  privateCommands: Command[];
  onNavigate: (view: string, filter?: FilterView, category?: string | null) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Terminal,
  Code2,
  GitBranch,
  Box,
  Package,
  FileCode2,
  Globe,
  Server,
};

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  publicCommands,
  privateCommands,
  onNavigate,
}) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const allCommands = React.useMemo(() => {
    const map = new Map<string, Command>();
    publicCommands.forEach((c) => {
      if (c && c.id) map.set(c.id, c);
    });
    if (user) {
      privateCommands.forEach((c) => {
        if (c && c.id) map.set(c.id, c);
      });
    }
    return Array.from(map.values());
  }, [publicCommands, privateCommands, user]);

  // Identify all categories including any custom ones created by users
  const categoryStats = DEFAULT_CATEGORIES.map((cat) => {
    const matching = allCommands.filter(
      (c) => c.category.toLowerCase() === cat.name.toLowerCase()
    );
    const publicMatch = publicCommands.filter(
      (c) => c.category.toLowerCase() === cat.name.toLowerCase()
    ).length;
    const privateMatch = user
      ? privateCommands.filter((c) => c.category.toLowerCase() === cat.name.toLowerCase()).length
      : 0;

    return {
      ...cat,
      totalCount: matching.length,
      publicCount: publicMatch,
      privateCount: privateMatch,
    };
  });

  // Also check for custom categories not in default list
  const customCategories = Array.from(
    new Set(
      allCommands
        .map((c) => c.category)
        .filter((cat) => !DEFAULT_CATEGORIES.some((d) => d.name.toLowerCase() === cat.toLowerCase()))
    )
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t('categoriesPageTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('categoriesPageDesc')}
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryStats.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Terminal;
          const displayName = language === 'id' && cat.nameId ? cat.nameId : cat.name;
          const displayDesc = language === 'id' && cat.descriptionId ? cat.descriptionId : cat.description;

          return (
            <div
              key={cat.id}
              onClick={() => onNavigate('library', 'all', cat.name)}
              className="p-6 rounded-3xl glass-card cursor-pointer group flex flex-col justify-between hover:border-indigo-400/50 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-800/50 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {cat.totalCount} {t('commandsCountUnit')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {displayName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {displayDesc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <span>{cat.publicCount} {t('publicBadge')}</span>
                  {user && <span>• {cat.privateCount} {t('privateBadge')}</span>}
                </div>
                <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                  <span>{t('browseCategory')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}

        {/* Custom Categories if any */}
        {customCategories.map((customName) => {
          const matching = allCommands.filter((c) => c.category === customName);
          return (
            <div
              key={customName}
              onClick={() => onNavigate('library', 'all', customName)}
              className="p-6 rounded-3xl glass-card cursor-pointer group flex flex-col justify-between hover:border-indigo-400/50 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-800/50">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {matching.length} {t('commandsCountUnit')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {customName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {language === 'id' ? 'Kategori CLI kustom buatan pengguna.' : 'User defined custom CLI category.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-end text-xs font-medium text-indigo-600 dark:text-indigo-400">
                <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>{t('browseCategory')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
