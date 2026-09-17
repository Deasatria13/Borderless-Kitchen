// admin.js — Borderless Kitchen CMS
// Terhubung ke Firebase Auth (login admin) + Firestore (menuItems, orders)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// TODO: samain dengan config di frontend-starter/firebase-config.js (project yang sama)
const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ---------- AUTH ----------
const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errorEl = document.getElementById("loginError");
  errorEl.textContent = "";
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    errorEl.textContent = "Login gagal: email atau password salah.";
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginView.classList.add("hidden");
    dashboardView.classList.remove("hidden");
    listenOrders();
    listenMenuItems();
  } else {
    loginView.classList.remove("hidden");
    dashboardView.classList.add("hidden");
  }
});

// ---------- TAB SWITCHING ----------
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".tab").forEach((t) => t.classList.add("hidden"));
    document.getElementById(btn.dataset.tab + "Tab").classList.remove("hidden");
  });
});

// ---------- ORDERS (realtime, read-only in CMS) ----------
function listenOrders() {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    const tbody = document.getElementById("ordersTableBody");
    tbody.innerHTML = "";
    document.getElementById("orderCount").textContent = `${snapshot.size} pesanan`;

    snapshot.forEach((docSnap) => {
      const o = docSnap.data();
      const time = o.createdAt?.toDate ? o.createdAt.toDate().toLocaleString("id-ID") : "-";
      const itemsText = (o.items || []).map((i) => `${i.name} x${i.qty}`).join(", ");
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${time}</td>
        <td>${escapeHtml(o.name)}</td>
        <td>${escapeHtml(o.phone)}</td>
        <td>${escapeHtml(o.address)}</td>
        <td>${escapeHtml(itemsText)}</td>
        <td>Rp ${Number(o.total || 0).toLocaleString("id-ID")}</td>
        <td>${escapeHtml(o.status || "new")}</td>
      `;
      tbody.appendChild(row);
    });
  });
}

// ---------- MENU ITEMS (CRUD) ----------
function listenMenuItems() {
  onSnapshot(collection(db, "menuItems"), (snapshot) => {
    const grid = document.getElementById("menuGrid");
    grid.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const m = docSnap.data();
      const card = document.createElement("div");
      card.className = "menu-card" + (m.available ? "" : " unavailable");
      card.innerHTML = `
        <img src="${m.imageUrl || ""}" onerror="this.style.display='none'" />
        <h3>${escapeHtml(m.name)}</h3>
        <div class="price">Rp ${Number(m.price || 0).toLocaleString("id-ID")}</div>
        <div class="actions">
          <button class="edit">Edit</button>
          <button class="delete">Hapus</button>
        </div>
      `;
      card.querySelector(".edit").addEventListener("click", () => openMenuForm(docSnap.id, m));
      card.querySelector(".delete").addEventListener("click", async () => {
        if (confirm(`Hapus "${m.name}"?`)) await deleteDoc(doc(db, "menuItems", docSnap.id));
      });
      grid.appendChild(card);
    });
  });
}

const menuForm = document.getElementById("menuForm");

document.getElementById("addMenuBtn").addEventListener("click", () => openMenuForm());
document.getElementById("cancelMenuBtn").addEventListener("click", () => menuForm.classList.add("hidden"));

function openMenuForm(id = "", data = {}) {
  document.getElementById("menuId").value = id;
  document.getElementById("menuName").value = data.name || "";
  document.getElementById("menuPrice").value = data.price || "";
  document.getElementById("menuCategory").value = data.category || "";
  document.getElementById("menuImage").value = data.imageUrl || "";
  document.getElementById("menuDescription").value = data.description || "";
  document.getElementById("menuAvailable").checked = data.available !== false;
  menuForm.classList.remove("hidden");
}

document.getElementById("saveMenuBtn").addEventListener("click", async () => {
  const id = document.getElementById("menuId").value;
  const payload = {
    name: document.getElementById("menuName").value.trim(),
    price: Number(document.getElementById("menuPrice").value) || 0,
    category: document.getElementById("menuCategory").value.trim(),
    imageUrl: document.getElementById("menuImage").value.trim(),
    description: document.getElementById("menuDescription").value.trim(),
    available: document.getElementById("menuAvailable").checked,
    updatedAt: serverTimestamp(),
  };

  if (!payload.name || !payload.price) {
    alert("Nama dan harga menu wajib diisi.");
    return;
  }

  if (id) {
    await updateDoc(doc(db, "menuItems", id), payload);
  } else {
    payload.createdAt = serverTimestamp();
    await addDoc(collection(db, "menuItems"), payload);
  }
  menuForm.classList.add("hidden");
});

function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
