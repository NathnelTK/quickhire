using QuickHire.Domain.Entities;

namespace QuickHire.Application.Employees;

public interface IEmployeeRepository
{
    Task<Employee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Implementations must include Department so DepartmentName can be mapped.</summary>
    Task<IReadOnlyList<Employee>> GetAllAsync(
        Guid? departmentId = null,
        string? search = null,
        CancellationToken cancellationToken = default);

    /// <summary>Case-insensitive. Pass excludeId when updating so an employee doesn't conflict with themselves.</summary>
    Task<bool> EmailExistsAsync(string email, Guid? excludeId = null, CancellationToken cancellationToken = default);

    Task AddAsync(Employee employee, CancellationToken cancellationToken = default);

    Task UpdateAsync(Employee employee, CancellationToken cancellationToken = default);

    Task DeleteAsync(Employee employee, CancellationToken cancellationToken = default);
}