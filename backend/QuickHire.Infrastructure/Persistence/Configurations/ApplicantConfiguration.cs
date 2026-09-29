using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuickHire.Domain.Entities;

namespace QuickHire.Infrastructure.Persistence.Configurations;

public sealed class ApplicantConfiguration : IEntityTypeConfiguration<Applicant>
{
    public void Configure(EntityTypeBuilder<Applicant> builder)
    {
        builder.ToTable("applicants");
        builder.HasKey(applicant => applicant.Id);
        builder.Property(applicant => applicant.Id).HasColumnName("id");
        builder.Property(applicant => applicant.FirstName)
            .HasColumnName("first_name")
            .HasMaxLength(100)
            .IsRequired();
        builder.Property(applicant => applicant.LastName)
            .HasColumnName("last_name")
            .HasMaxLength(100)
            .IsRequired();
        builder.Property(applicant => applicant.Email)
            .HasColumnName("email")
            .HasMaxLength(320)
            .IsRequired();
        builder.Property(applicant => applicant.AppliedAt)
            .HasColumnName("applied_at")
            .IsRequired();
        builder.Property(applicant => applicant.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(32)
            .IsRequired();
        builder.Property(applicant => applicant.JobPostingId).HasColumnName("job_posting_id");
        builder.HasIndex(applicant => new { applicant.JobPostingId, applicant.Email }).IsUnique();
        builder.HasIndex(applicant => applicant.Status);
    }
}