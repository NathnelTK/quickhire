namespace QuickHire.Infrastructure.Persistence;

using System.Reflection;
using Microsoft.EntityFrameworkCore;
using QuickHire.Domain.Entities;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<JobPosting> JobPostings => Set<JobPosting>();
    public DbSet<Applicant> Applicants => Set<Applicant>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        // Automatically applies configurations from this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is { } entity)
            {
                var createdAtProp = entry.Entity.GetType().GetProperty("CreatedAt");
                var updatedAtProp = entry.Entity.GetType().GetProperty("UpdatedAt");

                if (entry.State == EntityState.Added && createdAtProp != null)
                {
                    createdAtProp.SetValue(entry.Entity, DateTime.UtcNow);
                }
                else if (entry.State == EntityState.Modified && updatedAtProp != null)
                {
                    updatedAtProp.SetValue(entry.Entity, DateTime.UtcNow);
                }
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}