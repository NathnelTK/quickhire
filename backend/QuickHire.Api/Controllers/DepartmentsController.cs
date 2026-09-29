using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickHire.Application.Departments;
using QuickHire.Application.Departments.Dtos;
using QuickHire.Domain.Entities;

namespace QuickHire.Api.Controllers;

[ApiController]
[Authorize(Roles = "Administrator,Recruiter")]
[Route("api/[controller]")]
public sealed class DepartmentsController(IDepartmentRepository departments) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DepartmentDto>>> GetAll(CancellationToken cancellationToken)
    {
        var results = await departments.GetAllAsync(cancellationToken);
        return Ok(results.Select(ToDto).ToArray());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DepartmentDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var department = await departments.GetByIdAsync(id, cancellationToken);
        return department is null ? NotFound() : Ok(ToDto(department));
    }

    [HttpPost]
    public async Task<ActionResult<DepartmentDto>> Create(
        CreateDepartmentDto request,
        CancellationToken cancellationToken)
    {
        if (await departments.NameExistsAsync(request.Name, cancellationToken: cancellationToken))
        {
            return Conflict("A department with this name already exists.");
        }

        var department = new Department { Name = request.Name.Trim() };
        await departments.AddAsync(department, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = department.Id }, ToDto(department));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<DepartmentDto>> Update(
        Guid id,
        UpdateDepartmentDto request,
        CancellationToken cancellationToken)
    {
        var department = await departments.GetByIdAsync(id, cancellationToken);
        if (department is null)
        {
            return NotFound();
        }
        if (await departments.NameExistsAsync(request.Name, id, cancellationToken))
        {
            return Conflict("A department with this name already exists.");
        }

        department.Name = request.Name.Trim();
        await departments.UpdateAsync(department, cancellationToken);
        return Ok(ToDto(department));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var department = await departments.GetByIdAsync(id, cancellationToken);
        if (department is null)
        {
            return NotFound();
        }
        if (await departments.HasEmployeesAsync(id, cancellationToken))
        {
            return Conflict("Departments with employees cannot be deleted.");
        }

        await departments.DeleteAsync(department, cancellationToken);
        return NoContent();
    }

    private static DepartmentDto ToDto(Department department) =>
        new(department.Id, department.Name, department.Employees.Count);
}