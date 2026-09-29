namespace QuickHire.Domain.Entities;

using QuickHire.Domain.Enums;

public class Applicant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string ResumeUrl { get; set; } = string.Empty;
    public string? CoverLetter { get; set; }
    public ApplicantStatus Status { get; set; } = ApplicantStatus.Received;
    public DateTime AppliedDate { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Foreign Keys & Navigation Properties
    public Guid JobPostingId { get; set; }
    public JobPosting JobPosting { get; set; } = null!;
}