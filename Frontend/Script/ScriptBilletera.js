// Formateador ARS
const arsFmt = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS'
});

// 1) Carga y pinta la billetera (para vender) y actualiza balance total
async function loadWallet() {
  const tbody       = document.getElementById("walletBody");
  const totalARSEl  = document.getElementById("totalARS");
  const totalUSDEl  = document.getElementById("totalUSD");
  if (!tbody || !totalARSEl || !totalUSDEl) return;

  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("No hay userId en localStorage");
    return;
  }

  try {
    // Traer datos de la billetera
    const res     = await fetch(`http://localhost:5000/api/billetera/usuario/${userId}`);
    if (!res.ok) throw new Error(`Error al obtener billetera: ${res.status}`);
    const entries = await res.json();

    // Render y acumulación
    tbody.innerHTML = "";
    let totalARS = 0;
    entries.forEach(e => {
      const name     = e.cripto.criptomoneda;
      const sym      = e.cripto.simbolo;
      const qty      = e.cantCriptos;
      const bal      = e.balance;
      const unit     = qty > 0 ? bal / qty : 0;
      const criptoId = e.cripto.id;

      totalARS += bal;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${name} (${sym})</td>
        <td>${qty.toLocaleString('es-AR')}</td>
        <td data-price="${unit}">${arsFmt.format(unit)}</td>
        <td>${arsFmt.format(bal)}</td>
        <td>
          <button class="btn-send btn btn-sm btn-warning"
                  data-criptoid="${criptoId}"
                  data-price="${unit}">
            Vender
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Mostrar total en ARS
    totalARSEl.textContent = arsFmt.format(totalARS);

    // Obtener cotización oficial del dólar y calcular USD
    try {
      const resUsd = await fetch("https://dolarapi.com/v1/dolares");
      if (!resUsd.ok) throw new Error("Error al obtener cotización USD");
      const datos = await resUsd.json();
      const oficial = datos.find(d => d.casa === "oficial");
      if (oficial) {
        const totalUSD = totalARS / oficial.venta;
        const usdFmt = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2
        });
        totalUSDEl.textContent = usdFmt.format(totalUSD);
      } else {
        console.warn("No se encontró cotización oficial");
        totalUSDEl.textContent = "-";
      }
    } catch (errUsd) {
      console.warn("Fallo al calcular USD:", errUsd);
      totalUSDEl.textContent = "-";
    }

    setupSellModal();

  } catch (err) {
    console.error("Error cargando billetera:", err);
  }
}

// 2) Carga e inyecta historial
async function loadHistory() {
  const tbody = document.getElementById("historyBody");
  if (!tbody) return;

  try {
    const res = await fetch("http://localhost:5000/api/transacciones/obtener");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const txs = await res.json();
    tbody.innerHTML = "";

    txs.forEach(t => {
      const d = new Date(t.fechaTransaccion).toLocaleString('es-AR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d}</td>
        <td>${t.nombreCripto} (${t.symbolCripto})</td>
        <td class="text-capitalize">${t.accion}</td>
        <td>${t.cantidad.toLocaleString('es-AR')}</td>
        <td>${arsFmt.format(t.monto)}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error cargando historial:", err);
  }
}

// 3) Modal de venta y transacción
function setupSellModal() {
  const sellModalEl    = document.getElementById("sellModal");
  const confirmSellBtn = document.getElementById("confirmSellBtn");
  if (!sellModalEl || !confirmSellBtn) return;
  const sellModal = new bootstrap.Modal(sellModalEl);

  document.querySelectorAll(".btn-send").forEach(btn => {
    btn.addEventListener("click", () => {
      const id    = btn.dataset.criptoid;
      const price = parseFloat(btn.dataset.price);
      const name  = btn.closest("tr").children[0].textContent;

      sellModalEl.dataset.criptoid = id;
      sellModalEl.dataset.price    = price;
      document.getElementById("modalCryptoNameSell").textContent  = name;
      document.getElementById("modalCryptoPriceSell").textContent = arsFmt.format(price);

      const inp  = sellModalEl.querySelector("#sellAmount");
      const tot  = sellModalEl.querySelector("#modalTotalPriceSell");
      const calc = () => tot.textContent = arsFmt.format(price * (parseFloat(inp.value) || 0));

      inp.value = 1;
      calc();
      inp.oninput = calc;

      sellModal.show();
    });
  });

  confirmSellBtn.addEventListener("click", async () => {
    const uid   = +localStorage.getItem("userId");
    const cid   = +sellModalEl.dataset.criptoid;
    const price = +sellModalEl.dataset.price;
    const qty   = +sellModalEl.querySelector("#sellAmount").value || 0;
    const amt   = price * qty;

    try {
      const res = await fetch("http://localhost:5000/api/transacciones/venta", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ idUsuario: uid, idCripto: cid, Cantidad: qty, Monto: amt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "Error en la venta");

      await loadWallet();
      await loadHistory();
      Swal.fire({
        icon: 'success',
        title: 'Venta exitosa',
        text: data.mensaje,
        customClass: {
          popup: 'swal2-popup--custom',
          title: 'swal2-title--gold',
          content: 'swal2-content--gold',
          confirmButton: 'swal2-confirm--gold'
        },
        buttonsStyling: false
      });
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e.message,
        customClass: {
          popup: 'swal2-popup--custom',
          title: 'swal2-title--gold',
          content: 'swal2-content--gold',
          confirmButton: 'swal2-confirm--gold'
        },
        buttonsStyling: false
      });
    } finally {
      sellModal.hide();
    }
  });
}

// 4) Inicialización en Billetera
document.addEventListener("DOMContentLoaded", async () => {
  await loadWallet();
  await loadHistory();
});
