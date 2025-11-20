import express from "express";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

console.log("API KEY CARGADA:", process.env.RESEND_API_KEY ? "sí" : "no");


const app = express();
app.use(cors());
app.use(express.json());
// Log de peticiones para debugging
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

const resend = new Resend(process.env.RESEND_API_KEY);

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// Endpoint
// Aceptar uploads sin depender del nombre del campo (frontend usa `fotos`)
app.post("/api/subir", upload.any(), async (req, res) => {
  try {
    const { nombre, correo, telefono, mensaje } = req.body;
    const files = req.files || [];

    // Adjuntos correctos para Resend
    const attachments = files.map(f => ({
      filename: f.originalname,
      content: fs.readFileSync(f.path),
      type: f.mimetype
    }));

    const response = await resend.emails.send({
      from: "Fargo Fotografía <onboarding@resend.dev>",
      to: "fargofotografia16@gmail.com",
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
    res.status(500).json({ ok: false, error });
  }
});

// Servir los archivos estáticos (front-end)
app.use(express.static("public"));

// Handler 404 simple
app.use((req, res) => {
  res.status(404).send(`No encontrado: ${req.url}`);
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
 