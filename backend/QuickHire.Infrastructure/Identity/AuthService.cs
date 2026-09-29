using Microsoft.AspNetCore.Identity;
using QuickHire.Application.Auth;

namespace QuickHire.Infrastructure.Identity;

public sealed class AuthService(
    UserManager<ApplicationUser> userManager,
    ITokenService tokenService) : IAuthService
{
    public async Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByEmailAsync(request.Email.Trim());
        if (user is null)
        {
            return null;
        }

        if (await userManager.IsLockedOutAsync(user)) return null;
        if (!await userManager.CheckPasswordAsync(user, request.Password))
        {
            await userManager.AccessFailedAsync(user);
            return null;
        }
        await userManager.ResetAccessFailedCountAsync(user);

        var roles = await userManager.GetRolesAsync(user);
        if (roles.Count == 0)
        {
            return null;
        }

        var name = $"{user.FirstName} {user.LastName}".Trim();
        return tokenService.CreateToken(user.Id, user.Email!, name, roles.ToArray());
    }
}