import express from "express";
import multer from "multer";
import cors from "cors";
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

// Log de API Key
console.log("API KEY CARGADA:", process.env.RESEND_API_KEY ? "sí" : "no");

const app = express();
app.use(cors());
app.use(express.json());

// Log de requests
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

// Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Multer: guardar archivos EN MEMORIA (no en disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB por archivo
  }
});

// Endpoint de subida
app.post("/api/subir", upload.any(), async (req, res) => {
  try {
    const { nombre, correo, telefono, mensaje } = req.body;
    const files = req.files || [];

    // Adjuntos para Resend (desde memoria)
    const attachments = files.map(f => ({
      filename: f.originalname,
      content: f.buffer,
      type: f.mimetype
    }));

    const response = await resend.emails.send({
      from: "Fargo Fotografía <onboarding@resend.dev>",
      to: "fabriago1604@gmail.com",
      subject: "Fotos.",
      html: `
        <h2>Fotos del evento ${req.query.id || ""}</h2>
      `,
      attachments
    });

    console.log("Respuesta Resend:", response);

    res.json({ ok: true, response });
  } catch (error) {
    console.error("Error al enviar:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Servir frontend (carpeta public)
app.use(express.static("public"));

// Último: 404
app.use((req, res) => {
  res.status(404).send(`No encontrado: ${req.url}`);
});

// Iniciar server
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
