// namespace QuickHire.Infrastructure.Persistence;

// using Microsoft.EntityFrameworkCore;
// using QuickHire.Domain.Entities;
// using QuickHire.Domain.Enums;

// public static class DatabaseSeeder
// {
//     public static async Task SeedAsync(AppDbContext context)
//     {
//         // Ensure database exists/migrated
//         await context.Database.MigrateAsync();

//         if (await context.Departments.AnyAsync()) return; // Already seeded

//         // 1. Seed Departments
//         var hrDept = new Department { Name = "Human Resources", Code = "HR", Description = "People and Culture operations." };
//         var engDept = new Department { Name = "Engineering", Code = "ENG", Description = "Software engineering and development." };
//         var mktDept = new Department { Name = "Marketing", Code = "MKT", Description = "Brand growth and customer outreach." };
//         var finDept = new Department { Name = "Finance", Code = "FIN", Description = "Financial planning and accounting." };
//         var salesDept = new Department { Name = "Sales", Code = "SLS", Description = "Revenue generation and client success." };

//         await context.Departments.AddRangeAsync(hrDept, engDept, mktDept, finDept, salesDept);
//         await context.SaveChangesAsync();

//         // 2. Seed Employees
//         var managerEng = new Employee
//         {
//             FirstName = "Alex",
//             LastName = "Morgan",
//             Email = "alex.morgan@quickhire.com",
//             Phone = "123-456-7890",
//             JobTitle = "Engineering Manager",
//             EmploymentType = EmploymentType.FullTime,
//             Salary = 120000,
//             HireDate = DateTime.UtcNow.AddYears(-3),
//             DepartmentId = engDept.Id
//         };

//         await context.Employees.AddAsync(managerEng);
//         await context.SaveChangesAsync();

//         var employees = new List<Employee>
//         {
//             new() { FirstName = "John", LastName = "Doe", Email = "john.doe@quickhire.com", Phone = "123-456-7891", JobTitle = "Senior Software Engineer", Salary = 95000, HireDate = DateTime.UtcNow.AddYears(-2), DepartmentId = engDept.Id, ManagerId = managerEng.Id },
//             new() { FirstName = "Jane", LastName = "Smith", Email = "jane.smith@quickhire.com", Phone = "123-456-7892", JobTitle = "Frontend Developer", Salary = 75000, HireDate = DateTime.UtcNow.AddYears(-1), DepartmentId = engDept.Id, ManagerId = managerEng.Id },
//             new() { FirstName = "Sarah", LastName = "Connor", Email = "sarah.connor@quickhire.com", Phone = "123-456-7893", JobTitle = "HR Specialist", Salary = 65000, HireDate = DateTime.UtcNow.AddYears(-2), DepartmentId = hrDept.Id },
//             new() { FirstName = "Michael", LastName = "Scott", Email = "michael.scott@quickhire.com", Phone = "123-456-7894", JobTitle = "Regional Sales Director", Salary = 85000, HireDate = DateTime.UtcNow.AddYears(-4), DepartmentId = salesDept.Id },
//             new() { FirstName = "Pam", LastName = "Beesly", Email = "pam.beesly@quickhire.com", Phone = "123-456-7895", JobTitle = "Marketing Specialist", Salary = 55000, HireDate = DateTime.UtcNow.AddMonths(-6), DepartmentId = mktDept.Id },
//             new() { FirstName = "Oscar", LastName = "Martinez", Email = "oscar.martinez@quickhire.com", Phone = "123-456-7896", JobTitle = "Senior Accountant", Salary = 80000, HireDate = DateTime.UtcNow.AddYears(-3), DepartmentId = finDept.Id },
//             new() { FirstName = "Jim", LastName = "Halpert", Email = "jim.halpert@quickhire.com", Phone = "123-456-7897", JobTitle = "Account Executive", Salary = 70000, HireDate = DateTime.UtcNow.AddYears(-2), DepartmentId = salesDept.Id },
//             new() { FirstName = "Dwight", LastName = "Schrute", Email = "dwight.schrute@quickhire.com", Phone = "123-456-7898", JobTitle = "Assistant to the Regional Manager", Salary = 68000, HireDate = DateTime.UtcNow.AddYears(-3), DepartmentId = salesDept.Id },
//             new() { FirstName = "Kevin", LastName = "Malone", Email = "kevin.malone@quickhire.com", Phone = "123-456-7899", JobTitle = "Junior Accountant", Salary = 50000, HireDate = DateTime.UtcNow.AddMonths(-10), DepartmentId = finDept.Id }
//         };

