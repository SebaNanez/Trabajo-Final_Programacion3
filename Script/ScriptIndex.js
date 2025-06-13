async function loadCriptos() {
  const tbody = document.getElementById("cryptoTableBody");
  if (!tbody) return;

  try {
    const resList = await fetch("http://localhost:5000/api/Criptos");
    const criptos = await resList.json();
    const arsFormatter = new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: 'ARS', minimumFractionDigits: 2
    });

    const promesas = criptos.map(async c => {
      const resPrecio = await fetch(
        `https://criptoya.com/api/${c.simbolo}/ARS/1`
      );
      const data = await resPrecio.json();
      const precio = data.buenbit.ask;
      return { ...c, precio };
    });

    const datos = await Promise.all(promesas);

    tbody.innerHTML = "";
    datos.forEach(c => {
      const precioFormateado = arsFormatter.format(c.precio);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.nombre}</td>
        <td>${c.simbolo}</td>
        <td>${precioFormateado}</td>
        <td>
          <button
            class="btn-buy"
            data-price="${c.precio}"      
          >Comprar</button>
        </td>
        <td>
          <button
            class="btn-sell"
            data-price="${c.precio}"     
          >Vender</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error cargando criptos:", err);
  }
}

function setupSearchFilter() {
  const input = document.getElementById("cryptoSearch");
  const tbody = document.getElementById("cryptoTableBody");
  if (!input || !tbody) return;

  input.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();

    // Para cada fila, escondemos o mostramos
    Array.from(tbody.querySelectorAll("tr")).forEach(tr => {
      const nombre   = tr.children[0].textContent.trim().toLowerCase();
      const simbolo  = tr.children[1].textContent.trim().toLowerCase();
      const match    = nombre.includes(term) || simbolo.includes(term);

      tr.style.display = match ? "" : "none";
    });
  });
}
function setupActionModals() {
  const buyModalEl  = document.getElementById('buyModal');
  const sellModalEl = document.getElementById('sellModal');
  const buyModal    = new bootstrap.Modal(buyModalEl);
  const sellModal   = new bootstrap.Modal(sellModalEl);

  const arsFormatter = new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', minimumFractionDigits: 2
  });

  // COMPRAR
  document.querySelectorAll('.btn-buy').forEach(btn => {
    btn.addEventListener('click', () => {
      const name      = btn.closest('tr').children[0].textContent;
      const unitPrice = parseFloat(btn.dataset.price);  // aquí el precio completo

      document.getElementById('modalCryptoNameBuy').textContent  = name;
      document.getElementById('modalCryptoPriceBuy').textContent =
        arsFormatter.format(unitPrice);

      const amountInput = buyModalEl.querySelector('#buyAmount');
      const totalEl     = buyModalEl.querySelector('#modalTotalPriceBuy');

      const recalc = () => {
        const qty = parseFloat(amountInput.value) || 0;
        totalEl.textContent = arsFormatter.format(unitPrice * qty);
      };

      amountInput.value = 1;
      recalc();
      amountInput.oninput = recalc;

      buyModal.show();
    });
  });

  // VENDER
  document.querySelectorAll('.btn-sell').forEach(btn => {
    btn.addEventListener('click', () => {
      const name      = btn.closest('tr').children[0].textContent;
      const unitPrice = parseFloat(btn.dataset.price);

      document.getElementById('modalCryptoNameSell').textContent  = name;
      document.getElementById('modalCryptoPriceSell').textContent =
        arsFormatter.format(unitPrice);

      const amountInput = sellModalEl.querySelector('#sellAmount');
      const totalEl     = sellModalEl.querySelector('#modalTotalPriceSell');

      const recalc = () => {
        const qty = parseFloat(amountInput.value) || 0;
        totalEl.textContent = arsFormatter.format(unitPrice * qty);
      };

      amountInput.value = 1;
      recalc();
      amountInput.oninput = recalc;

      sellModal.show();
    });
  });
}



// Al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
  await loadCriptos();          // tu función de fetch + render
  setupSearchFilter();          // si tienes filtro de búsqueda
  setupActionModals();          // ¡engancha los botones y modales!
});
