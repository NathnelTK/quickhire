using Microsoft.EntityFrameworkCore;
using QuickHire.Application.Employees;
using QuickHire.Domain.Entities;

namespace QuickHire.Infrastructure.Persistence.Repositories;

public sealed class EmployeeRepository(AppDbContext dbContext) : IEmployeeRepository
{
    public Task<Employee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        dbContext.Employees
            .Include(employee => employee.Department)
            .SingleOrDefaultAsync(employee => employee.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Employee>> GetAllAsync(
        Guid? departmentId = null,
        string? search = null,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Employees.Include(employee => employee.Department).AsQueryable();
        if (departmentId.HasValue)
        {
            query = query.Where(employee => employee.DepartmentId == departmentId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%";
            query = query.Where(employee =>
                EF.Functions.ILike(employee.FirstName, pattern) ||
                EF.Functions.ILike(employee.LastName, pattern) ||
                EF.Functions.ILike(employee.Email, pattern));
        }

        return await query.OrderBy(employee => employee.LastName)
            .ThenBy(employee => employee.FirstName)
            .ToListAsync(cancellationToken);
    }

    public Task<bool> EmailExistsAsync(
        string email,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default) =>
        dbContext.Employees.AnyAsync(employee =>
            employee.Email.ToLower() == email.Trim().ToLower() &&
            (!excludeId.HasValue || employee.Id != excludeId.Value), cancellationToken);

    public async Task AddAsync(Employee employee, CancellationToken cancellationToken = default)
    {
        await dbContext.Employees.AddAsync(employee, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Employee employee, CancellationToken cancellationToken = default)
    {
        dbContext.Employees.Update(employee);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Employee employee, CancellationToken cancellationToken = default)
    {
        dbContext.Employees.Remove(employee);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}