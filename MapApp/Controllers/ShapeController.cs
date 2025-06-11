using MapApp.Data;
using MapApp.Models;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ShapeController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ShapeController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> PostShape([FromBody] Shape shape)
    {
        Console.WriteLine("API'ye veri geldi");
        _context.Shapes.Add(shape);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Kayıt başarılı", shapeId = shape.Id });
    }

    [HttpGet]
    public IActionResult GetShapes()
    {
        var shapes = _context.Shapes.ToList();
        return Ok(shapes);
    }
}
