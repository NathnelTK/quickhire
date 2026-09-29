using QuickHire.Domain.Enums;
namespace QuickHire.Application.DTOs;

// what the recruiter sees when viewing applicants

public record ApplicantDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    ApplicantStatus Status,
    DateTimeOffset AppliedAt
);

// what the applicant sends when applying

public record CreateApplicantDto(
    string FirstName,
    string LastName,
    string Email,
    Guid JobPostingId
);