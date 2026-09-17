# Borderless Kitchen — Project Notes

Project ini punya 2 bagian, dikerjakan terpisah tapi konek lewat 1 Firebase project yang sama:

| Bagian | Dikerjakan oleh | Folder |
|---|---|---|
| **Landing page pemesanan** (customer isi nama, alamat, telepon, pilih menu, order) | Kamu | `frontend-starter/` |
| **CMS Admin** (kelola menu, lihat daftar order) + Cloud Function notifikasi | Admin project | `cms/`, `functions/` |

Kamu **cuma perlu fokus di folder `frontend-starter/`**. Tidak perlu sentuh CMS atau Cloud Function.

---

## 1. Yang harus kamu bikin

Halaman pemesanan (bisa 1 halaman, single page) yang berisi:
1. Daftar menu (nama, harga, foto, kategori) — diambil dari Firestore, **bukan hardcode**
2. Customer bisa pilih menu + jumlah (qty), lihat ringkasan order
3. Form akhir: **Nama, Alamat, Nomor Telepon**
4. Tombol "Pesan Sekarang" → data terkirim ke Firestore

Desain, layout, framework (vanilla JS, atau lainnya) — **bebas**, terserah kamu. Yang penting cara manggil Firebase-nya ikut kontrak di bawah.

Tidak perlu payment gateway. Tidak perlu kirim email/WhatsApp dari sisi kamu — itu sudah otomatis ditangani backend begitu order masuk ke database.

---

## 2. Cara konek ke Firebase

Semua sudah disiapkan di `frontend-starter/firebase-config.js` — **jangan diubah strukturnya**, itu kontrak antara halaman kamu dan database.

```js
import { getMenuItems, submitOrder } from "./firebase-config.js";
```

### a. Tampilkan menu
```js
const menuItems = await getMenuItems();
// menuItems = [{ id, name, price, category, imageUrl, description, available }, ...]
```

### b. Kirim order
```js
await submitOrder({
  name: "Budi Santoso",
  address: "Jl. Contoh No. 1, Jakarta",
  phone: "+6281234567890",
  items: [
    { menuId: "abc123", name: "Nasi Goreng", price: 25000, qty: 2 }
  ],
  total: 50000
});
```

> ⚠️ Field name harus **persis sama** seperti contoh di atas (`name`, `address`, `phone`, `items`, `total`). Kalau berubah, integrasi ke CMS bisa rusak.

### c. Firebase config (API key dll)
Di `firebase-config.js` ada bagian `firebaseConfig` yang masih `REPLACE_ME`. Untuk development, kamu boleh:
- Bikin Firebase project testing sendiri (gratis), isi config-nya sementara, **DAN**
- Bikin koleksi `menuItems` manual di Firestore Console dengan field yang sama (name, price, category, imageUrl, available) supaya bisa ditest tampil di halaman kamu.

Nanti pas dikirim balik, config akan di-replace ke project Firebase asli — jadi jangan hardcode config di tempat lain selain file ini.

---

## 3. Skema data (Firestore)

**Koleksi `menuItems`** (read-only dari sisi kamu):
```
{
  name: string,
  price: number,
  category: string,
  imageUrl: string,
  description: string,
  available: boolean
}
```

**Koleksi `orders`** (kamu hanya create, tidak read):
```
{
  name: string,
  address: string,
  phone: string,
  items: [{ menuId, name, price, qty }],
  total: number
}
```
(field `status` dan `createdAt` otomatis ditambahkan backend, tidak perlu kamu isi)

---

## 4. Checklist sebelum kirim balik

- [ ] Menu tampil dinamis dari Firestore (bukan hardcode di HTML)
- [ ] Form validasi: nama, alamat, telepon wajib diisi sebelum submit
- [ ] Setelah submit sukses, ada konfirmasi ke customer (misal: "Pesanan diterima!")
- [ ] Tidak ada error di console browser
- [ ] Responsive di mobile (mayoritas customer order dari HP)
- [ ] `firebase-config.js` tidak diubah strukturnya (import/export function tetap sama)

## 5. Cara kirim hasil kerjaan

Paling gampang: zip semua isi folder `frontend-starter/` (index.html, css, js kamu + firebase-config.js yang sudah dipakai), atau share lewat GitHub repo. Karena kontrak Firebase-nya sudah fix dari awal, tinggal di-drop ke project asli tanpa perlu re-wiring apa pun.

**Deadline: 2 hari.** Kalau ada pertanyaan soal skema data, tanya sebelum mulai ngoding ya, biar nggak bolak-balik revisi.
# Borderless-Kitchen
