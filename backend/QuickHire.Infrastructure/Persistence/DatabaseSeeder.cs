using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using QuickHire.Infrastructure.Identity;
using QuickHire.Domain.Entities;
using QuickHire.Domain.Enums;

namespace QuickHire.Infrastructure.Persistence;

public sealed class DatabaseSeeder(
    AppDbContext dbContext,
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole<Guid>> roleManager)
{
    public async Task InitializeAsync(string demoPassword, CancellationToken cancellationToken = default)
    {
        await dbContext.Database.MigrateAsync(cancellationToken);
        await EnsureRoleAsync("Administrator");
        await EnsureRoleAsync("Recruiter");
        await EnsureRoleAsync("Employee");
        await EnsureDemoUserAsync("admin@quickhire.local", "Avery", "Admin", "Administrator", demoPassword);
        await EnsureDemoUserAsync("recruiter@quickhire.local", "Riley", "Recruiter", "Recruiter", demoPassword);
        await EnsureDemoUserAsync("employee@quickhire.local", "Elliot", "Employee", "Employee", demoPassword);

        if (await dbContext.Departments.AnyAsync(cancellationToken))
        {
            return;
        }

        var engineering = new Department { Name = "Engineering" };
        var humanResources = new Department { Name = "Human Resources" };
        var finance = new Department { Name = "Finance" };
        var sales = new Department { Name = "Sales" };
        var marketing = new Department { Name = "Marketing" };
        dbContext.Departments.AddRange(engineering, humanResources, finance, sales, marketing);

        dbContext.Employees.AddRange(
            new Employee { FirstName = "Ava", LastName = "Morgan", Email = "ava.morgan@quickhire.local", DateHired = new DateOnly(2023, 2, 13), Department = engineering },
            new Employee { FirstName = "Noah", LastName = "Patel", Email = "noah.patel@quickhire.local", DateHired = new DateOnly(2022, 8, 1), Department = engineering },
            new Employee { FirstName = "Mia", LastName = "Chen", Email = "mia.chen@quickhire.local", DateHired = new DateOnly(2024, 1, 8), Department = humanResources },
            new Employee { FirstName = "Liam", LastName = "Garcia", Email = "liam.garcia@quickhire.local", DateHired = new DateOnly(2021, 5, 24), Department = humanResources },
            new Employee { FirstName = "Zoe", LastName = "Kim", Email = "zoe.kim@quickhire.local", DateHired = new DateOnly(2023, 11, 6), Department = finance },
            new Employee { FirstName = "Ethan", LastName = "Brown", Email = "ethan.brown@quickhire.local", DateHired = new DateOnly(2020, 3, 16), Department = finance },
            new Employee { FirstName = "Isla", LastName = "Wilson", Email = "isla.wilson@quickhire.local", DateHired = new DateOnly(2024, 4, 2), Department = sales },
            new Employee { FirstName = "Leo", LastName = "Martin", Email = "leo.martin@quickhire.local", DateHired = new DateOnly(2022, 10, 17), Department = sales },
            new Employee { FirstName = "Nora", LastName = "Davis", Email = "nora.davis@quickhire.local", DateHired = new DateOnly(2023, 7, 10), Department = marketing },
            new Employee { FirstName = "Jack", LastName = "Taylor", Email = "jack.taylor@quickhire.local", DateHired = new DateOnly(2021, 12, 5), Department = marketing });

        var softwareEngineer = new JobPosting
        {
            Title = "Software Engineer",
            Description = "Build and maintain services that support the QuickHire platform.",
            PostedAt = new DateTimeOffset(2025, 1, 15, 0, 0, 0, TimeSpan.Zero)
        };
        var recruiter = new JobPosting
        {
            Title = "Technical Recruiter",
            Description = "Help engineering teams find and hire excellent candidates.",
            PostedAt = new DateTimeOffset(2025, 2, 1, 0, 0, 0, TimeSpan.Zero)
        };
        var analyst = new JobPosting
        {
            Title = "Financial Analyst",
            Description = "Prepare forecasts and reporting for business stakeholders.",
            Status = JobStatus.Closed,
            PostedAt = new DateTimeOffset(2024, 12, 10, 0, 0, 0, TimeSpan.Zero)
        };
        dbContext.JobPostings.AddRange(softwareEngineer, recruiter, analyst);
        dbContext.Applicants.AddRange(
            new Applicant { FirstName = "Sam", LastName = "Rivera", Email = "sam.rivera@example.test", JobPosting = softwareEngineer },
            new Applicant { FirstName = "Jamie", LastName = "Brooks", Email = "jamie.brooks@example.test", JobPosting = softwareEngineer, Status = ApplicantStatus.Interviewing },
            new Applicant { FirstName = "Alex", LastName = "Reed", Email = "alex.reed@example.test", JobPosting = recruiter });

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureRoleAsync(string roleName)
    {
        if (await roleManager.RoleExistsAsync(roleName)) return;
        var result = await roleManager.CreateAsync(new IdentityRole<Guid>(roleName));
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(error => error.Description)));
        }
    }

    private async Task EnsureDemoUserAsync(
        string email,
        string firstName,
        string lastName,
        string roleName,
        string password)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                FirstName = firstName,
                LastName = lastName
            };
            var createResult = await userManager.CreateAsync(user, password);
            if (!createResult.Succeeded)
            {
                throw new InvalidOperationException(string.Join("; ", createResult.Errors.Select(error => error.Description)));
            }
        }

        if (!await userManager.IsInRoleAsync(user, roleName))
        {
            var roleResult = await userManager.AddToRoleAsync(user, roleName);
            if (!roleResult.Succeeded)
            {
                throw new InvalidOperationException(string.Join("; ", roleResult.Errors.Select(error => error.Description)));
            }
        }
    }
}