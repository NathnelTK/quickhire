using Microsoft.EntityFrameworkCore;
using QuickHire.Application.Departments;
using QuickHire.Domain.Entities;

namespace QuickHire.Infrastructure.Persistence.Repositories;

public sealed class DepartmentRepository(AppDbContext dbContext) : IDepartmentRepository
{
    public Task<Department?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        dbContext.Departments
            .Include(department => department.Employees)
            .SingleOrDefaultAsync(department => department.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Department>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await dbContext.Departments
            .Include(department => department.Employees)
            .OrderBy(department => department.Name)
            .ToListAsync(cancellationToken);

    public Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default) =>
        dbContext.Departments.AnyAsync(department => department.Id == id, cancellationToken);

    public Task<bool> NameExistsAsync(
        string name,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default) =>
        dbContext.Departments.AnyAsync(department =>
            department.Name.ToLower() == name.Trim().ToLower() &&
            (!excludeId.HasValue || department.Id != excludeId.Value), cancellationToken);

    public Task<bool> HasEmployeesAsync(Guid id, CancellationToken cancellationToken = default) =>
        dbContext.Employees.AnyAsync(employee => employee.DepartmentId == id, cancellationToken);

    public async Task AddAsync(Department department, CancellationToken cancellationToken = default)
    {
        await dbContext.Departments.AddAsync(department, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Department department, CancellationToken cancellationToken = default)
    {
        dbContext.Departments.Update(department);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Department department, CancellationToken cancellationToken = default)
    {
        dbContext.Departments.Remove(department);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}