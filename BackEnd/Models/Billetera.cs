using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VirtualCripto.Models
{
    public class Billetera
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        // FK a Usuario
        [Required]
        [ForeignKey(nameof(Usuario))]
        public int idUsuario { get; set; }
        public Usuario Usuario { get; set; }

        // FK a Criptos
        [Required]
        [ForeignKey(nameof(Cripto))]
        public int idCripto { get; set; }
        public Criptos Cripto { get; set; }

        // Cantidad de unidades de la cripto en la billetera
        [Required]
        [Column(TypeName = "decimal(18,8)")]
        public decimal CantCriptos { get; set; }

        // Balance actual en ARS o unidad que prefieras
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Balance { get; set; }
    }
}
