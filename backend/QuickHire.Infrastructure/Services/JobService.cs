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
            .OrderByDescending(j => j.PostedAt)
            .Select(j => new JobPostingDto(j.Id, j.Title, j.Description, j.Status, j.PostedAt))
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<JobPostingDto>> GetAllJobsAsync(CancellationToken ct = default)
    {
        return await _context.JobPostings
            .OrderByDescending(job => job.PostedAt)
            .Select(job => new JobPostingDto(job.Id, job.Title, job.Description, job.Status, job.PostedAt))
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
        if (job == null) throw new KeyNotFoundException("Job not found.");
        if (!Enum.IsDefined(status)) throw new ArgumentOutOfRangeException(nameof(status));

        job.Status = status;
        await _context.SaveChangesAsync(ct);
    }

    public async Task<ApplicantDto> SubmitApplicationAsync(CreateApplicantDto dto, CancellationToken ct = default)
    {
        var job = await _context.JobPostings.SingleOrDefaultAsync(j => j.Id == dto.JobPostingId, ct);
        if (job is null) throw new KeyNotFoundException("Job not found.");
        if (job.Status != JobStatus.Open) throw new InvalidOperationException("This job is not accepting applications.");
        if (await _context.Applicants.AnyAsync(a =>
                a.JobPostingId == dto.JobPostingId && a.Email.ToLower() == dto.Email.Trim().ToLower(), ct))
        {
            throw new InvalidOperationException("An application with this email already exists for this job.");
        }

        var applicant = new Applicant
        {
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Email = dto.Email.Trim(),
            JobPostingId = dto.JobPostingId,
            Status = ApplicantStatus.Received,
            AppliedAt = DateTimeOffset.UtcNow
        };

        _context.Applicants.Add(applicant);
        await _context.SaveChangesAsync(ct);
        return new ApplicantDto(
            applicant.Id,
            applicant.JobPostingId,
            applicant.FirstName,
            applicant.LastName,
            applicant.Email,
            applicant.Status,
            applicant.AppliedAt);
    }

    public async Task<IEnumerable<ApplicantDto>> GetApplicantsForJobAsync(Guid jobId, CancellationToken ct = default)
    {
        return await _context.Applicants
            .Where(a => a.JobPostingId == jobId)
            .Select(a => new ApplicantDto(a.Id, a.JobPostingId, a.FirstName, a.LastName, a.Email, a.Status, a.AppliedAt))
            .ToListAsync(ct);
    }

    public async Task UpdateApplicantStatusAsync(Guid jobId, Guid applicantId, ApplicantStatus status, CancellationToken ct = default)
    {
        var applicant = await _context.Applicants.SingleOrDefaultAsync(
            a => a.Id == applicantId && a.JobPostingId == jobId, ct);
        if (applicant == null) throw new KeyNotFoundException("Applicant not found.");
        if (!Enum.IsDefined(status)) throw new ArgumentOutOfRangeException(nameof(status));

        applicant.Status = status;
        await _context.SaveChangesAsync(ct);
    }
}
