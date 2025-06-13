using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VirtualCripto.Data;
using VirtualCripto.Models;

namespace VirtualCripto.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CriptosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CriptosController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/criptos
        // Devuelve [{ criptomoneda, simbolo }, ...]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var lista = await _context.Criptos
                .Select(c => new
                {
                    Id = c.Id,              // <— lo agregamos
                    Nombre = c.Criptomoneda,
                    Simbolo = c.Simbolo
                })
                .ToListAsync();

            return Ok(lista);
        }
    }
}
