namespace QuickHire.Application.Employees.Dtos;

public sealed record UpdateEmployeeDto(
    string FirstName,
    string LastName,
    string Email,
    DateOnly DateHired,
    Guid DepartmentId);