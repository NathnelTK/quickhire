namespace QuickHire.Domain.Entities;

using QuickHire.Domain.Enums;

public class JobPosting
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Requirements { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public decimal? MinimumSalary { get; set; }
    public decimal? MaximumSalary { get; set; }
    public JobStatus Status { get; set; } = JobStatus.Draft;
    public DateTime? PostedDate { get; set; }
    public DateTime? ClosingDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Foreign Keys & Navigation Properties
    public Guid DepartmentId { get; set; }
    public Department Department { get; set; } = null!;

    public ICollection<Applicant> Applicants { get; set; } = new List<Applicant>();
}