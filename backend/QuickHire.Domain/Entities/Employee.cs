namespace QuickHire.Domain.Entities;

public class Employee
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public required string FirstName { get; set; }

    public required string LastName { get; set; }

    public required string Email { get; set; }

    public DateOnly DateHired { get; set; }

    public Guid DepartmentId { get; set; }

    public Department Department { get; set; } = null!;
}