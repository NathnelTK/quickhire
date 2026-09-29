using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuickHire.Domain.Entities;

namespace QuickHire.Infrastructure.Persistence.Configurations;

public sealed class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.ToTable("employees");
        builder.HasKey(employee => employee.Id);
        builder.Property(employee => employee.Id).HasColumnName("id");
        builder.Property(employee => employee.FirstName)
            .HasColumnName("first_name")
            .HasMaxLength(100)
            .IsRequired();
        builder.Property(employee => employee.LastName)
            .HasColumnName("last_name")
            .HasMaxLength(100)
            .IsRequired();
        builder.Property(employee => employee.Email)
            .HasColumnName("email")
            .HasMaxLength(320)
            .IsRequired();
        builder.HasIndex(employee => employee.Email).IsUnique();
        builder.Property(employee => employee.DateHired).HasColumnName("date_hired");
        builder.Property(employee => employee.DepartmentId).HasColumnName("department_id");
    }
}