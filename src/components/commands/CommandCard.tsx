import React, { useState } from 'react';
import {
  Copy,
  Check,
  Star,
  Globe,
  Lock,
  ExternalLink,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Command } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { analyzeCommandSafety } from '../../utils/safety';
import { DEFAULT_CATEGORIES } from '../../utils/categories';

interface CommandCardProps {
  command: Command;
  isFavorite: boolean;
  onToggleFavorite: (commandId: string) => void;
  onViewDetails: (command: Command) => void;
  onEdit: (command: Command) => void;
  onDelete: (command: Command) => void;
  onSelectCategory?: (category: string) => void;
  compact?: boolean;
}

export const CommandCard: React.FC<CommandCardProps> = ({
  command,
  isFavorite,
  onToggleFavorite,
  onViewDetails,
  onEdit,
  onDelete,
  onSelectCategory,
  compact = false,
}) => {
  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();
  const { language, t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const isOwner = user && user.uid === command.ownerUid;
  const canModify = isOwner || (isAdmin && command.visibility === 'public');
  const safety = analyzeCommandSafety(command.command, language);

  // Localized text resolution
  const displayName = language === 'id' && command.nameId ? command.nameId : command.name;
  const displayDescription =
    language === 'id' && command.descriptionId ? command.descriptionId : command.description;

  const categoryMeta = DEFAULT_CATEGORIES.find(
    (c) => c.name.toLowerCase() === command.category.toLowerCase()
  );
  const displayCategory =
    language === 'id' && categoryMeta?.nameId ? categoryMeta.nameId : command.category;

  // Copy to clipboard with graceful error handling
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available in this environment');
      }
      await navigator.clipboard.writeText(command.command);
      setCopied(true);
      success(t('copySuccessToast'), `"${displayName}" ${language === 'id' ? 'berhasil disalin.' : 'copied.'}`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err: any) {
      console.error('Clipboard copy error:', err);
      try {
        const textarea = document.createElement('textarea');
        textarea.value = command.command;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        success(t('copySuccessToast'));
        setTimeout(() => setCopied(false), 2000);
      } catch {
        error(t('copyFailedToast'), t('copyFailedDesc'));
      }
    }
  };

  return (
    <div
      onClick={() => onViewDetails(command)}
      className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl glass-card cursor-pointer transition-all duration-200"
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category badge */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectCategory?.(command.category);
              }}
              className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
            >
              {displayCategory}
            </button>

            {/* Visibility badge */}
            {command.visibility === 'public' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-800/40">
                <Globe className="w-3 h-3" />
                {t('publicBadge')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/40 dark:border-amber-800/40">
                <Lock className="w-3 h-3" />
                {t('privateBadge')}
              </span>
            )}

            {/* Safety Warning Badge */}
            {safety.isDestructive && (
              <span
                title={safety.warningExplanation}
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  safety.severity === 'danger'
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60'
                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                {safety.severity === 'danger' ? t('destructiveBadge') : t('cautionBadge')}
              </span>
            )}
          </div>

          {/* Favorite Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(command.id);
            }}
            className={`p-1.5 rounded-lg transition ${
              isFavorite
                ? 'text-amber-500 bg-amber-50/80 dark:bg-amber-950/40'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label="Toggle favorite"
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
          </button>
        </div>

        {/* Command Name */}
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1.5">
          {displayName}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {displayDescription}
        </p>

        {/* Code Snippet Box */}
        <div className="relative mb-3 group/code">
          <div className="code-container rounded-xl p-3 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre leading-relaxed select-all border border-slate-200/60 dark:border-slate-800/60">
            {compact ? (
              <span className="truncate block">{command.command.split('\n')[0]}</span>
            ) : (
              command.command
            )}
          </div>

          {/* Quick Copy Button */}
          <button
            onClick={handleCopy}
            className={`absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all shadow-sm ${
              copied
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80'
            }`}
            title="Copy command to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{t('copiedBtn')}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{t('copyBtn')}</span>
              </>
            )}
          </button>
        </div>

        {/* Tags */}
        {command.tags && command.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {command.tags.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
            {command.tags.length > 4 && (
              <span className="text-[10px] text-slate-400 py-0.5">+{command.tags.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-200/50 dark:border-slate-800/50">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(command);
          }}
          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <span>{t('viewDetails')}</span>
          <ExternalLink className="w-3 h-3" />
        </button>

        {canModify && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onEdit(command)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              title={t('editBtn')}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(command)}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
              title={t('deleteBtn')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
