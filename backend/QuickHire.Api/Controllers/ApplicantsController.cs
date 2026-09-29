using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using QuickHire.Application.DTOs;
using QuickHire.Application.Interfaces;
using QuickHire.Domain.Enums;

namespace QuickHire.Api.Controllers;

public sealed record UpdateApplicantStatusRequest(ApplicantStatus Status);

[ApiController]
[Route("api/jobs/{jobId}/[controller]")] // Nested route: /api/jobs/{jobId}/applicants
public class ApplicantsController : ControllerBase
{
    private readonly IJobService _jobService;

    public ApplicantsController(IJobService jobService)
    {
        _jobService = jobService;
    }

    [HttpGet]
    [Authorize(Roles = "Administrator,Recruiter")]
    public async Task<ActionResult<IEnumerable<ApplicantDto>>> GetApplicants(Guid jobId, CancellationToken ct)
    {
        var applicants = await _jobService.GetApplicantsForJobAsync(jobId, ct);
        return Ok(applicants);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Apply(Guid jobId, [FromBody] CreateApplicantDto dto, CancellationToken ct)
    {
        if (jobId != dto.JobPostingId)
        {
            return BadRequest("Job ID in URL does not match Job ID in payload.");
        }

        try
        {
            var applicant = await _jobService.SubmitApplicationAsync(dto, ct);
            return Created($"/api/jobs/{jobId}/applicants", applicant);
        }
        catch (KeyNotFoundException)
        {
            return NotFound("Job not found.");
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(exception.Message);
        }
    }

    [HttpPatch("{applicantId}/status")]
    [Authorize(Roles = "Administrator,Recruiter")]
    public async Task<IActionResult> UpdateStatus(
        Guid jobId,
        Guid applicantId,
        [FromBody] UpdateApplicantStatusRequest request,
        CancellationToken ct)
    {
        try
        {
            await _jobService.UpdateApplicantStatusAsync(jobId, applicantId, request.Status, ct);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (ArgumentOutOfRangeException)
        {
            return BadRequest("Unknown applicant status.");
        }
        return NoContent();
    }
}
