using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VirtualCripto.Models
{
    public class Transaccion
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        // FK a Usuario
        [Required]
        [ForeignKey(nameof(Usuario))]
        public int idUsuario { get; set; }

        // Propiedad de navegación a Usuario
        public Usuario Usuario { get; set; }

        // FK a Criptos
        [Required]
        [ForeignKey(nameof(Cripto))]
        public int idCripto { get; set; }

        // Propiedad de navegación a Criptos
        public Criptos Cripto { get; set; }

        [Required]
        public int Cantidad { get; set; }

        [Required]
        public int Monto { get; set; }

        [Required]
        public string Accion { get; set; }

        public DateTime FechaTransaccion { get; set; } = DateTime.UtcNow;
    }
}
