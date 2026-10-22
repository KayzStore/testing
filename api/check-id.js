import axios from "axios";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { userId, zoneId } = req.body || {};

  if (!userId || !zoneId) {
    return res.status(400).json({ success: false, message: "userId dan zoneId wajib diisi" });
  }

  try {
    const { data } = await axios.post(
      "https://gopay.co.id/games/v1/order/user-account",
      {
        code: "MOBILE_LEGENDS",
        data: { userId: String(userId), zoneId: String(zoneId) },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json, text/plain, */*",
          "Origin": "https://gopay.co.id",
          "Referer": "https://gopay.co.id/",
        },
        timeout: 15000,
      }
    );

    if (data?.message !== "Success" || !data?.data?.username) {
      return res.status(400).json({
        success: false,
        message: "ID / Zone tidak ditemukan atau tidak valid",
      });
    }

    return res.json({
      success: true,
      data: {
        nickname: data.data.username,
        country: data.data.countryOrigin
          ? data.data.countryOrigin.toUpperCase()
          : "UNKNOWN",
        userId: String(userId),
        zoneId: String(zoneId),
      },
    });
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      err.message ||
      "Gagal cek akun. Coba lagi nanti.";
    return res.status(400).json({ success: false, message: msg });
  }
}
