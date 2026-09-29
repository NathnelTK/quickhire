using Microsoft.AspNetCore.Identity;

namespace QuickHire.Infrastructure.Identity;

public sealed class ApplicationUser : IdentityUser<Guid>
{
    public required string FirstName { get; set; }

    public required string LastName { get; set; }
}