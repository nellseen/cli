import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Star,
  Globe,
  Lock,
  AlertTriangle,
  Calendar,
  User,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Command } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { analyzeCommandSafety } from '../../utils/safety';
import { DEFAULT_CATEGORIES } from '../../utils/categories';

interface CommandDetailModalProps {
  command: Command | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (commandId: string) => void;
  onEdit: (command: Command) => void;
  onDelete: (command: Command) => void;
}

export const CommandDetailModal: React.FC<CommandDetailModalProps> = ({
  command,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onEdit,
  onDelete,
}) => {
  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();
  const { language, t } = useLanguage();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !command) return null;

  const isOwner = user && user.uid === command.ownerUid;
  const canModify = isOwner || (isAdmin && command.visibility === 'public');
  const safety = analyzeCommandSafety(command.command, language);

  const displayName = language === 'id' && command.nameId ? command.nameId : command.name;
  const displayDescription =
    language === 'id' && command.descriptionId ? command.descriptionId : command.description;

  const categoryMeta = DEFAULT_CATEGORIES.find(
    (c) => c.name.toLowerCase() === command.category.toLowerCase()
  );
  const displayCategory =
    language === 'id' && categoryMeta?.nameId ? categoryMeta.nameId : command.category;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(command.command);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = command.command;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      success(t('copySuccessToast'), t('copySuccessDesc'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      error(t('copyFailedToast'), t('copyFailedDesc'));
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return language === 'id' ? 'Baru saja' : 'Just now';
    const locale = language === 'id' ? 'id-ID' : 'en-US';
    if (timestamp.toDate) return timestamp.toDate().toLocaleDateString(locale, { dateStyle: 'medium' });
    if (typeof timestamp === 'string') return new Date(timestamp).toLocaleDateString(locale, { dateStyle: 'medium' });
    return language === 'id' ? 'Baru-baru ini' : 'Recently';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-700/80 my-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                {displayCategory}
              </span>
              {command.visibility === 'public' ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-800/40">
                  <Globe className="w-3.5 h-3.5" />
                  {t('publicBadge')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/40 dark:border-amber-800/40">
                  <Lock className="w-3.5 h-3.5" />
                  {t('privateBadge')}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
              {displayName}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleFavorite(command.id)}
              className={`p-2 rounded-xl transition ${
                isFavorite
                  ? 'text-amber-500 bg-amber-50/80 dark:bg-amber-950/40'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Safety Warning Banner if destructive */}
        {safety.isDestructive && (
          <div
            className={`p-4 rounded-2xl mb-4 flex items-start gap-3 border ${
              safety.severity === 'danger'
                ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            }`}
          >
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div className="text-xs">
              <p className="font-semibold">{safety.warningTitle}</p>
              <p className="mt-0.5 opacity-90 leading-relaxed">{safety.warningExplanation}</p>
            </div>
          </div>
        )}

        {/* Command Syntax Box */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('commandSyntax')}
            </span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition shadow-sm ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t('copiedToClipboard')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{t('copyCommand')}</span>
                </>
              )}
            </button>
          </div>

          <div className="relative rounded-2xl code-container p-4 font-mono text-sm text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre leading-relaxed select-all border border-slate-200/80 dark:border-slate-800/80">
            {command.command}
          </div>
        </div>

        {/* Explanation / Description */}
        <div className="space-y-1.5 mb-5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t('descAndPurpose')}
          </span>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 whitespace-pre-line">
            {displayDescription}
          </p>
        </div>

        {/* Tags */}
        {command.tags && command.tags.length > 0 && (
          <div className="space-y-1.5 mb-6">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('keywordsAndTags')}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {command.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Footer */}
        <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {t('createdDateLabel')} {formatDate(command.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {t('ownerLabel')}: {command.ownerUid.slice(0, 10)}...
            </span>
          </div>

          {canModify && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onEdit(command);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
                {t('editBtn')}
              </button>
              <button
                onClick={() => {
                  onClose();
                  onDelete(command);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t('deleteBtn')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
