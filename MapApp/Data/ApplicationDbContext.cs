using Microsoft.EntityFrameworkCore;
using MapApp.Models;

namespace MapApp.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<Shape> Shapes { get; set; }
    }
}
