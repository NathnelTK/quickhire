using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickHire.Application.DTOs;
using QuickHire.Application.Interfaces;
using QuickHire.Domain.Enums;

namespace QuickHire.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    private readonly IJobService _jobService;

    public JobsController(IJobService jobService)
    {
        _jobService = jobService;
    }

    [HttpGet]
    [AllowAnonymous] // Anyone can view open jobs
    public async Task<ActionResult<IEnumerable<JobPostingDto>>> GetActiveJobs(CancellationToken ct)
    {
        var jobs = await _jobService.GetAllActiveJobsAsync(ct);
        return Ok(jobs);
    }

    [HttpPost]
    [Authorize(Roles = "Recruiter,Admin")] // Only recruiters can post jobs
    public async Task<ActionResult<JobPostingDto>> CreateJob([FromBody] CreateJobPostingDto dto, CancellationToken ct)
    {
        var createdJob = await _jobService.CreateJobAsync(dto, ct);
        return CreatedAtAction(nameof(GetActiveJobs), new { id = createdJob.Id }, createdJob);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Recruiter,Admin")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] JobStatus status, CancellationToken ct)
    {
        await _jobService.UpdateJobStatusAsync(id, status, ct);
        return NoContent();
    }
}
