using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VirtualCripto.Models
{
    public class Criptos
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required, StringLength(100)]
        public string Criptomoneda { get; set; }

        [Required]
        public string Simbolo { get; set; }


        public ICollection<Transaccion> Transacciones { get; set; }
            = new List<Transaccion>();
    }
}
