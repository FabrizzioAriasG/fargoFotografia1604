import { exec } from "child_process";
import open from "open";

// Arranca el servidor
const server = exec("node server.js");

server.stdout.on("data", data => {
  console.log(data.toString());
  // Cuando detectamos que el server está listo, abrimos el navegador
  if (data.toString().includes("Server en http://localhost:3000")) {
    open("http://localhost:3000"); // Si tu HTML está servido desde otro server, cambia la URL
  }
});

server.stderr.on("data", data => {
  console.error(data.toString());
});

// Para que cierre todo si presionamos Ctrl+C
process.on("SIGINT", () => {
  server.kill("SIGINT");
  process.exit();
});
