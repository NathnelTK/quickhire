using QuickHire.Domain.Enums;

namespace QuickHire.Domain.Entities;

public class JobPosting
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public required string Title { get; set; }

    public required string Description { get; set; }

    public JobStatus Status { get; set; } = JobStatus.Open;

    public DateTimeOffset PostedAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<Applicant> Applicants { get; set; } = new List<Applicant>();
}