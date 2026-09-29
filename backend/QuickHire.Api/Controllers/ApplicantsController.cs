using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickHire.Application.DTOs;
using QuickHire.Application.Interfaces;
using QuickHire.Domain.Enums;

namespace QuickHire.Api.Controllers;

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
    [Authorize(Roles = "Recruiter,Admin")] // Only recruiters can see who applied
    public async Task<ActionResult<IEnumerable<ApplicantDto>>> GetApplicants(Guid jobId, CancellationToken ct)
    {
        var applicants = await _jobService.GetApplicantsForJobAsync(jobId, ct);
        return Ok(applicants);
    }

    [HttpPost]
    [Authorize(Roles = "Applicant")] // Only applicants can submit applications
    public async Task<IActionResult> Apply(Guid jobId, [FromBody] CreateApplicantDto dto, CancellationToken ct)
    {
        if (jobId != dto.JobPostingId)
        {
            return BadRequest("Job ID in URL does not match Job ID in payload.");
        }

        await _jobService.SubmitApplicationAsync(dto, ct);
        return Ok(new { message = "Application submitted successfully." });
    }

    [HttpPatch("{applicantId}/status")]
    [Authorize(Roles = "Recruiter,Admin")] // Only recruiters can accept/reject applicants
    public async Task<IActionResult> UpdateStatus(Guid applicantId, [FromBody] ApplicantStatus status, CancellationToken ct)
    {
        await _jobService.UpdateApplicantStatusAsync(applicantId, status, ct);
        return NoContent();
    }
}
