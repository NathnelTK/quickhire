using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuickHire.Domain.Entities;

namespace QuickHire.Infrastructure.Persistence.Configurations;

public sealed class JobPostingConfiguration : IEntityTypeConfiguration<JobPosting>
{
    public void Configure(EntityTypeBuilder<JobPosting> builder)
    {
        builder.ToTable("job_postings");
        builder.HasKey(jobPosting => jobPosting.Id);
        builder.Property(jobPosting => jobPosting.Id).HasColumnName("id");
        builder.Property(jobPosting => jobPosting.Title)
            .HasColumnName("title")
            .HasMaxLength(200)
            .IsRequired();
        builder.Property(jobPosting => jobPosting.Description)
            .HasColumnName("description")
            .HasColumnType("text")
            .IsRequired();
        builder.Property(jobPosting => jobPosting.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(32)
            .IsRequired();
        builder.Property(jobPosting => jobPosting.PostedAt)
            .HasColumnName("posted_at")
            .IsRequired();
        builder.HasIndex(jobPosting => jobPosting.Status);

        builder.HasMany(jobPosting => jobPosting.Applicants)
            .WithOne(applicant => applicant.JobPosting)
            .HasForeignKey(applicant => applicant.JobPostingId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}