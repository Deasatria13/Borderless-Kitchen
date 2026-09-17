/**
 * firebase-config.js
 * -------------------
 * JANGAN dihapus atau di-restructure. File ini "kontrak" antara halaman
 * pemesanan (index.html) dan CMS/Firebase punya admin project.
 *
 * Cara pakai di index.html:
 *   <script type="module" src="firebase-config.js"></script>
 *
 * Import ke script kamu:
 *   import { getMenuItems, submitOrder } from "./firebase-config.js";
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// TODO: config ini akan di-replace oleh admin dengan config project Firebase asli
// sebelum di-deploy. Kamu boleh pakai project Firebase testing kamu sendiri dulu
// untuk development, ASAL struktur koleksi & field-nya sama persis seperti di README.
const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Ambil semua menu item yang available = true
 * Return: array of { id, name, price, category, imageUrl, description, available }
 */
export async function getMenuItems() {
  const q = query(collection(db, "menuItems"), where("available", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Kirim order baru ke koleksi "orders".
 * WAJIB pakai struktur ini persis (lihat README bagian "Skema Order"):
 *
 * submitOrder({
 *   name: "Budi Santoso",
 *   address: "Jl. Contoh No. 1, Jakarta",
 *   phone: "+6281234567890",
 *   items: [
 *     { menuId: "abc123", name: "Nasi Goreng", price: 25000, qty: 2 }
 *   ],
 *   total: 50000
 * })
 *
 * Notifikasi email & WhatsApp ke admin dikirim OTOMATIS oleh Cloud Function
 * di backend begitu dokumen ini masuk — kamu TIDAK perlu urus itu di frontend.
 */
export async function submitOrder({ name, address, phone, items, total }) {
  if (!name || !address || !phone || !items || items.length === 0) {
    throw new Error("Data order tidak lengkap: name, address, phone, items wajib diisi.");
  }

  const docRef = await addDoc(collection(db, "orders"), {
    name,
    address,
    phone,
    items,
    total,
    status: "new",
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}
