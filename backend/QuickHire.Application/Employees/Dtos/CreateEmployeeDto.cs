namespace QuickHire.Application.Employees.Dtos;

public sealed record CreateEmployeeDto(
    string FirstName,
    string LastName,
    string Email,
    DateOnly DateHired,
    Guid DepartmentId);