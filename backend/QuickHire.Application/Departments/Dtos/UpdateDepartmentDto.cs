using System.ComponentModel.DataAnnotations;

namespace QuickHire.Application.Departments.Dtos;

public sealed record UpdateDepartmentDto([param: Required, StringLength(100)] string Name);