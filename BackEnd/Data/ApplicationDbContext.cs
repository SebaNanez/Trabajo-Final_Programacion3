using Microsoft.EntityFrameworkCore;
using VirtualCripto.Models;

namespace VirtualCripto.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Criptos> Criptos { get; set; }
        public DbSet<Transaccion> Transacciones { get; set; }
        public DbSet<Billetera> Billeteras { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Tablas
            modelBuilder.Entity<Usuario>().ToTable("Usuarios");
            modelBuilder.Entity<Criptos>().ToTable("Criptos");
            modelBuilder.Entity<Transaccion>().ToTable("Transacciones");

            // Usuario 1–* Transacciones
            modelBuilder.Entity<Transaccion>()
                .HasOne(t => t.Usuario)
                .WithMany(u => u.Transacciones)
                .HasForeignKey(t => t.idUsuario)
                .OnDelete(DeleteBehavior.Cascade);

            // Criptos 1–* Transacciones
            modelBuilder.Entity<Transaccion>()
                .HasOne(t => t.Cripto)
                .WithMany(c => c.Transacciones)
                .HasForeignKey(t => t.idCripto)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
