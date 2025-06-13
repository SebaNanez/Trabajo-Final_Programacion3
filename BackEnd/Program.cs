using Microsoft.EntityFrameworkCore;
using VirtualCripto.Data;
using VirtualCripto.Models;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://localhost:5000");
// Add services to the container.
builder.Services.AddControllers();

// Configuración del DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("VirtualCriptoConnection"),
        b => b.MigrationsAssembly("BackEnd - Trabajo Final - Programacion 3")
    )
);

// Configuración de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});


// Registro de servicios adicionales
builder.Services.AddScoped<ConexionBD>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// IMPORTANTE: CORS debe estar después de UseRouting y antes de UseAuthorization
app.UseCors("AllowAll");

app.UseAuthorization();

// Mapeo de controladores
app.MapControllers(); // Esto es necesario para tus APIs

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapGet("/", () => "API VirtualCripto está funcionando. Use /api/usuarios");
app.Run();