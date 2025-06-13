using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VirtualCripto.Data;
using VirtualCripto.Models;

namespace VirtualCripto.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsuariosController(ApplicationDbContext context)
        {
            _context = context;
        }
            // GET: api/usuarios
            [HttpGet]
            public IActionResult GetAll()
            {
                return Ok(_context.Usuarios.ToList());
            }

            // POST: api/usuarios
            [HttpPost]
            public async Task<IActionResult> PostUsuario([FromBody] Usuario usuario)
            {
                _context.Usuarios.Add(usuario);
                await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUsuario), new { id = usuario.Id }, usuario);
            }
        [HttpGet("ping")]
        public IActionResult Ping()
        {
            return Ok("Pong");
        }

        // GET: api/Usuarios/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Usuario>> GetUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);

            if (usuario == null)
            {
                return NotFound();
            }

            return usuario;
        }

        // GET: api/usuarios/login?nombreUsuario=pepito&password=abc123
        [HttpGet("login")]
        public async Task<IActionResult> LoginGet(
            [FromQuery] string nombreUsuario,
            [FromQuery] string password)
        {
            if (string.IsNullOrWhiteSpace(nombreUsuario) || string.IsNullOrWhiteSpace(password))
                return BadRequest(new { mensaje = "Usuario y contraseña son obligatorios" });

            // En lugar de AnyAsync, traemos el usuario completo
            var usuario = await _context.Usuarios
                .SingleOrDefaultAsync(u =>
                    u.NombreUsuario == nombreUsuario &&
                    u.Password == password
                );

            if (usuario == null)
                return Unauthorized(new { mensaje = "Usuario o contraseña inválidos" });

            // Devolvemos también el Id
            return Ok(new
            {
                mensaje = "Login exitoso",
                id = usuario.Id,
                nombreUsuario = usuario.NombreUsuario
            });
        }



        [HttpGet("existe")]
        public async Task<ActionResult<bool>> ExisteUsuario([FromQuery] string nombreUsuario)
        {
            return await _context.Usuarios.AnyAsync(u => u.NombreUsuario == nombreUsuario);
        }
    }
}