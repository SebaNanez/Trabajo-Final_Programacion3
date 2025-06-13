// Formateadores
const arsFmt = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2
});

// 1) Carga y renderiza criptos para comprar
async function loadCriptos() {
  const tbody = document.getElementById("cryptoTableBody");
  if (!tbody) return;

  try {
    const res = await fetch("http://localhost:5000/api/Criptos");
    const criptos = await res.json(); // [{ id, nombre, simbolo }, …]

    // obtenemos precio de cada cripto
    const datos = await Promise.all(criptos.map(async c => {
      const r = await fetch(`https://criptoya.com/api/${c.simbolo}/ARS/1`);
      const data = await r.json();
      return { ...c, precio: data.buenbit.ask };
    }));

    tbody.innerHTML = "";
    datos.forEach(c => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.nombre}</td>
        <td>${c.simbolo}</td>
        <td>${arsFmt.format(c.precio)}</td>
        <td>
          <button
            class="btn-buy btn btn-sm btn-warning"
            data-criptoid="${c.id}"
            data-price="${c.precio}"
          >Comprar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error cargando criptos:", err);
  }
}

// 2) Filtro de búsqueda
function setupSearchFilter() {
  const input = document.getElementById("cryptoSearch");
  const tbody = document.getElementById("cryptoTableBody");
  if (!input || !tbody) return;

  input.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();
    tbody.querySelectorAll("tr").forEach(tr => {
      const nombre  = tr.children[0].textContent.toLowerCase();
      const simbolo = tr.children[1].textContent.toLowerCase();
      tr.style.display = (nombre.includes(term) || simbolo.includes(term))
        ? "" : "none";
    });
  });
}

// 3) Abre modal y procesa compra
function setupBuyModal() {
  const buyModalEl    = document.getElementById("buyModal");
  const confirmBuyBtn = document.getElementById("confirmBuyBtn");
  if (!buyModalEl || !confirmBuyBtn) return;
  const buyModal = new bootstrap.Modal(buyModalEl);

  document.querySelectorAll(".btn-buy").forEach(btn => {
    btn.addEventListener("click", () => {
      const id    = btn.dataset.criptoid;
      const price = parseFloat(btn.dataset.price);
      const name  = btn.closest("tr").children[0].textContent;

      buyModalEl.dataset.criptoid = id;
      buyModalEl.dataset.price    = price;
      document.getElementById("modalCryptoNameBuy").textContent  = name;
      document.getElementById("modalCryptoPriceBuy").textContent = arsFmt.format(price);

      const inp  = buyModalEl.querySelector("#buyAmount");
      const tot  = buyModalEl.querySelector("#modalTotalPriceBuy");
      const calc = () => tot.textContent = arsFmt.format(price * (parseFloat(inp.value) || 0));

      inp.value = 1;
      calc();
      inp.oninput = calc;

      buyModal.show();
    });
  });

  confirmBuyBtn.addEventListener("click", async () => {
    const uid      = +localStorage.getItem("userId");
    const cid      = +buyModalEl.dataset.criptoid;
    const price    = +buyModalEl.dataset.price;
    const qty      = +buyModalEl.querySelector("#buyAmount").value || 0;
    const amountAR = price * qty;

    try {
      const res = await fetch("http://localhost:5000/api/transacciones/compra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUsuario: uid,
          idCripto:  cid,
          Cantidad:  qty,
          Monto:     amountAR
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "Error en la compra");

      Swal.fire({
        icon: 'success',
        title: 'Compra exitosa',
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
      buyModal.hide();
    }
  });
}

// 4) Inicialización en Index
document.addEventListener("DOMContentLoaded", async () => {
  await loadCriptos();
  setupSearchFilter();
  setupBuyModal();
});
