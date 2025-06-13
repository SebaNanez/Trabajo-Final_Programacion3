using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEnd___Trabajo_Final___Programacion_3.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class Billeteraa : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Billeteras",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    idUsuario = table.Column<int>(type: "int", nullable: false),
                    idCripto = table.Column<int>(type: "int", nullable: false),
                    CantCriptos = table.Column<decimal>(type: "decimal(18,8)", nullable: false),
                    Balance = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Billeteras", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Billeteras_Criptos_idCripto",
                        column: x => x.idCripto,
                        principalTable: "Criptos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Billeteras_Usuarios_idUsuario",
                        column: x => x.idUsuario,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Billeteras_idCripto",
                table: "Billeteras",
                column: "idCripto");

            migrationBuilder.CreateIndex(
                name: "IX_Billeteras_idUsuario",
                table: "Billeteras",
                column: "idUsuario");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Billeteras");
        }
    }
}
