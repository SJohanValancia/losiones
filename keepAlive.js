function generarCorreoAleatorio() {
  const aleatorio = Math.random().toString(36).substring(2, 20);
  return `${aleatorio}@noexiste.com`;
}

async function mantenerActivoRender() {
  const email = generarCorreoAleatorio();
  const password = "clave" + Math.random().toString(36).substring(2, 8);

  try {
    const res = await fetch("https://losiones-1.onrender.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    console.log("🟢 Keep-alive enviado (respuesta:", res.status, ")");
  } catch (e) {
    console.warn("🔴 Error en keep-alive:", e.message);
  }
}

// Ejecutar ahora mismo al cargar
mantenerActivoRender();

// Repetir cada 5 minutos
setInterval(mantenerActivoRender, 5 * 60 * 1000);
