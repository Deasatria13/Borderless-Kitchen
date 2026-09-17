/**
 * Cloud Function — Borderless Kitchen
 * Trigger otomatis setiap ada dokumen baru di koleksi "orders".
 * Kirim ringkasan pesanan ke EMAIL admin + WHATSAPP admin.
 *
 * Kenapa di sini, bukan di frontend?
 * - API key / credential notifikasi TIDAK boleh ada di kode frontend (publik).
 * - Frontend cukup nulis ke Firestore; notifikasi jadi tanggung jawab backend.
 *
 * Deploy: firebase deploy --only functions
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const nodemailer = require("nodemailer");
const axios = require("axios");

// ---------- CONFIG (isi via `firebase functions:config:set` atau env vars) ----------
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "REPLACE_WITH_ADMIN_EMAIL";
const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP || "REPLACE_WITH_ADMIN_WA_NUMBER"; // format: 628xxxxxxxxxx

const transporter = nodemailer.createTransport({
  service: "gmail", // ganti sesuai provider email kamu, atau pakai SMTP custom
  auth: {
    user: process.env.SMTP_USER || "REPLACE_ME",
    pass: process.env.SMTP_PASS || "REPLACE_ME", // gunakan App Password, bukan password akun biasa
  },
});

exports.onNewOrder = onDocumentCreated("orders/{orderId}", async (event) => {
  const order = event.data.data();
  const orderId = event.params.orderId;

  const itemsList = (order.items || [])
    .map((i) => `- ${i.name} x${i.qty} = Rp ${(i.price * i.qty).toLocaleString("id-ID")}`)
    .join("\n");

  const summary = `
PESANAN BARU — Borderless Kitchen
ID: ${orderId}

Nama     : ${order.name}
Telepon  : ${order.phone}
Alamat   : ${order.address}

Items:
${itemsList}

Total: Rp ${Number(order.total || 0).toLocaleString("id-ID")}
`;

  // ---------- 1. Kirim Email ----------
  try {
    await transporter.sendMail({
      from: `"Borderless Kitchen" <${process.env.SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `Pesanan Baru dari ${order.name}`,
      text: summary,
    });
  } catch (err) {
    console.error("Gagal kirim email:", err);
  }

  // ---------- 2. Kirim WhatsApp ----------
  // Contoh pakai CallMeBot (gratis, simple) — ganti sesuai provider WA pilihan kamu
  // (alternatif: Twilio WhatsApp API, Fonnte, Wablas, dll)
  try {
    const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY || "REPLACE_ME";
    await axios.get("https://api.callmebot.com/whatsapp.php", {
      params: {
        phone: ADMIN_WHATSAPP,
        text: summary,
        apikey: CALLMEBOT_API_KEY,
      },
    });
  } catch (err) {
    console.error("Gagal kirim WhatsApp:", err);
  }
});
