using System.ComponentModel.DataAnnotations;
using QuickHire.Domain.Enums;
namespace QuickHire.Application.DTOs;

// what the recruiter sees when viewing applicants

public record ApplicantDto(
    Guid Id,
    Guid JobPostingId,
    string FirstName,
    string LastName,
    string Email,
    ApplicantStatus Status,
    DateTimeOffset AppliedAt
);

// what the applicant sends when applying

public record CreateApplicantDto(
    [param: Required, StringLength(100)] string FirstName,
    [param: Required, StringLength(100)] string LastName,
    [param: Required, EmailAddress, StringLength(320)] string Email,
    Guid JobPostingId
);