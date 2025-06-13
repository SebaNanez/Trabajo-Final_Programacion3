using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VirtualCripto.Data;
using VirtualCripto.Models;

namespace VirtualCripto.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BilleteraController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BilleteraController(ApplicationDbContext context)
        {
            _context = context;
        }
        public class BilleteraRequest
        {
            public int idUsuario { get; set; }
            public int idCripto { get; set; }
            public decimal CantCriptos { get; set; }
            public decimal Balance { get; set; }
        }

        // GET: api/billetera/usuario/5
        [HttpGet("usuario/{usuarioId}")]
        public async Task<ActionResult<IEnumerable<Billetera>>> GetByUsuario(int usuarioId)
        {
            var lista = await _context.Billeteras
                .Include(b => b.Cripto)
                .Where(b => b.idUsuario == usuarioId)
                .ToListAsync();

            return Ok(lista);
        }

        // POST: api/billetera
        [HttpPost]
        public async Task<IActionResult> PostBilletera([FromBody] BilleteraRequest req)
        {
            // Validaciones básicas
            if (req.idUsuario <= 0 || req.idCripto <= 0)
                return BadRequest(new { mensaje = "idUsuario y idCripto son obligatorios" });

            var nueva = new Billetera
            {
                idUsuario = req.idUsuario,
                idCripto = req.idCripto,
                CantCriptos = req.CantCriptos,
                Balance = req.Balance
            };

            _context.Billeteras.Add(nueva);
            await _context.SaveChangesAsync();

            // Devolvemos Created con la ruta GET para ese usuario
            return CreatedAtAction(
                nameof(GetByUsuario),
                new { usuarioId = req.idUsuario },
                nueva
            );
        }
    }
}
