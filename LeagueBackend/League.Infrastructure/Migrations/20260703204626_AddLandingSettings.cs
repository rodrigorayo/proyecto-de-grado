using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace League.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLandingSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LandingSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HeroTitle = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HeroSubtitle = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HeroDescription = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PopUpEnabled = table.Column<bool>(type: "bit", nullable: false),
                    PopUpTitle = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PopUpContent = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PopUpImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PopUpLinkUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AboutMission = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AboutVision = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LandingSettings", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "LandingSettings",
                columns: new[] { "Id", "AboutMission", "AboutVision", "CreatedAt", "HeroDescription", "HeroSubtitle", "HeroTitle", "PopUpContent", "PopUpEnabled", "PopUpImageUrl", "PopUpLinkUrl", "PopUpTitle", "UpdatedAt" },
                values: new object[] { new Guid("44444444-4444-4444-4444-444444444444"), "Organizar campeonatos de fútbol de alto nivel competitivo para los distintos gremios laborales, promoviendo el juego limpio (Fair Play), el bienestar físico de los trabajadores y el compañerismo entre los distintos sectores productivos de nuestra ciudad.", "Ser reconocidos como la liga deportiva amateur más organizada y tecnológica de la región, destacando por nuestra transparencia, innovación (como la integración de Inteligencia Artificial) y nuestro fuerte impacto positivo en la vida laboral y social de nuestros afiliados.", new DateTime(2026, 7, 3, 20, 46, 24, 199, DateTimeKind.Utc).AddTicks(2458), "Resultados en vivo, estadísticas detalladas y crónicas impulsadas por inteligencia artificial.", "Temporada 2025", "EL CORAZÓN DEL FÚTBOL GREMIAL", "", false, "", "", "", null });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 3, 20, 46, 24, 199, DateTimeKind.Utc).AddTicks(1697));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 3, 20, 46, 24, 199, DateTimeKind.Utc).AddTicks(1829));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 3, 20, 46, 24, 199, DateTimeKind.Utc).AddTicks(1840));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LandingSettings");

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 3, 18, 24, 35, 901, DateTimeKind.Utc).AddTicks(7582));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 3, 18, 24, 35, 901, DateTimeKind.Utc).AddTicks(7604));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 3, 18, 24, 35, 901, DateTimeKind.Utc).AddTicks(7608));
        }
    }
}
