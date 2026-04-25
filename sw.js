<script>
  let deferredPrompt;
  const installContainer = document.getElementById('install-pwa-container');
  const btnInstallPWA = document.getElementById('btnInstallPWA');

  // 1. Daftarkan Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('SW Aktif'))
        .catch(err => console.error('SW Gagal', err));
    });
  }

  // 2. Tangkap event "Aplikasi Bisa Diinstal"
  window.addEventListener('beforeinstallprompt', (e) => {
    // Mencegah browser memunculkan bar instalasi bawaan yang kecil
    e.preventDefault();
    // Simpan event agar bisa dipicu nanti
    deferredPrompt = e;
    // Tampilkan tombol buatan kita
    installContainer.style.display = 'block';
  });

  // 3. Logika saat tombol diklik
  btnInstallPWA.addEventListener('click', async () => {
    if (deferredPrompt) {
      // Munculkan prompt instalasi bawaan browser
      deferredPrompt.prompt();
      // Tunggu jawaban user (Accepted atau Dismissed)
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response: ${outcome}`);
      // Hapus prompt karena hanya bisa dipakai sekali
      deferredPrompt = null;
      // Sembunyikan tombol kita kembali
      installContainer.style.display = 'none';
    }
  });

  // 4. Sembunyikan tombol jika sudah terinstal
  window.addEventListener('appinstalled', () => {
    installContainer.style.display = 'none';
    deferredPrompt = null;
    alert('Terima kasih! Notula kini tersedia di layar utama Anda.');
  });
</script>