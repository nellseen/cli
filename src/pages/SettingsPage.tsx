import React, { useState } from 'react';
import {
  ShieldCheck,
  Database,
  Download,
  User,
  Sparkles,
  RefreshCw,
  Languages,
} from 'lucide-react';
import { useAuth, BOOTSTRAPPED_ADMIN_EMAIL } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Command } from '../types';
import { seedStarterLibrary } from '../services/commands';
import firebaseConfig from '../../firebase-applet-config.json';

interface SettingsPageProps {
  publicCommands: Command[];
  privateCommands: Command[];
  onRefreshData: () => Promise<void>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  publicCommands,
  privateCommands,
  onRefreshData,
}) => {
  const { user, isAdmin } = useAuth();
  const { success, error, info } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Export all accessible commands as JSON
  const handleExportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      language,
      userEmail: user?.email || 'anonymous',
      publicCommands,
      privateCommands: user ? privateCommands : [],
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commandvault-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    success(
      language === 'id' ? 'Ekspor Berhasil' : 'Export complete',
      language === 'id' ? 'Seluruh pustaka perintah diunduh sebagai cadangan JSON.' : 'Command library downloaded as JSON backup.'
    );
  };

  // Seed standard library into Firestore
  const handleSeedDatabase = async () => {
    if (!user || !isAdmin) {
      error(
        language === 'id' ? 'Izin Administrator Diperlukan' : 'Admin authorization required',
        language === 'id' ? 'Hanya administrator yang dapat menulis perintah bawaan ke Firestore.' : 'Only administrators can seed public commands to Firestore.'
      );
      return;
    }

    setIsSeeding(true);
    try {
      const count = await seedStarterLibrary(user.uid);
      await onRefreshData();
      success(
        language === 'id' ? 'Basis Data Berhasil Diisi' : 'Database seeded',
        language === 'id' ? `Berhasil menulis ${count} perintah standar ke Cloud Firestore.` : `Successfully wrote ${count} standard commands to Cloud Firestore.`
      );
    } catch (err: any) {
      console.error('Seeding error:', err);
      error(
        language === 'id' ? 'Gagal mengisi basis data' : 'Failed to seed',
        err.message || (language === 'id' ? 'Periksa aturan keamanan Firestore.' : 'Please verify Firestore security rules.')
      );
    } finally {
      setIsSeeding(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshData();
      info(
        language === 'id' ? 'Data Disinkronkan' : 'Data synchronized',
        language === 'id' ? 'Berhasil memuat catatan terbaru dari Cloud Firestore.' : 'Fetched latest records from Cloud Firestore.'
      );
    } catch (err: any) {
      error(
        language === 'id' ? 'Sinkronisasi gagal' : 'Sync failed',
        err.message || (language === 'id' ? 'Kesalahan jaringan.' : 'Network error.')
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('settingsTitle')}</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('settingsDesc')}
        </p>
      </div>

      {/* Language Preference Card */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-800/50">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'id' ? 'Bahasa Aplikasi (Language)' : 'Application Language'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'id' ? 'Pilih bahasa tampilan antarmuka dan dokumentasi sintaks' : 'Choose your preferred language for the interface and syntax documentation'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setLanguage('id')}
            className={`p-3.5 rounded-2xl border text-left transition ${
              language === 'id'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 shadow-sm'
                : 'border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">Bahasa Indonesia</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                ID 🇮🇩
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Bahasa Indonesia aktif sebagai bahasa utama antarmuka.
            </p>
          </button>

          <button
            onClick={() => setLanguage('en')}
            className={`p-3.5 rounded-2xl border text-left transition ${
              language === 'en'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 shadow-sm'
                : 'border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">English</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                EN 🇬🇧
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              English language for international developers.
            </p>
          </button>
        </div>
      </div>

      {/* User & Admin Access Card */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-800/50">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('authAndRolesTitle')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('authAndRolesDesc')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-2xl code-container">
            <span className="text-slate-400 block mb-1">{t('currentUserStatus')}</span>
            {user ? (
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {user.email} (UID: {user.uid.slice(0, 12)}...)
              </span>
            ) : (
              <span className="text-slate-500 italic">{t('guestBrowsing')}</span>
            )}
          </div>

          <div className="p-3.5 rounded-2xl code-container">
            <span className="text-slate-400 block mb-1">{t('adminPrivileges')}</span>
            {isAdmin ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                {t('authorizedAdminStatus')} ({BOOTSTRAPPED_ADMIN_EMAIL})
              </span>
            ) : (
              <span className="text-slate-500">{t('standardUserStatus')}</span>
            )}
          </div>
        </div>
      </div>

      {/* Cloud Firestore Status Card */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800/50">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('firestoreBackendTitle')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('firestoreBackendDesc')}
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl glass-input hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{t('syncBtn')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl code-container font-mono">
            <span className="text-slate-400 block mb-1 text-[11px] font-sans">{t('firebaseProjectIdLabel')}</span>
            <span className="text-slate-800 dark:text-slate-200">{firebaseConfig.projectId}</span>
          </div>

          <div className="p-3.5 rounded-2xl code-container font-mono">
            <span className="text-slate-400 block mb-1 text-[11px] font-sans">{t('firestoreDatabaseIdLabel')}</span>
            <span className="text-slate-800 dark:text-slate-200">{firebaseConfig.firestoreDatabaseId}</span>
          </div>
        </div>

        {/* Database Seeding Option for Admin */}
        {isAdmin && (
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs">
              <p className="font-semibold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                {t('seedLibraryTitle')}
              </p>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                {t('seedLibraryDesc')}
              </p>
            </div>
            <button
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm disabled:opacity-50 shrink-0"
            >
              {isSeeding ? t('seedingBtn') : t('seedBtn')}
            </button>
          </div>
        )}
      </div>

      {/* Backup & Export */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/50 dark:border-amber-800/50">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('exportBackupTitle')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('exportBackupDesc')}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
            {language === 'id'
              ? `Mengekspor ${publicCommands.length} perintah publik dan ${user ? privateCommands.length : 0} perintah pribadi Anda termasuk sintaks, kategori, dan tag.`
              : `Exports ${publicCommands.length} public commands and ${user ? privateCommands.length : 0} private commands including syntax, categories, and tags.`}
          </p>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('exportBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
