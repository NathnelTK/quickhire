namespace QuickHire.Application.Departments.Dtos;

public sealed record DepartmentDto(
    Guid Id,
    string Name,
     int EmployeeCount
     );