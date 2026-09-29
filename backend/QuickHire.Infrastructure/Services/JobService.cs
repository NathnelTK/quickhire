using Microsoft.EntityFrameworkCore;
using QuickHire.Application.DTOs;
using QuickHire.Application.Interfaces;
using QuickHire.Domain.Entities;
using QuickHire.Domain.Enums;
using QuickHire.Infrastructure.Persistence; 

namespace QuickHire.Infrastructure.Services;

public class JobService : IJobService
{
    private readonly AppDbContext _context;

    public JobService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<JobPostingDto>> GetAllActiveJobsAsync(CancellationToken ct = default)
    {
        return await _context.JobPostings
            .Where(j => j.Status == JobStatus.Open)
            .Select(j => new JobPostingDto(j.Id, j.Title, j.Description, j.Status, j.PostedAt))
            .ToListAsync(ct);
    }

    public async Task<JobPostingDto> CreateJobAsync(CreateJobPostingDto dto, CancellationToken ct = default)
    {
        var job = new JobPosting
        {
            Title = dto.Title,
            Description = dto.Description,
            Status = JobStatus.Open,
            PostedAt = DateTimeOffset.UtcNow
        };

        _context.JobPostings.Add(job);
        await _context.SaveChangesAsync(ct);

        return new JobPostingDto(job.Id, job.Title, job.Description, job.Status, job.PostedAt);
    }

    public async Task UpdateJobStatusAsync(Guid jobId, JobStatus status, CancellationToken ct = default)
    {
        var job = await _context.JobPostings.FindAsync(new object[] { jobId }, ct);
        if (job == null) throw new Exception("Job not found");

        job.Status = status;
        await _context.SaveChangesAsync(ct);
    }

    public async Task SubmitApplicationAsync(CreateApplicantDto dto, CancellationToken ct = default)
    {
        var applicant = new Applicant
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            JobPostingId = dto.JobPostingId,
            Status = ApplicantStatus.Received,
            AppliedAt = DateTimeOffset.UtcNow
        };

        _context.Applicants.Add(applicant);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<IEnumerable<ApplicantDto>> GetApplicantsForJobAsync(Guid jobId, CancellationToken ct = default)
    {
        return await _context.Applicants
            .Where(a => a.JobPostingId == jobId)
            .Select(a => new ApplicantDto(a.Id, a.FirstName, a.LastName, a.Email, a.Status, a.AppliedAt))
            .ToListAsync(ct);
    }

    public async Task UpdateApplicantStatusAsync(Guid applicantId, ApplicantStatus status, CancellationToken ct = default)
    {
        var applicant = await _context.Applicants.FindAsync(new object[] { applicantId }, ct);
        if (applicant == null) throw new Exception("Applicant not found");

        applicant.Status = status;
        await _context.SaveChangesAsync(ct);
    }
}
