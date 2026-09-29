using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using QuickHire.Application.DTOs;
using QuickHire.Application.Interfaces;
using QuickHire.Domain.Enums;

namespace QuickHire.Api.Controllers;

public sealed record UpdateJobStatusRequest(JobStatus Status);

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
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<JobPostingDto>>> GetActiveJobs(CancellationToken ct)
    {
        var jobs = await _jobService.GetAllActiveJobsAsync(ct);
        return Ok(jobs);
    }

    [HttpGet("manage")]
    [Authorize(Roles = "Administrator,Recruiter")]
    public async Task<ActionResult<IEnumerable<JobPostingDto>>> GetAllJobs(CancellationToken ct)
    {
        var jobs = await _jobService.GetAllJobsAsync(ct);
        return Ok(jobs);
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,Recruiter")]
    public async Task<ActionResult<JobPostingDto>> CreateJob([FromBody] CreateJobPostingDto dto, CancellationToken ct)
    {
        var createdJob = await _jobService.CreateJobAsync(dto, ct);
        return StatusCode(StatusCodes.Status201Created, createdJob);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Administrator,Recruiter")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateJobStatusRequest request, CancellationToken ct)
    {
        try
        {
            await _jobService.UpdateJobStatusAsync(id, request.Status, ct);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (ArgumentOutOfRangeException)
        {
            return BadRequest("Unknown job status.");
        }
        return NoContent();
    }
}
