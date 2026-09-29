namespace QuickHire.Application.Employees.Dtos;

public sealed record EmployeeDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    DateOnly DateHired,
    Guid DepartmentId,
    string DepartmentName);