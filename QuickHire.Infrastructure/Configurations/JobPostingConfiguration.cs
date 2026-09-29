namespace QuickHire.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuickHire.Domain.Entities;

public class JobPostingConfiguration : IEntityTypeConfiguration<JobPosting>
{
    public void Configure(EntityTypeBuilder<JobPosting> builder)
    {
        builder.HasKey(j => j.Id);

        builder.Property(j => j.Title).IsRequired().HasMaxLength(150);
        builder.Property(j => j.Location).IsRequired().HasMaxLength(100);
        
        builder.Property(j => j.MinimumSalary).HasPrecision(18, 2);
        builder.Property(j => j.MaximumSalary).HasPrecision(18, 2);

        builder.Property(j => j.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.HasIndex(j => j.Status);
        builder.HasIndex(j => j.DepartmentId);

        builder.HasOne(j => j.Department)
            .WithMany()
            .HasForeignKey(j => j.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(j => !j.IsDeleted);
    }
}