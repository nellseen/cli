import { SafetyAnalysis } from '../types';

export function analyzeCommandSafety(commandText: string, lang: 'id' | 'en' = 'id'): SafetyAnalysis {
  const normalized = commandText.trim().toLowerCase();

  // High danger checks
  if (
    normalized.includes('rm -rf /') ||
    normalized.includes('rm -rf /*') ||
    normalized.includes('mkfs') ||
    normalized.includes('dd if=') ||
    normalized.includes(':(){ :|:& };:') ||
    normalized.includes('> /dev/sd') ||
    normalized.includes('> /dev/nvme') ||
    normalized.includes('fdisk') ||
    normalized.includes('parted')
  ) {
    return {
      isDestructive: true,
      severity: 'danger',
      warningTitle:
        lang === 'id'
          ? 'Operasi Destruktif / Tidak Dapat Dibatalkan'
          : 'Destructive / Irreversible Operation',
      warningExplanation:
        lang === 'id'
          ? 'Perintah ini dapat menghapus disk secara permanen, memformat partisi sistem, atau mematikan kernel tanpa konfirmasi. Periksa pengenal disk dan jalur direktori secara teliti sebelum dijalankan.'
          : 'This command can permanently erase storage drives, reformat partitions, or crash system processes without confirmation. Verify disk identifiers and paths carefully before running.',
    };
  }

  // Moderate caution checks
  if (
    normalized.includes('rm -rf') ||
    normalized.includes('rm -r') ||
    normalized.includes('chmod -r 777') ||
    normalized.includes('chmod 777') ||
    normalized.includes('chown -r') ||
    normalized.includes('iptables -f') ||
    normalized.includes('ufw reset') ||
    normalized.includes('docker system prune -a --volumes') ||
    normalized.includes('git reset --hard') ||
    normalized.includes('git clean -fdx') ||
    normalized.includes('drop database') ||
    normalized.includes('truncate table') ||
    normalized.includes('kill -9 -1')
  ) {
    return {
      isDestructive: true,
      severity: 'caution',
      warningTitle:
        lang === 'id'
          ? 'Perhatian: Potensi Kehilangan Data / Risiko Hak Akses'
          : 'Caution: Potential Data Loss or Privilege Risk',
      warningExplanation:
        lang === 'id'
          ? 'Perintah ini menghapus berkas rekursif, me-reset pohon kerja Git, mengosongkan aturan firewall, atau membuka izin berkas ke semua pengguna. Pastikan Anda telah membuat cadangan data yang diperlukan.'
          : 'This command recursively deletes files, resets uncommitted Git trees, wipes firewall rules, or grants world-writable permissions. Ensure you have backups and intended targets.',
    };
  }

  return {
    isDestructive: false,
    severity: 'safe',
  };
}
