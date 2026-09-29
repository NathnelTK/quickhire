namespace QuickHire.Domain.Entities;

public class Department
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public required string Name { get; set; }

    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
}