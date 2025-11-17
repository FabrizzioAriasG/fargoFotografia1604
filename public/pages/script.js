window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById("form");
  const inputFotos = document.getElementById("fotos");
  const eventId = document.getElementById("eventId");
  const statusDiv = document.getElementById("status");
  const sendBtn = document.getElementById("sendBtn");
  const preview = document.getElementById("preview");

  if (!form) return console.warn("Formulario 'form' no encontrado");
  if (!inputFotos) return console.warn("Input 'fotos' no encontrado");
  if (!statusDiv) return console.warn("Elemento 'status' no encontrado");

  function clearPreview() {
    if (!preview) return;
    preview.innerHTML = "";
  }

  function showPreview(files) {
    if (!preview) return;
    preview.innerHTML = "";
    const max = Math.min(files.length, 5);
    for (let i = 0; i < max; i++) {
      const file = files[i];
      if (!file || !file.type || !file.type.startsWith("image/")) continue;
      const img = document.createElement("img");
      img.alt = file.name || "preview";
      img.className = "preview-img";
      img.src = URL.createObjectURL(file);
      img.onload = () => URL.revokeObjectURL(img.src);
      preview.appendChild(img);
    }
  }

  inputFotos.addEventListener("change", () => {
    const files = inputFotos.files;
    if (!files || files.length === 0) {
      clearPreview();
      statusDiv.textContent = "";
      return;
    }
    if (files.length > 5) {
      statusDiv.textContent = "Máximo 5 fotos permitidas.";
      inputFotos.value = "";
      clearPreview();
      return;
    }
    statusDiv.textContent = "";
    showPreview(files);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const files = inputFotos.files;
    if (!files || files.length === 0) {
      statusDiv.textContent = "Seleccioná al menos una foto.";
      return;
    }

    if (files.length > 5) {
      statusDiv.textContent = "Máximo 5 fotos permitidas.";
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("fotos", files[i]);
    }

    const idValue = (eventId && eventId.value) ? eventId.value.trim() : "";
    const url = idValue ? `/api/subir?id=${encodeURIComponent(idValue)}` : "/api/subir";

    statusDiv.textContent = "Subiendo...";
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.textContent = "Enviando...";
    }

    try {
      const res = await fetch(url, { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        statusDiv.textContent = "✅ Fotos enviadas correctamente!";
        inputFotos.value = "";
        if (eventId) eventId.value = "";
        clearPreview();
      } else {
        statusDiv.textContent = "❌ Error: " + (data.error || res.statusText || res.status || "desconocido");
      }
    } catch (err) {
      console.error(err);
      statusDiv.textContent = "❌ Falló la subida, revisá la consola.";
    } finally {
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.textContent = "Enviar";
      }
    }
  });
});