//         await context.Employees.AddRangeAsync(employees);
//         await context.SaveChangesAsync();

//         // 3. Seed Job Postings
//         var job1 = new JobPosting
//         {
//             Title = "Full Stack .NET & Angular Developer",
//             Description = "We are seeking a talented Full Stack Developer to build out modern HR software applications.",
//             Requirements = ".NET 8+, Angular 16+, PostgreSQL, Clean Architecture experience required.",
//             Location = "Remote / On-site",
//             MinimumSalary = 80000,
//             MaximumSalary = 105000,
//             Status = JobStatus.Open,
//             PostedDate = DateTime.UtcNow.AddDays(-10),
//             DepartmentId = engDept.Id
//         };

//         var job2 = new JobPosting
//         {
//             Title = "HR Lead & Talent Recruiter",
//             Description = "Lead the full recruitment lifecycle and manage key HR functions.",
//             Requirements = "3+ years HR experience, knowledge of employment law and recruiting tools.",
//             Location = "On-site",
//             MinimumSalary = 60000,
//             MaximumSalary = 75000,
//             Status = JobStatus.Open,
//             PostedDate = DateTime.UtcNow.AddDays(-5),
//             DepartmentId = hrDept.Id
//         };

//         var job3 = new JobPosting
//         {
//             Title = "Senior Financial Analyst",
//             Description = "Analyze business statistics and oversee annual budget planning.",
//             Requirements = "Degree in Finance, CPA preferred, advanced Excel/SQL skills.",
//             Location = "Hybrid",
//             MinimumSalary = 85000,
//             MaximumSalary = 100000,
//             Status = JobStatus.Draft,
//             DepartmentId = finDept.Id
//         };

//         await context.JobPostings.AddRangeAsync(job1, job2, job3);
//         await context.SaveChangesAsync();

//         // 4. Seed Applicants
//         var applicants = new List<Applicant>
//         {
//             new() { FirstName = "Alice", LastName = "Johnson", Email = "alice.j@gmail.com", Phone = "555-0100", ResumeUrl = "https://example.com/resumes/alice.pdf", Status = ApplicantStatus.UnderReview, JobPostingId = job1.Id },
//             new() { FirstName = "Bob", LastName = "Williams", Email = "bob.williams@yahoo.com", Phone = "555-0101", ResumeUrl = "https://example.com/resumes/bob.pdf", Status = ApplicantStatus.Interviewing, JobPostingId = job1.Id },
//             new() { FirstName = "Charlie", LastName = "Brown", Email = "charlie.b@outlook.com", Phone = "555-0102", ResumeUrl = "https://example.com/resumes/charlie.pdf", Status = ApplicantStatus.Received, JobPostingId = job2.Id }
//         };

//         await context.Applicants.AddRangeAsync(applicants);
//         await context.SaveChangesAsync();
//     }
// }
using Microsoft.EntityFrameworkCore;
using QuickHire.Domain.Entities; // Adjust namespaces as per your Domain models

namespace QuickHire.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Ensure database is created/migrated
        await context.Database.MigrateAsync();

        // 1. Seed Departments if none exist
        if (!await context.Departments.AnyAsync())
        {
            var engineering = new Department
            {
                Id = Guid.NewGuid(),
                Name = "Engineering",
                Code = "ENG",
                Description = "Software development and infrastructure management",
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            var hr = new Department
            {
                Id = Guid.NewGuid(),
                Name = "Human Resources",
                Code = "HR",
                Description = "People operations and talent acquisition",
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            await context.Departments.AddRangeAsync(engineering, hr);
            await context.SaveChangesAsync();
        }
    }
}