import React, { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { Command, CommandFormData, Visibility } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { DEFAULT_CATEGORIES } from '../../utils/categories';
import { createCommand, updateCommand, addFavorite } from '../../services/commands';

interface CommandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCommand?: Command | null;
  onSuccess: (savedCommandId?: string) => void;
  onOpenAuth: () => void;
}

export const CommandFormModal: React.FC<CommandFormModalProps> = ({
  isOpen,
  onClose,
  editingCommand,
  onSuccess,
  onOpenAuth,
}) => {
  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();
  const { language, t } = useLanguage();

  const [name, setName] = useState('');
  const [command, setCommand] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0].name);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingCommand) {
      setName(editingCommand.name || '');
      setCommand(editingCommand.command || '');
      setDescription(editingCommand.description || '');

      const isDefault = DEFAULT_CATEGORIES.some((c) => c.name === editingCommand.category);
      if (isDefault) {
        setCategory(editingCommand.category);
        setIsCustomCategory(false);
        setCustomCategory('');
      } else {
        setIsCustomCategory(true);
        setCustomCategory(editingCommand.category);
      }

      setVisibility(editingCommand.visibility || 'public');
      setTags(editingCommand.tags || []);
      setIsFavorite(false);
    } else {
      // Defaults for new command
      setName('');
      setCommand('');
      setDescription('');
      setCategory(DEFAULT_CATEGORIES[0].name);
      setIsCustomCategory(false);
      setCustomCategory('');
      setVisibility(isAdmin ? 'public' : 'private');
      setTags([]);
      setIsFavorite(false);
    }
    setErrors({});
  }, [editingCommand, isOpen, isAdmin]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed) && tags.length < 15) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = language === 'id' ? 'Nama perintah wajib diisi' : 'Command name is required';
    if (!command.trim()) errs.command = language === 'id' ? 'Sintaks perintah wajib diisi' : 'Command syntax is required';
    if (!description.trim()) errs.description = language === 'id' ? 'Deskripsi wajib diisi' : 'Description is required';
    const finalCat = isCustomCategory ? customCategory.trim() : category;
    if (!finalCat) errs.category = language === 'id' ? 'Kategori wajib diisi' : 'Category is required';

    if (visibility === 'public' && !isAdmin) {
      errs.visibility =
        language === 'id'
          ? 'Hanya administrator resmi yang dapat mempublikasikan perintah publik. Silakan atur visibilitas ke Pribadi.'
          : 'Only authorized administrators can publish public commands. Please set visibility to Private.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      error(
        language === 'id' ? 'Otentikasi Diperlukan' : 'Authentication required',
        language === 'id' ? 'Silakan masuk untuk menyimpan perintah.' : 'Please sign in to save commands.'
      );
      onOpenAuth();
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);
    const finalCategory = isCustomCategory ? customCategory.trim() : category;

    const payload: CommandFormData = {
      name,
      command,
      description,
      category: finalCategory,
      visibility,
      tags,
    };

    try {
      if (editingCommand) {
        await updateCommand(editingCommand.id, payload);
        success(
          language === 'id' ? 'Perintah diperbarui' : 'Command updated',
          `"${name}" ${language === 'id' ? 'berhasil diperbarui.' : 'was successfully updated.'}`
        );
        onSuccess(editingCommand.id);
      } else {
        const newId = await createCommand(payload, user.uid);
        if (isFavorite && user) {
          await addFavorite(user.uid, newId);
        }
        success(
          language === 'id' ? 'Perintah dibuat' : 'Command created',
          `"${name}" ${language === 'id' ? 'telah ditambahkan ke CommandVault.' : 'has been added to CommandVault.'}`
        );
        onSuccess(newId);
      }
      onClose();
    } catch (err: any) {
      console.error('Save error:', err);
      error(
        language === 'id' ? 'Gagal menyimpan perintah' : 'Failed to save command',
        err.message || (language === 'id' ? 'Periksa izin Anda dan coba lagi.' : 'Please check your permissions and try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={() => !isSubmitting && onClose()}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-700/80 my-8 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {editingCommand ? t('editCommandTitle') : t('addNewCommandTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('formSubtext')}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-5 space-y-4 pr-1">
          {/* Command Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('commandNameLabel')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('commandNamePlaceholder')}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl glass-input text-slate-900 dark:text-white focus:outline-none"
              maxLength={120}
              required
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>

          {/* Command Syntax (Multiline textarea) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('commandSyntaxLabel')} <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{t('preservesLineBreaks')}</span>
            </div>
            <textarea
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="find /var/log -type f -name '*.log' -mtime +30 -exec rm -f {} \;"
              rows={4}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono rounded-xl glass-input text-slate-900 dark:text-white focus:outline-none resize-y leading-relaxed"
              maxLength={5000}
              required
            />
            {errors.command && <p className="text-xs text-rose-500 mt-1">{errors.command}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('descLabel')} <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descPlaceholder')}
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl glass-input text-slate-900 dark:text-white focus:outline-none resize-y"
              maxLength={1500}
              required
            />
            {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
          </div>

          {/* Category & Visibility Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('categoryLabel')} <span className="text-rose-500">*</span>
              </label>
              {!isCustomCategory ? (
                <div className="space-y-2">
                  <select
                    value={category}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomCategory(true);
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl glass-input text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {language === 'id' && c.nameId ? c.nameId : c.name}
                      </option>
                    ))}
                    <option value="__custom__">{t('addCustomCategoryOption')}</option>
                  </select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder={t('customCategoryPlaceholder')}
                    className="flex-1 px-3.5 py-2.5 text-sm rounded-xl glass-input text-slate-900 dark:text-white focus:outline-none"
                    maxLength={50}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(false);
                      setCategory(DEFAULT_CATEGORIES[0].name);
                    }}
                    className="px-3 py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl"
                  >
                    {t('cancelBtn')}
                  </button>
                </div>
              )}
              {errors.category && <p className="text-xs text-rose-500 mt-1">{errors.category}</p>}
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('visibilityLabel')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  disabled={!isAdmin}
                  className={`px-3 py-2 text-xs font-medium rounded-xl border transition text-center ${
                    visibility === 'public'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  } ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {t('visibilityPublicLabel')} {isAdmin ? '(Admin)' : ''}
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`px-3 py-2 text-xs font-medium rounded-xl border transition text-center ${
                    visibility === 'private'
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t('visibilityPrivateLabel')}
                </button>
              </div>
              {!isAdmin && visibility === 'public' && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                  {t('visibilityAdminNotice')}
                </p>
              )}
              {errors.visibility && <p className="text-xs text-rose-500 mt-1">{errors.visibility}</p>}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('tagsLabel')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={t('tagInputPlaceholder')}
                className="flex-1 px-3.5 py-2 text-sm rounded-xl glass-input text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3.5 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('addTagBtn')}
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {tags.map((tItem) => (
                  <span
                    key={tItem}
                    className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50"
                  >
                    #{tItem}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tItem)}
                      className="text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Favorite checkbox on create */}
          {!editingCommand && (
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span>{t('saveFavoritesCheckbox')}</span>
              </label>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            {t('cancelBtn')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl transition shadow-sm shadow-indigo-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? t('savingBtn') : editingCommand ? t('saveChangesBtn') : t('createCommandBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
