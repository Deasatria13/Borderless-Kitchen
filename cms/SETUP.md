# CMS Setup (bagian kamu)

1. Buat Firebase project baru di console.firebase.google.com → aktifkan:
   - **Firestore Database** (mode production)
   - **Authentication** → Email/Password (buat 1 akun admin buat login CMS)
   - **Cloud Functions** (butuh upgrade ke plan Blaze / pay-as-you-go, tapi gratis kalau traffic kecil)

2. Ganti `firebaseConfig` di `cms/admin.js` (dan nanti juga di `firebase-config.js` yang dikasih ke frontend dev) dengan config asli project kamu — ambil dari Project Settings → General → Your apps.

3. Deploy Firestore rules:
   ```
   firebase deploy --only firestore:rules
   ```

4. Setup & deploy Cloud Function (notifikasi email + WA):
   ```
   cd functions
   npm install
   firebase functions:config:set admin.email="EMAIL_KAMU" admin.whatsapp="628xxxxxxxxxx"
   firebase deploy --only functions
   ```
   Isi juga `SMTP_USER` / `SMTP_PASS` (App Password Gmail) dan `CALLMEBOT_API_KEY` (atau ganti provider WA sesuai selera — Fonnte/Wablas juga bisa, tinggal ganti bagian axios request-nya).

5. Hosting CMS + landing page: paling simpel pakai **Firebase Hosting** biar satu ekosistem sama Firestore/Functions:
   ```
   firebase init hosting
   firebase deploy --only hosting
   ```

6. Setelah frontend dev kirim balik folder `frontend-starter/` yang sudah jadi, tinggal:
   - copy isinya ke root folder hosting (atau public/)
   - replace `firebaseConfig` di `firebase-config.js` dengan config project asli (kalau dia pakai project testing sendiri waktu development)
   - deploy ulang

Tidak perlu ubah struktur data apapun kalau dia ikutin skema di README utama.
