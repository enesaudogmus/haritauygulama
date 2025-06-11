using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.EntityFrameworkCore;
using MapApp.Data;

var builder = WebApplication.CreateBuilder(args);

// PostgreSQL ba�lant�s�
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS ayarlar�
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins, policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();

// Angular static dosyalar�n� yay�nla
builder.Services.AddSpaStaticFiles(configuration =>
{
    configuration.RootPath = "haritauygulama/dist/haritauygulama";

});

var app = builder.Build();

// Hata loglama middleware (ge�ici debug i�in)
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        Console.WriteLine("? HATA: " + ex.Message);
        Console.WriteLine("?? StackTrace: " + ex.StackTrace);
        throw;
    }
});

// Hata ve g�venlik ayarlar�
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

if (!app.Environment.IsDevelopment())
{
    app.UseSpaStaticFiles();
}

app.UseRouting();
app.UseCors(MyAllowSpecificOrigins);
app.UseAuthorization();

app.MapControllers();

// Angular development server ile proxy ba�lant�s�
app.UseSpa(spa =>
{
    spa.Options.SourcePath = "haritauygulama";

    if (app.Environment.IsDevelopment())
    {
           spa.UseProxyToSpaDevelopmentServer("http://localhost:4200");
    }
});

app.Run();
