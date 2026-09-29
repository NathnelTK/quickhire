using QuickHire.Domain.Enums;

namespace QuickHire.Domain.Entities;

public class Applicant
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public required string FirstName { get; set; }

    public required string LastName { get; set; }

    public required string Email { get; set; }

    public DateTimeOffset AppliedAt { get; set; } = DateTimeOffset.UtcNow;

    public ApplicantStatus Status { get; set; } = ApplicantStatus.Received;

    public Guid JobPostingId { get; set; }

    public JobPosting JobPosting { get; set; } = null!;
}