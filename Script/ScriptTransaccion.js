// formateador ARS
const arsFmt = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2
});

async function loadHistory() {
  const tbody = document.getElementById('historyBody');
  if (!tbody) return;

  try {
    const res = await fetch('http://localhost:5000/api/transacciones/obtener');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const txs = await res.json();
    console.log('📦 Transacciones JSON:', txs);

    // ordenar (aunque ya lo haces en el servidor)
    txs.sort((a, b) =>
      new Date(b.fechaTransaccion) - new Date(a.fechaTransaccion)
    );

    tbody.innerHTML = '';

    txs.forEach(t => {
      // usa la propiedad camelCase
      const date = new Date(t.fechaTransaccion);
      const fechaFmt = date.toLocaleString('es-AR', {
        year:   'numeric',
        month:  '2-digit',
        day:    '2-digit',
        hour:   '2-digit',
        minute: '2-digit'
      });

      const cripto = `${t.nombreCripto} (${t.symbolCripto})`;
      const accion  = t.accion;       // ya viene en minúscula
      const cantidad= t.cantidad;     // idem
      const monto   = t.monto;        // idem

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${fechaFmt}</td>
        <td>${cripto}</td>
        <td class="text-capitalize">${accion}</td>
        <td>${cantidad.toLocaleString('es-AR')}</td>
        <td>${arsFmt.format(monto)}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error('❌ No pude cargar historial:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadHistory);
