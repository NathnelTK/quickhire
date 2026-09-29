using QuickHire.Application.DTOs;
using QuickHire.Domain.Enums;

namespace QuickHire.Application.Interfaces;

public interface IJobService
{
    // Job Methods
    Task<IEnumerable<JobPostingDto>> GetAllActiveJobsAsync(CancellationToken ct = default);
    Task<JobPostingDto> CreateJobAsync(CreateJobPostingDto dto, CancellationToken ct = default);
    Task UpdateJobStatusAsync(Guid jobId, JobStatus status, CancellationToken ct = default);

    // Applicant Methods
    Task SubmitApplicationAsync(CreateApplicantDto dto, CancellationToken ct = default);
    Task<IEnumerable<ApplicantDto>> GetApplicantsForJobAsync(Guid jobId, CancellationToken ct = default);
    Task UpdateApplicantStatusAsync(Guid applicantId, ApplicantStatus status, CancellationToken ct = default);
}
