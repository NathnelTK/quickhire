using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickHire.Application.Departments;
using QuickHire.Application.Employees;
using QuickHire.Application.Employees.Dtos;
using QuickHire.Domain.Entities;

namespace QuickHire.Api.Controllers;

[ApiController]
[Authorize(Roles = "Administrator,Recruiter")]
[Route("api/[controller]")]
public sealed class EmployeesController(
    IEmployeeRepository employees,
    IDepartmentRepository departments) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EmployeeDto>>> GetAll(
        [FromQuery] Guid? departmentId,
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        var results = await employees.GetAllAsync(departmentId, search, cancellationToken);
        return Ok(results.Select(ToDto).ToArray());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EmployeeDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var employee = await employees.GetByIdAsync(id, cancellationToken);
        return employee is null ? NotFound() : Ok(ToDto(employee));
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> Create(
        CreateEmployeeDto request,
        CancellationToken cancellationToken)
    {
        if (request.DepartmentId == Guid.Empty || request.DateHired == default)
        {
            return BadRequest("A valid hire date and department are required.");
        }
        var department = await departments.GetByIdAsync(request.DepartmentId, cancellationToken);
        if (department is null)
        {
            return BadRequest("The selected department does not exist.");
        }
        if (await employees.EmailExistsAsync(request.Email, cancellationToken: cancellationToken))
        {
            return Conflict("An employee with this email already exists.");
        }

        var employee = new Employee
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = request.Email.Trim(),
            DateHired = request.DateHired,
            DepartmentId = request.DepartmentId,
            Department = department
        };
        await employees.AddAsync(employee, cancellationToken);
        var created = await employees.GetByIdAsync(employee.Id, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = employee.Id }, ToDto(created!));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<EmployeeDto>> Update(
        Guid id,
        UpdateEmployeeDto request,
        CancellationToken cancellationToken)
    {
        var employee = await employees.GetByIdAsync(id, cancellationToken);
        if (employee is null)
        {
            return NotFound();
        }
        if (request.DepartmentId == Guid.Empty || request.DateHired == default)
        {
            return BadRequest("A valid hire date and department are required.");
        }
        var department = await departments.GetByIdAsync(request.DepartmentId, cancellationToken);
        if (department is null)
        {
            return BadRequest("The selected department does not exist.");
        }
        if (await employees.EmailExistsAsync(request.Email, id, cancellationToken))
        {
            return Conflict("An employee with this email already exists.");
        }

        employee.FirstName = request.FirstName.Trim();
        employee.LastName = request.LastName.Trim();
        employee.Email = request.Email.Trim();
        employee.DateHired = request.DateHired;
        employee.DepartmentId = request.DepartmentId;
        employee.Department = department;
        await employees.UpdateAsync(employee, cancellationToken);
        var updated = await employees.GetByIdAsync(id, cancellationToken);
        return Ok(ToDto(updated!));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var employee = await employees.GetByIdAsync(id, cancellationToken);
        if (employee is null)
        {
            return NotFound();
        }

        await employees.DeleteAsync(employee, cancellationToken);
        return NoContent();
    }

    private static EmployeeDto ToDto(Employee employee) => new(
        employee.Id,
        employee.FirstName,
        employee.LastName,
        employee.Email,
        employee.DateHired,
        employee.DepartmentId,
        employee.Department.Name);
}