namespace QuickHire.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuickHire.Domain.Entities;

public class ApplicantConfiguration : IEntityTypeConfiguration<Applicant>
{
    public void Configure(EntityTypeBuilder<Applicant> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.FirstName).IsRequired().HasMaxLength(50);
        builder.Property(a => a.LastName).IsRequired().HasMaxLength(50);
        builder.Property(a => a.Email).IsRequired().HasMaxLength(100);
        builder.Property(a => a.Phone).HasMaxLength(20);
        builder.Property(a => a.ResumeUrl).IsRequired().HasMaxLength(500);

        builder.Property(a => a.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.HasIndex(a => a.JobPostingId);
        builder.HasIndex(a => a.Status);

        builder.HasOne(a => a.JobPosting)
            .WithMany(j => j.Applicants)
            .HasForeignKey(a => a.JobPostingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(a => !a.IsDeleted);
    }
}