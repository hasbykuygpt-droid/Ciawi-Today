# Ciawi Today — Portal Berita Lokal

Website portal berita statis (HTML, CSS, JavaScript vanilla) terinspirasi dari desain Ciawi Today.

## Struktur folder

```
ciawi-today/
├── index.html            # Beranda
├── berita.html            # Daftar & filter berita
├── detail-berita.html     # Halaman detail satu artikel (?id=slug)
├── insight.html           # Ciawi Insight
├── video.html              # Halaman video
├── galeri.html             # Galeri foto
├── opini.html               # Kolom opini warga
├── tentang.html             # Tentang kami & tim redaksi
├── style.css                # Semua styling
├── script.js                 # Logika render, filter, dark mode, dsb
├── data.json                  # Sumber data berita (dummy)
├── assets/
│   └── images/                # Simpan semua foto berita di sini
├── .gitignore
└── README.md
```

## Menjalankan secara lokal

Karena `script.js` mengambil `data.json` via `fetch()`, buka project ini lewat local server (bukan `file://`), contoh:

```bash
# Python
python3 -m http.server 8080

# atau Node
npx serve .
```

Lalu buka `http://localhost:8080`.

## Menambah berita baru

Tambahkan objek baru di `data.json` mengikuti struktur yang sudah ada, lalu taruh gambarnya di `assets/images/`.

## Deploy ke GitHub Pages

1. Push project ini ke repo GitHub (lihat panduan struktur repo di bawah).
2. Masuk ke **Settings → Pages** di repo.
3. Pilih branch `main` dan folder `/ (root)`, lalu **Save**.
4. Website akan aktif di `https://<username>.github.io/<nama-repo>/`.
