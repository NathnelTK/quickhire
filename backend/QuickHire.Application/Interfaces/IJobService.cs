using QuickHire.Application.DTOs;
using QuickHire.Domain.Enums;

namespace QuickHire.Application.Interfaces;

public interface IJobService
{
    // Job Methods
    Task<IEnumerable<JobPostingDto>> GetAllActiveJobsAsync(CancellationToken ct = default);
    Task<IEnumerable<JobPostingDto>> GetAllJobsAsync(CancellationToken ct = default);
    Task<JobPostingDto> CreateJobAsync(CreateJobPostingDto dto, CancellationToken ct = default);
    Task UpdateJobStatusAsync(Guid jobId, JobStatus status, CancellationToken ct = default);

    // Applicant Methods
    Task<ApplicantDto> SubmitApplicationAsync(CreateApplicantDto dto, Guid userId, CancellationToken ct = default);
    Task<IEnumerable<ApplicantDto>> GetApplicantsForJobAsync(Guid jobId, CancellationToken ct = default);
    Task UpdateApplicantStatusAsync(Guid jobId, Guid applicantId, ApplicantStatus status, CancellationToken ct = default);
    Task<IEnumerable<ApplicantDto>> GetMyApplicationsAsync(Guid userId, CancellationToken ct = default);
}
