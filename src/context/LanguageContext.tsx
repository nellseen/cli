import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'id' | 'en';

interface Translations {
  [key: string]: {
    en: string;
    id: string;
  };
}

export const translations = {
  // Brand & Shell
  brandName: { en: 'CommandVault', id: 'CommandVault' },
  brandSubtitle: { en: 'Developer Command Reference', id: 'Referensi Perintah Developer' },
  navHeading: { en: 'Navigation', id: 'Navigasi' },

  // Navigation Items
  navOverview: { en: 'Overview', id: 'Ikhtisar' },
  navAllCommands: { en: 'All Commands', id: 'Semua Perintah' },
  navPublicLibrary: { en: 'Public Library', id: 'Pustaka Publik' },
  navPrivateCommands: { en: 'My Private Commands', id: 'Perintah Pribadi Saya' },
  navFavorites: { en: 'Favorites', id: 'Favorit' },
  navCategories: { en: 'Categories', id: 'Kategori' },
  navSettings: { en: 'Settings', id: 'Pengaturan' },

  // Auth Status in Sidebar
  authAuthenticated: { en: 'Authenticated', id: 'Terotentikasi' },
  authSignOut: { en: 'Sign out', id: 'Keluar' },
  authSignInPrompt: { en: 'Sign in to manage private commands and bookmarks.', id: 'Masuk untuk mengelola perintah pribadi dan bookmark.' },
  authSignInRegister: { en: 'Sign In / Register', id: 'Masuk / Daftar' },
  authAdminBadge: { en: 'Authorized Administrator', id: 'Administrator Resmi' },

  // TopNav
  searchPlaceholder: { en: 'Search commands, syntax, tags, categories...', id: 'Cari perintah, sintaks, tag, kategori...' },
  clearSearch: { en: 'Clear', id: 'Hapus' },
  allCategories: { en: 'All Categories', id: 'Semua Kategori' },
  addCommandBtn: { en: 'Add Command', id: 'Tambah Perintah' },
  signInBtn: { en: 'Sign In', id: 'Masuk' },
  lightTheme: { en: 'Switch to Light Theme', id: 'Beralih ke Tema Terang' },
  darkTheme: { en: 'Switch to Dark Theme', id: 'Beralih ke Tema Gelap' },
  language: { en: 'Language', id: 'Bahasa' },

  // Dashboard
  heroBadge: { en: 'Developer CLI Reference Architecture', id: 'Arsitektur Referensi CLI Developer' },
  heroTitle: { en: 'CommandVault Library', id: 'Pustaka CommandVault' },
  heroDesc: {
    en: 'Curated syntax references for Linux, Bash, Git, Docker, and developer tools. Copy commands instantly to your clipboard with clean syntax formatting and safety auditing.',
    id: 'Referensi sintaks pilihan untuk Linux, Bash, Git, Docker, dan peralatan developer. Salin perintah instan ke clipboard dengan format rapi dan audit keselamatan.',
  },
  browseAllCommands: { en: 'Browse All Commands', id: 'Jelajahi Semua Perintah' },
  totalCommandsStat: { en: 'Total Commands', id: 'Total Perintah' },
  totalCommandsDesc: { en: 'Available in library', id: 'Tersedia di pustaka' },
  publicLibraryStat: { en: 'Public Library', id: 'Pustaka Publik' },
  publicLibraryDesc: { en: 'Shared reference library', id: 'Pustaka referensi bersama' },
  privateCommandsStat: { en: 'My Private', id: 'Pribadi Saya' },
  privateCommandsDesc: { en: 'Only visible to you', id: 'Hanya dapat dilihat oleh Anda' },
  privateSignInPrompt: { en: 'Sign in to access', id: 'Masuk untuk mengakses' },
  favoritesStat: { en: 'Favorites', id: 'Favorit' },
  favoritesDesc: { en: 'Saved for quick access', id: 'Disimpan untuk akses cepat' },
  popularCategories: { en: 'Popular Categories', id: 'Kategori Populer' },
  viewAll: { en: 'View All', id: 'Lihat Semua' },
  recentlyAdded: { en: 'Recently Added Commands', id: 'Perintah Baru Ditambahkan' },
  exploreLibrary: { en: 'Explore Library', id: 'Jelajahi Pustaka' },
  noCommandsLoaded: { en: 'No commands loaded yet', id: 'Belum ada perintah yang dimuat' },
  getStartedFirstCommand: { en: 'Get started by creating your first CLI command.', id: 'Mulai dengan menambahkan perintah CLI pertama Anda.' },
  commandsCountUnit: { en: 'commands', id: 'perintah' },
  commandSingleUnit: { en: 'command', id: 'perintah' },

  // Library Page
  libraryHeadingAll: { en: 'Command Reference Library', id: 'Pustaka Referensi Perintah' },
  libraryHeadingPublic: { en: 'Public Community Library', id: 'Pustaka Komunitas Publik' },
  libraryHeadingPrivate: { en: 'My Private Commands', id: 'Perintah Pribadi Saya' },
  libraryHeadingFavorites: { en: 'Bookmarked Favorites', id: 'Perintah Favorit Tersimpan' },
  matchingCurrentFilters: { en: 'matching current filters', id: 'sesuai dengan filter aktif' },
  sortRecent: { en: 'Recently Added', id: 'Baru Ditambahkan' },
  sortAlphabetical: { en: 'Alphabetical (A-Z)', id: 'Alfabetis (A-Z)' },
  sortUpdated: { en: 'Recently Updated', id: 'Terakhir Diperbarui' },
  activeFiltersLabel: { en: 'Active filters:', id: 'Filter aktif:' },
  filterQuery: { en: 'Query', id: 'Kueri' },
  filterCategory: { en: 'Category', id: 'Kategori' },
  clearAllFilters: { en: 'Clear all', id: 'Hapus semua filter' },
  noCommandsFoundTitle: { en: 'No commands found', id: 'Tidak ada perintah ditemukan' },
  noCommandsFoundSearch: { en: 'Try modifying your search keywords or clearing active category filters.', id: 'Coba ubah kata kunci pencarian Anda atau hapus filter kategori aktif.' },
  noCommandsFoundPrivate: { en: 'You have not created any private commands yet.', id: 'Anda belum membuat perintah pribadi apa pun.' },
  noCommandsFoundFavorites: { en: 'You have not starred any favorite commands yet. Click the star icon on any command card to bookmark it.', id: 'Anda belum menandai perintah favorit. Klik ikon bintang pada kartu perintah mana saja untuk menyimpannya.' },
  noCommandsFoundGeneral: { en: 'Start your collection by adding your first CLI command.', id: 'Mulai koleksi Anda dengan menambahkan perintah CLI pertama.' },

  // Command Card & Modals
  publicBadge: { en: 'Public', id: 'Publik' },
  privateBadge: { en: 'Private', id: 'Pribadi' },
  destructiveBadge: { en: 'Destructive', id: 'Destruktif' },
  cautionBadge: { en: 'Caution', id: 'Perhatian' },
  copyBtn: { en: 'Copy', id: 'Salin' },
  copiedBtn: { en: 'Copied', id: 'Tersalin' },
  viewDetails: { en: 'View Details', id: 'Lihat Detail' },
  editBtn: { en: 'Edit', id: 'Edit' },
  deleteBtn: { en: 'Delete', id: 'Hapus' },
  copySuccessToast: { en: 'Copied to clipboard', id: 'Disalin ke papan klip' },
  copySuccessDesc: { en: 'Command syntax ready to paste.', id: 'Sintaks perintah siap ditempel.' },
  copyFailedToast: { en: 'Failed to copy', id: 'Gagal menyalin' },
  copyFailedDesc: { en: 'Please select and copy the command text manually.', id: 'Silakan pilih dan salin teks perintah secara manual.' },

  // Command Detail Modal
  commandSyntax: { en: 'Command Syntax', id: 'Sintaks Perintah' },
  copyCommand: { en: 'Copy Command', id: 'Salin Perintah' },
  copiedToClipboard: { en: 'Copied to Clipboard', id: 'Tersalin ke Papan Klip' },
  descAndPurpose: { en: 'Description & Purpose', id: 'Deskripsi & Tujuan' },
  keywordsAndTags: { en: 'Keywords & Tags', id: 'Kata Kunci & Tag' },
  createdDateLabel: { en: 'Created', id: 'Dibuat' },
  ownerLabel: { en: 'Owner', id: 'Pemilik' },

  // Form Modal
  addNewCommandTitle: { en: 'Add New Command', id: 'Tambah Perintah Baru' },
  editCommandTitle: { en: 'Edit Command', id: 'Edit Perintah' },
  formSubtext: { en: 'Reference documentation is stored as text and never executed.', id: 'Dokumentasi referensi disimpan sebagai teks dan tidak pernah dieksekusi.' },
  commandNameLabel: { en: 'Command Name', id: 'Nama Perintah' },
  commandNamePlaceholder: { en: 'e.g. Find & Delete Old Log Files, Git Interactive Rebase', id: 'contoh: Temukan & Hapus Berkas Log Lama, Git Interactive Rebase' },
  commandSyntaxLabel: { en: 'Command Text / CLI Syntax', id: 'Teks Perintah / Sintaks CLI' },
  preservesLineBreaks: { en: 'Preserves line breaks', id: 'Mempertahankan jeda baris' },
  descLabel: { en: 'Description & Purpose', id: 'Deskripsi & Tujuan' },
  descPlaceholder: { en: 'Explain what the command does, flags used, and expected behavior...', id: 'Jelaskan fungsi perintah, opsi flag yang digunakan, dan hasil yang diharapkan...' },
  categoryLabel: { en: 'Category', id: 'Kategori' },
  addCustomCategoryOption: { en: '+ Add Custom Category...', id: '+ Tambah Kategori Kustom...' },
  customCategoryPlaceholder: { en: 'e.g. Kubernetes, AWS, Rust', id: 'contoh: Kubernetes, AWS, Rust' },
  cancelBtn: { en: 'Cancel', id: 'Batal' },
  visibilityLabel: { en: 'Visibility Scope', id: 'Cakupan Visibilitas' },
  visibilityPublicLabel: { en: 'Public', id: 'Publik' },
  visibilityPrivateLabel: { en: 'Private (Owner only)', id: 'Pribadi (Hanya Pemilik)' },
  visibilityAdminNotice: { en: 'Only authorized admins can publish public library commands.', id: 'Hanya administrator resmi yang dapat mempublikasikan perintah ke pustaka umum.' },
  tagsLabel: { en: 'Tags (Optional)', id: 'Tag (Opsional)' },
  tagInputPlaceholder: { en: 'Type tag and press Enter', id: 'Ketik tag lalu tekan Enter' },
  addTagBtn: { en: 'Add', id: 'Tambah' },
  saveFavoritesCheckbox: { en: 'Save to My Favorites automatically', id: 'Simpan ke Favorit Saya secara otomatis' },
  saveChangesBtn: { en: 'Save Changes', id: 'Simpan Perubahan' },
  createCommandBtn: { en: 'Create Command', id: 'Buat Perintah' },
  savingBtn: { en: 'Saving...', id: 'Menyimpan...' },

  // Delete Confirm Modal
  deleteModalTitle: { en: 'Delete Command', id: 'Hapus Perintah' },
  deleteModalWarning: { en: 'Are you sure you want to delete', id: 'Apakah Anda yakin ingin menghapus' },
  deleteModalWarningSuffix: { en: '? This action cannot be reversed.', id: '? Tindakan ini tidak dapat dibatalkan.' },
  deletingBtn: { en: 'Deleting...', id: 'Menghapus...' },
  confirmDeleteBtn: { en: 'Delete Command', id: 'Hapus Perintah' },

  // Categories Page
  categoriesPageTitle: { en: 'Command Categories', id: 'Kategori Perintah' },
  categoriesPageDesc: { en: 'Explore specialized developer toolkits and workflow commands organized by domain.', id: 'Jelajahi kumpulan alat developer dan perintah alur kerja yang dikelompokkan berdasarkan domain.' },
  browseCategory: { en: 'Browse', id: 'Jelajahi' },

  // Settings Page
  settingsTitle: { en: 'Settings & System', id: 'Pengaturan & Sistem' },
  settingsDesc: { en: 'Manage administrator configuration, database sync, and data exports.', id: 'Kelola konfigurasi administrator, sinkronisasi basis data, dan ekspor data.' },
  authAndRolesTitle: { en: 'Authentication & Roles', id: 'Otentikasi & Peran' },
  authAndRolesDesc: { en: 'Role-based authorization enforced by Firestore Security Rules', id: 'Otorisasi berbasis peran diberlakukan melalui Aturan Keamanan Firestore' },
  currentUserStatus: { en: 'Current User Status', id: 'Status Pengguna Saat Ini' },
  guestBrowsing: { en: 'Unauthenticated (Guest browsing)', id: 'Belum Masuk (Mode Penjelajah Tamu)' },
  adminPrivileges: { en: 'Administrator Privileges', id: 'Hak Istimewa Administrator' },
  authorizedAdminStatus: { en: 'Authorized Admin', id: 'Administrator Resmi' },
  standardUserStatus: { en: 'Standard User (Private commands only)', id: 'Pengguna Standar (Hanya perintah pribadi)' },
  firestoreBackendTitle: { en: 'Cloud Firestore Backend', id: 'Backend Cloud Firestore' },
  firestoreBackendDesc: { en: 'Persistent database & rules configuration', id: 'Basis data persisten & konfigurasi aturan keamanan' },
  syncBtn: { en: 'Sync', id: 'Sinkron' },
  firebaseProjectIdLabel: { en: 'Firebase Project ID', id: 'ID Proyek Firebase' },
  firestoreDatabaseIdLabel: { en: 'Firestore Database ID', id: 'ID Basis Data Firestore' },
  seedLibraryTitle: { en: 'Initialize Curated Public Commands', id: 'Inisialisasi Perintah Publik Pilihan' },
  seedLibraryDesc: { en: 'Populate Cloud Firestore with 26+ curated commands (Linux, Bash, Git, Docker, NPM, etc.)', id: 'Isi Cloud Firestore dengan 26+ perintah pilihan (Linux, Bash, Git, Docker, NPM, dll.)' },
  seedBtn: { en: 'Seed Public Library', id: 'Isi Pustaka Publik' },
  seedingBtn: { en: 'Writing to Firestore...', id: 'Menulis ke Firestore...' },
  exportBackupTitle: { en: 'Data Export & Backup', id: 'Ekspor & Cadangan Data' },
  exportBackupDesc: { en: 'Download your command library in structured JSON format', id: 'Unduh seluruh pustaka perintah Anda dalam format JSON terstruktur' },
  exportBtn: { en: 'Export JSON', id: 'Ekspor JSON' },

  // Auth Modal
  authModalSignIn: { en: 'Sign in to CommandVault', id: 'Masuk ke CommandVault' },
  authModalRegister: { en: 'Create Account', id: 'Buat Akun Baru' },
  authModalSubtext: { en: 'Unlock private vaults and sync favorites', id: 'Buka brankas pribadi dan sinkronkan favorit' },
  tabSignIn: { en: 'Sign In', id: 'Masuk' },
  tabRegister: { en: 'Register', id: 'Daftar' },
  continueWithGoogle: { en: 'Continue with Google', id: 'Lanjutkan dengan Google' },
  orWithEmail: { en: 'or with email', id: 'atau dengan email' },
  emailAddressLabel: { en: 'Email Address', id: 'Alamat Email' },
  passwordLabel: { en: 'Password', id: 'Kata Sandi' },
  confirmPasswordLabel: { en: 'Confirm Password', id: 'Konfirmasi Kata Sandi' },
  authenticatingBtn: { en: 'Authenticating...', id: 'Mengotentikasi...' },
  authNotice: {
    en: 'Self-registration creates personal user accounts. Admin privileges are verified through Firestore security rules.',
    id: 'Pendaftaran mandiri membuat akun pribadi. Hak administrator diverifikasi melalui aturan keamanan Firestore.',
  },

  // Safety
  destructiveOpTitle: { en: 'Destructive / Irreversible Operation', id: 'Operasi Destruktif / Tidak Dapat Dibatalkan' },
  destructiveOpDesc: {
    en: 'This command can permanently erase storage drives, reformat partitions, or crash system processes without confirmation. Verify disk identifiers and paths carefully before running.',
    id: 'Perintah ini dapat menghapus partisi media penyimpanan secara permanen, memformat ulang disk, atau menghentikan proses sistem tanpa konfirmasi. Pastikan memeriksa jalur dan pengenal disk dengan cermat sebelum dijalankan.',
  },
  cautionOpTitle: { en: 'Caution: Potential Data Loss or Privilege Risk', id: 'Perhatian: Potensi Kehilangan Data atau Risiko Hak Akses' },
  cautionOpDesc: {
    en: 'This command recursively deletes files, resets uncommitted Git trees, wipes firewall rules, or grants world-writable permissions. Ensure you have backups and intended targets.',
    id: 'Perintah ini menghapus berkas secara rekursif, me-reset pohon kerja Git yang belum di-commit, membersihkan aturan firewall, atau memberikan izin tulis terbuka ke publik. Pastikan Anda memiliki cadangan data.',
  },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to 'id' as requested by user ("terapkan pergantian bahasa ke Indonesia")
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('commandvault_lang');
    if (saved === 'en' || saved === 'id') return saved;
    return 'id'; // Default to Indonesian
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('commandvault_lang', lang);
    document.documentElement.lang = lang;
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === 'id' ? 'en' : 'id';
    setLanguage(nextLang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: keyof typeof translations): string => {
    const entry = translations[key];
    if (!entry) return String(key);
    return entry[language] || entry.en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
