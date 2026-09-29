using System.ComponentModel.DataAnnotations;

namespace QuickHire.Application.Employees.Dtos;

public sealed record UpdateEmployeeDto(
    [param: Required, StringLength(100)] string FirstName,
    [param: Required, StringLength(100)] string LastName,
    [param: Required, EmailAddress, StringLength(320)] string Email,
    DateOnly DateHired,
    Guid DepartmentId);