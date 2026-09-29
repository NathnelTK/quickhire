using QuickHire.Domain.Entities;

namespace QuickHire.Application.Departments;

public interface IDepartmentRepository
{
    Task<Department?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Implementations must include Employees (or project a count) for EmployeeCount.</summary>
    Task<IReadOnlyList<Department>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Case-insensitive name check for uniqueness.</summary>
    Task<bool> NameExistsAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default);

    Task<bool> HasEmployeesAsync(Guid id, CancellationToken cancellationToken = default);

    Task AddAsync(Department department, CancellationToken cancellationToken = default);

    Task UpdateAsync(Department department, CancellationToken cancellationToken = default);

    Task DeleteAsync(Department department, CancellationToken cancellationToken = default);
}