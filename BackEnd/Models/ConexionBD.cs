using System.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace VirtualCripto.Models
{
    public class ConexionBD
    {
        private readonly IConfiguration _configuration;
        private SqlConnection? _conexion;

        public ConexionBD(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public SqlConnection ObtenerConexion()
        {
            if (_conexion == null)
            {
                string connectionString = _configuration.GetConnectionString("VirtualCriptoConnection") ??
                    throw new InvalidOperationException("Connection string 'VirtualCriptoConnection' not found.");
                _conexion = new SqlConnection(connectionString);
            }

            return _conexion;
        }

        public async Task AbrirConexionAsync()
        {
            if (_conexion != null && _conexion.State == System.Data.ConnectionState.Closed)
            {
                await _conexion.OpenAsync();
            }
        }

        public async Task CerrarConexionAsync()
        {
            if (_conexion != null && _conexion.State == System.Data.ConnectionState.Open)
            {
                await _conexion.CloseAsync();
            }
        }

        // Método para liberar recursos (opcional pero recomendado)
        public async ValueTask DisposeAsync()
        {
            if (_conexion != null)
            {
                await _conexion.DisposeAsync();
                _conexion = null;
            }
        }
    }
}