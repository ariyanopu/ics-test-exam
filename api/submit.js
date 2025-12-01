const axios = require("axios");
const FormData = require("form-data");
const Busboy = require("busboy");

// ⚠️ তোমার TOKEN & CHAT ID এখানে লেখো
const BOT_TOKEN = "8522852093:AAHpHzwKpFJj1X1pisMOiGVkNiSq4c8IDqU";
const CHAT_ID = "8288458304";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const bb = Busboy({ headers: req.headers });

  let form = {
    studentLabel: "",
    name: "",
    facebook: "",
    email: "",
    telegram: "",
    qsn5: "",
    qsn6: ""
  };

  let imageBuffer = null;
  let imageName = null;

  await new Promise((resolve, reject) => {
    bb.on("field", (name, value) => {
      form[name] = value;
    });

    bb.on("file", (name, file, info) => {
      imageName = info.filename;
      let chunks = [];
      file.on("data", (chunk) => chunks.push(chunk));
      file.on("end", () => {
        imageBuffer = Buffer.concat(chunks);
      });
    });

    bb.on("finish", resolve);
    bb.on("error", reject);

    req.pipe(bb);
  });

  const textMsg =
    `📘 <b>${form.studentLabel || "Student -1"}</b>\n` +
    `<b>Name:</b> ${form.name}\n` +
    `<b>Facebook:</b> ${form.facebook}\n` +
    `<b>Email:</b> ${form.email}\n` +
    `<b>Telegram:</b> ${form.telegram}\n` +
    `<b>Qsn5:</b> ${form.qsn5}\n` +
    `<b>Qsn6:</b> ${form.qsn6}`;

  // --- Send text message ---
  await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    chat_id: CHAT_ID,
    text: textMsg,
    parse_mode: "HTML"
  });

  // --- Send image if uploaded ---
  if (imageBuffer) {
    const fd = new FormData();
    fd.append("chat_id", CHAT_ID);
    fd.append("caption", form.studentLabel);
    fd.append("photo", imageBuffer, imageName);

    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
      fd,
      { headers: fd.getHeaders() }
    );
  }

  return res.status(200).send("Submitted Successfully ✔");
};
