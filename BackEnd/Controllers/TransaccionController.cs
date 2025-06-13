using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VirtualCripto.Data;
using VirtualCripto.Models;

namespace VirtualCripto.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransaccionesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TransaccionesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // DTO genérico para compra/venta
        public class TransaccionRequest
        {
            public int idUsuario { get; set; }
            public int idCripto { get; set; }
            public decimal Cantidad { get; set; }
            public decimal Monto { get; set; } // valor en ARS
        }

        // POST: api/transacciones/compra
        [HttpPost("compra")]
        public async Task<IActionResult> Comprar([FromBody] TransaccionRequest req)
        {
            // 1) Validaciones básicas
            if (req.Cantidad <= 0 || req.Monto <= 0)
                return BadRequest(new { mensaje = "Cantidad y monto deben ser mayores que cero." });

            // 2) Buscar o crear Billetera
            var wallet = await _context.Billeteras
                .SingleOrDefaultAsync(b =>
                    b.idUsuario == req.idUsuario &&
                    b.idCripto == req.idCripto);

            if (wallet == null)
            {
                wallet = new Billetera
                {
                    idUsuario = req.idUsuario,
                    idCripto = req.idCripto,
                    CantCriptos = req.Cantidad,
                    Balance = req.Monto
                };
                _context.Billeteras.Add(wallet);
            }
            else
            {
                wallet.CantCriptos += req.Cantidad;
                wallet.Balance += req.Monto;
                _context.Billeteras.Update(wallet);
            }

            // 3) Registrar Transaccion
            var tx = new Transaccion
            {
                idUsuario = req.idUsuario,
                idCripto = req.idCripto,
                Cantidad = (int)req.Cantidad,
                Monto = (int)req.Monto,
                Accion = "compra",
                FechaTransaccion = DateTime.UtcNow
            };
            _context.Transacciones.Add(tx);

            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Compra realizada con éxito", transaccion = tx, billetera = wallet });
        }

        // POST: api/transacciones/venta
        [HttpPost("venta")]
        public async Task<IActionResult> Vender([FromBody] TransaccionRequest req)
        {
            if (req.Cantidad <= 0 || req.Monto <= 0)
                return BadRequest(new { mensaje = "Cantidad y monto deben ser mayores que cero." });

            // 1) Buscar Billetera existente
            var wallet = await _context.Billeteras
                .SingleOrDefaultAsync(b =>
                    b.idUsuario == req.idUsuario &&
                    b.idCripto == req.idCripto);

            if (wallet == null || wallet.CantCriptos < req.Cantidad)
                return BadRequest(new { mensaje = "No tenés suficientes criptos para vender." });

            // 2) Actualizar Billetera
            wallet.CantCriptos -= req.Cantidad;
            wallet.Balance -= req.Monto;
            _context.Billeteras.Update(wallet);

            // 3) Registrar Transaccion
            var tx = new Transaccion
            {
                idUsuario = req.idUsuario,
                idCripto = req.idCripto,
                Cantidad = (int)req.Cantidad,
                Monto = (int)req.Monto,
                Accion = "venta",
                FechaTransaccion = DateTime.UtcNow
            };
            _context.Transacciones.Add(tx);

            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Venta realizada con éxito", transaccion = tx, billetera = wallet });
        }
        public class TransaccionDto
        {
            public DateTime FechaTransaccion { get; set; }
            public string Accion { get; set; }
            public int Cantidad { get; set; }
            public decimal Monto { get; set; }
            public string NombreCripto { get; set; }
            public string SymbolCripto { get; set; }
        }

        [HttpGet("obtener")]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.Transacciones
                .Include(t => t.Cripto)
                .OrderByDescending(t => t.FechaTransaccion)
                .Select(t => new TransaccionDto
                {
                    FechaTransaccion = t.FechaTransaccion,
                    Accion = t.Accion,
                    Cantidad = t.Cantidad,
                    Monto = t.Monto,
                    NombreCripto = t.Cripto.Criptomoneda,
                    SymbolCripto = t.Cripto.Simbolo
                })
                .ToListAsync();

            return Ok(list);
        }


        // GET: api/transacciones/usuario/5
        [HttpGet("usuario/{usuarioId}")]
        public async Task<IActionResult> GetByUsuario(int usuarioId)
        {
            var list = await _context.Transacciones
                .Include(t => t.Cripto)
                .Where(t => t.idUsuario == usuarioId)
                .OrderByDescending(t => t.FechaTransaccion)
                .ToListAsync();
            return Ok(list);
        }
    }
}
