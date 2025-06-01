const email = "bot@keepalive.com";  // Tu usuario bot
const password = "tuPasswordSegura";

async function mantenerActivoRender() {
  try {
    // 1. Iniciar sesión y obtener token
    const loginRes = await fetch("https://losiones-1.onrender.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!loginRes.ok) {
      console.warn("❌ Error al hacer login:", loginRes.status);
      return;
    }

    const loginData = await loginRes.json();
    const token = loginData.token;

    // 2. Crear venta temporal
    const ventaFalsa = {
      clientName: "BOT CLIENT",
      productName: "KeepAlive Trigger",
      saleDate: new Date().toISOString(),
      price: 111,
      installments: "1",
      advancePayment: 0,
      clientAddress: "BOT"
    };

    const crearRes = await fetch("https://losiones-1.onrender.com/api/sales/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(ventaFalsa)
    });

    if (!crearRes.ok) {
      console.warn("❌ Error al crear venta:", crearRes.status);
      return;
    }

    const venta = await crearRes.json();
    console.log("✅ Venta creada:", venta._id);

    // 3. Esperar un poco (opcional)
    await new Promise(r => setTimeout(r, 2000));

    // 4. Eliminar la venta
    const eliminarRes = await fetch(`https://losiones-1.onrender.com/api/sales/${venta._id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (eliminarRes.ok) {
      console.log("🗑️ Venta eliminada:", venta._id);
    } else {
      console.warn("⚠️ No se pudo eliminar la venta:", eliminarRes.status);
    }

  } catch (error) {
    console.error("🔴 Error en keepAlive:", error.message);
  }
}

// Ejecutar ahora
mantenerActivoRender();

// Repetir cada 5 minutos
setInterval(mantenerActivoRender, 5 * 60 * 1000);
