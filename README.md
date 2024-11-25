# IJAH Analytics Migration

## Pembaruan Website IJAH Analytics

### Tentang IJAH Analytics

IJAH Analytics adalah platform analitik yang dirancang untuk membantu peneliti dan praktisi dalam menghubungkan antara tanaman, senyawa, protein, dan penyakit. Platform ini memungkinkan pengguna untuk memahami hubungan kompleks antara berbagai elemen dalam biologi dan pengobatan. Dengan fokus pada analisis komprehensif dan berbasis data, IJAH Analytics mendukung penelitian yang lebih mendalam terkait efikasi tanaman obat dan pengembangan pengobatan berbasis senyawa alami.

#### Fitur Utama IJAH Analytics

1. **Keterhubungan Tanaman, Senyawa, Protein, dan Penyakit**  
   IJAH Analytics memungkinkan pengguna untuk mengetahui keterhubungan antara tanaman, senyawa, protein, dan penyakit, memungkinkan pemahaman alur dari tanaman hingga ke efeknya pada penyakit.

2. **Target Protein atau Penyakit**  
   Pengguna dapat mengetahui target protein atau penyakit berdasarkan data dari tanaman dan senyawa yang digunakan.

3. **Penemuan Tanaman atau Senyawa Potensial**  
   IJAH Analytics memudahkan pencarian tanaman atau senyawa yang berpotensi menargetkan dan menyembuhkan protein atau penyakit tertentu.

4. **Validasi Khasiat Komposisi Tanaman**  
   IJAH Analytics dapat memvalidasi dan memeriksa ulang apakah komposisi tanaman, seperti formula Jamu, memiliki khasiat tertentu yang sesuai.

### Keunggulan IJAH Analytics

- **Analisis Berbasis Data**: Menggunakan data besar untuk menemukan keterhubungan antara elemen-elemen biologis, memberikan wawasan baru yang mungkin tidak dapat ditemukan secara manual.
- **Pendekatan Multidisiplin**: Memungkinkan kolaborasi antara peneliti dari berbagai bidang seperti biologi, kimia, dan farmasi untuk menghasilkan penelitian yang lebih lengkap.
- **Mendukung Pengembangan Obat Berbasis Alam**: Membantu memvalidasi penggunaan tradisional dari tanaman dan senyawa alami dalam pengobatan modern.

### Tujuan Pembaruan Website

Pembaruan website IJAH Analytics dilakukan untuk:

- Meningkatkan aksesibilitas dan performa platform agar lebih responsif dan mudah digunakan oleh pengguna.
- Menambahkan fitur baru yang mendukung analisis lebih mendalam.
- Meningkatkan antarmuka pengguna agar lebih intuitif dan interaktif.

### Instalasi dan Penggunaan

Saat ini tidak ada instruksi instalasi yang tersedia.

### Panduan Instalasi: Backend, Database, dan Konfigurasi

#### Pengaturan Backend

##### Buat File Konfigurasi

- Buat `config_database.json` dan letakkan di direktori `ijah/api`.
- Buat file `.env` dan letakkan di direktori `ijah/api_upload`.
- Buat `config_webserver.ts` dan letakkan di `ijah/src/app`.

##### Unduh dan Impor Database

- Dapatkan file dump database dan impor menggunakan psql atau pgAdmin4.

##### Instal Dependensi

- Pastikan Composer sudah terinstal di komputer Anda.
- Jalankan `composer install` di dalam direktori `ijah/api` untuk menginstal dependensi PHP yang diperlukan.

##### Konfigurasi File Lingkungan

- Perbarui file konfigurasi (`config_database.json`, `.env`, `config_webserver.ts`) dengan nomor port dan detail konektivitas yang sesuai dengan pengaturan Anda.

##### Jalankan Server Backend

- Mulai server backend dengan menjalankan perintah:

  ```
  php -S localhost:8000
  ```

##### Uji Konektivitas Database

- Verifikasi bahwa backend terhubung ke database dengan mengakses URL berikut di browser Anda: [http://localhost:8000/connectivity.php](http://localhost:8000/connectivity.php)

#### Pengaturan Frontend

##### Instal Dependensi Frontend

- Arahkan ke direktori frontend dan jalankan:

  ```
  npm install
  ```

##### Mulai Backend dan Database

- Pastikan bahwa server backend dan database sudah berjalan sebelum melanjutkan ke frontend.

##### Jalankan Server Frontend

- Mulai server pengembangan Angular dengan menjalankan:

  ```
  ng serve
  ```

##### Akses Aplikasi

- Server frontend akan tersedia di [http://localhost:4200](http://localhost:4200).

  Catatan: Pastikan semua dependensi yang diperlukan telah diinstal, dan konfigurasi backend sudah selaras dengan frontend untuk memastikan operasi aplikasi berjalan dengan lancar.

### Komponen

- **Database**
- **Crawler**
- **Inserter**
- **Source**
- **Web**
  - **Front-end**
    - Angular: [https://angular.io/](https://angular.io/)
  - **Back-end**
    - PHP-backend
    - NodeJS-backend
- **Predictor**
  - Compound-protein connectivity predictor
- **Feature**
  - Similarity
  - Classifier
  - Cluster
  - Dataset
  - Compound synergy predictor

### Dependencies (Old)

Dependencies yang digunakan pada website lama:
- numpy >= 1.12.0
- scipy >= 0.18.1
- psycopg2 >= 2.6.2
- scikit-learn >= 0.18.1
- PHP >= 5.5.9
- PostgreSQL >= 9.6.1

### Dependencies (New)

Dependencies yang kemungkinan kami gunakan kedepannya:
- numpy >= 1.24.0
- scipy >= 1.10.0
- psycopg2 >= 2.9.7
- scikit-learn >= 1.3.0
- PHP >= 8.2.0
- PostgreSQL >= 15.0
- and more (see other READMEs)

### To Do List

- Mengupgrade versi PHP untuk meningkatkan keamanan dan performa
- Mengupgrade versi dependency untuk meningkatkan keamanan dan performa.
- Meningkatkan antarmuka pengguna agar lebih responsif dan intuitif.
- Mengoptimalkan performa website untuk meningkatkan kecepatan akses.

### Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

### Kontak

Jika Anda memiliki pertanyaan atau memerlukan informasi lebih lanjut, silakan hubungi kami di [support@ijahanalytics.com](mailto:support@ijahanalytics.com).

