import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { Dashboard } from './pages/Dashboard';
import { Library } from './pages/Library';
import { CategoriesPage } from './pages/CategoriesPage';
import { SettingsPage } from './pages/SettingsPage';
import { CommandDetailModal } from './components/commands/CommandDetailModal';
import { CommandFormModal } from './components/commands/CommandFormModal';
import { DeleteConfirmModal } from './components/commands/DeleteConfirmModal';
import { AuthModal } from './components/auth/AuthModal';
import { Command, FilterView, SortOrder } from './types';
import {
  getPublicCommands,
  getPrivateCommands,
  getUserFavorites,
  addFavorite,
  removeFavorite,
  deleteCommand as deleteCommandDoc,
  deleteAllTemplateCommands,
} from './services/commands';
import { testConnection } from './services/firebase';

function AppContent() {
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const { language } = useLanguage();

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('commandvault_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('commandvault_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('commandvault_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Navigation state
  const [currentView, setCurrentView] = useState<'dashboard' | 'library' | 'categories' | 'settings'>('dashboard');
  const [activeFilter, setActiveFilter] = useState<FilterView>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Commands Data state
  const [publicCommands, setPublicCommands] = useState<Command[]>([]);
  const [privateCommands, setPrivateCommands] = useState<Command[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<Command | null>(null);
  const [detailCommand, setDetailCommand] = useState<Command | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Command | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load public and private commands
  const loadCommands = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch public commands
      const fetchedPublic = await getPublicCommands();
      const userOnlyCommands = (fetchedPublic || []).filter(
        (c) => !c.id.startsWith('cmd-') && c.ownerUid !== 'system_curated'
      );
      setPublicCommands(userOnlyCommands);

      // Fetch private commands if authenticated
      if (user) {
        const fetchedPrivate = await getPrivateCommands(user.uid);
        setPrivateCommands(fetchedPrivate || []);

        const userFavs = await getUserFavorites(user.uid);
        setFavorites(userFavs || []);
      } else {
        setPrivateCommands([]);
        // Guest local favorites
        const localFavs = JSON.parse(localStorage.getItem('commandvault_guest_favs') || '[]');
        setFavorites(localFavs);
      }
    } catch (err: any) {
      console.error('Error fetching commands:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial load, purge any template commands, and connection check
  useEffect(() => {
    testConnection();
    deleteAllTemplateCommands()
      .catch(() => {})
      .finally(() => {
        loadCommands();
      });
  }, [loadCommands]);

  // Navigate handler
  const handleNavigate = (view: string, filter?: FilterView, category?: string | null) => {
    if (view === 'library') {
      setCurrentView('library');
      if (filter) setActiveFilter(filter);
      if (category !== undefined) setSelectedCategory(category);
    } else {
      setCurrentView(view as any);
      if (category !== undefined) setSelectedCategory(category);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle Favorite
  const handleToggleFavorite = async (commandId: string) => {
    const isCurrentlyFav = favorites.includes(commandId);
    const newFavorites = isCurrentlyFav
      ? favorites.filter((id) => id !== commandId)
      : [...favorites, commandId];

    setFavorites(newFavorites);

    if (user) {
      try {
        if (isCurrentlyFav) {
          await removeFavorite(user.uid, commandId);
          info(language === 'id' ? 'Dihapus dari favorit' : 'Removed from favorites');
        } else {
          await addFavorite(user.uid, commandId);
          success(language === 'id' ? 'Ditambahkan ke favorit' : 'Added to favorites');
        }
      } catch (err: any) {
        // Revert on error
        setFavorites(favorites);
        error(
          language === 'id' ? 'Gagal memperbarui favorit' : 'Failed to update favorites',
          err.message
        );
      }
    } else {
      // Local storage for guest
      localStorage.setItem('commandvault_guest_favs', JSON.stringify(newFavorites));
      if (isCurrentlyFav) {
        info(language === 'id' ? 'Dihapus dari favorit (sesi tamu)' : 'Removed from favorites (guest session)');
      } else {
        success(language === 'id' ? 'Ditambahkan ke favorit (sesi tamu)' : 'Added to favorites (guest session)');
      }
    }
  };

  // Confirm delete command
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCommandDoc(deleteTarget.id);
      success(
        language === 'id' ? 'Perintah berhasil dihapus' : 'Command deleted',
        `"${deleteTarget.name}" ${language === 'id' ? 'telah dihapus.' : 'was removed.'}`
      );

      // Update state immediately
      setPublicCommands((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setPrivateCommands((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setFavorites((prev) => prev.filter((id) => id !== deleteTarget.id));

      if (detailCommand?.id === deleteTarget.id) {
        setDetailCommand(null);
      }
      setDeleteTarget(null);
    } catch (err: any) {
      error(
        language === 'id' ? 'Penghapusan gagal' : 'Delete failed',
        err.message || (language === 'id' ? 'Izin ditolak.' : 'Permission denied.')
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Responsive Sidebar */}
      <Sidebar
        currentView={
          currentView === 'library' ? `library-${activeFilter}` : currentView
        }
        onNavigate={handleNavigate}
        publicCount={publicCommands.length}
        privateCount={privateCommands.length}
        favoritesCount={favorites.length}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Navigation */}
        <TopNav
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (currentView !== 'library') setCurrentView('library');
          }}
          selectedCategory={selectedCategory}
          onCategorySelect={(cat) => {
            setSelectedCategory(cat);
            if (currentView !== 'library') setCurrentView('library');
          }}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenAddModal={() => {
            setEditingCommand(null);
            setIsAddModalOpen(true);
          }}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <Dashboard
              publicCommands={publicCommands}
              privateCommands={privateCommands}
              favorites={favorites}
              onNavigate={handleNavigate}
              onViewDetails={(cmd) => setDetailCommand(cmd)}
              onEditCommand={(cmd) => {
                setEditingCommand(cmd);
                setIsAddModalOpen(true);
              }}
              onDeleteCommand={(cmd) => setDeleteTarget(cmd)}
              onToggleFavorite={handleToggleFavorite}
              onOpenAddModal={() => {
                setEditingCommand(null);
                setIsAddModalOpen(true);
              }}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          )}

          {currentView === 'library' && (
            <Library
              publicCommands={publicCommands}
              privateCommands={privateCommands}
              favorites={favorites}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              sortOrder={sortOrder}
              onSortChange={setSortOrder}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onViewDetails={(cmd) => setDetailCommand(cmd)}
              onEditCommand={(cmd) => {
                setEditingCommand(cmd);
                setIsAddModalOpen(true);
              }}
              onDeleteCommand={(cmd) => setDeleteTarget(cmd)}
              onToggleFavorite={handleToggleFavorite}
              onOpenAddModal={() => {
                setEditingCommand(null);
                setIsAddModalOpen(true);
              }}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              isLoading={isLoading}
            />
          )}

          {currentView === 'categories' && (
            <CategoriesPage
              publicCommands={publicCommands}
              privateCommands={privateCommands}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'settings' && (
            <SettingsPage
              publicCommands={publicCommands}
              privateCommands={privateCommands}
              onRefreshData={loadCommands}
            />
          )}
        </main>
      </div>

      {/* Command Details Modal */}
      <CommandDetailModal
        command={detailCommand}
        isOpen={!!detailCommand}
        onClose={() => setDetailCommand(null)}
        isFavorite={detailCommand ? favorites.includes(detailCommand.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onEdit={(cmd) => {
          setEditingCommand(cmd);
          setIsAddModalOpen(true);
        }}
        onDelete={(cmd) => setDeleteTarget(cmd)}
      />

      {/* Add / Edit Command Form Modal */}
      <CommandFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCommand(null);
        }}
        editingCommand={editingCommand}
        onSuccess={() => {
          loadCommands();
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        command={deleteTarget}
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}
