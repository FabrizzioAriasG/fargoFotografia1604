import express from "express";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";
import { Resend } from "resend";
import open from "open";

dotenv.config();

const app = express();
// Limites y filtro: 5 MB por archivo, aceptar solo imágenes
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB por archivo
  fileFilter: (req, file, cb) => {
    if (file && file.mimetype && file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Solo se permiten archivos de imagen."), false);
  }
});

// Verificar API key
const resendKey = process.env.RESEND_API_KEY;
if (!resendKey) throw new Error("❌ Falta la API key de Resend en .env");

const resend = new Resend(resendKey);

app.use(express.json());

// POST endpoint para subir fotos
app.post("/api/subir", upload.array("fotos", 5), async (req, res) => {
  const files = req.files;
  const id = req.query.id || "evento_sin_id";

  if (!files || files.length === 0)
    return res.status(400).json({ error: "No se enviaron fotos." });

  try {
    const attachments = files.map(f => ({
      filename: f.originalname,
      content: fs.readFileSync(f.path, { encoding: "base64" }),
    }));

    await resend.emails.send({
      from: "Fotos <onboarding@resend.dev>",
      to: "fargofotografia16@gmail.com",
      subject: `Fotos del evento: ${id}`,
      text: "Acá van las fotos.",
      attachments,
    });

    files.forEach(f => fs.unlinkSync(f.path));

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo enviar el mail." });
  }
});

// Servir frontend
app.use(express.static("public"));

// Iniciar servidor y abrir navegador
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  // Abrir navegador solo en entorno de desarrollo/local
  if (process.env.NODE_ENV !== 'production') {
    try { open(`http://localhost:${PORT}`); } catch (e) { /* ignore on servers */ }
  }
});
