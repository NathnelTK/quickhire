using System.ComponentModel.DataAnnotations;
using QuickHire.Domain.Enums;

namespace QuickHire.Application.DTOs;


// what the frontend sees when they fetch jobs
public record JobPostingDto(
    Guid Id,
    string Title,
    string Description,
    JobStatus Status,
    DateTimeOffset PostedAt
);

// what the Recruiter sends to create a Job
public record CreateJobPostingDto(
    [param: Required, StringLength(200)] string Title,
    [param: Required, StringLength(10000)] string Description
);