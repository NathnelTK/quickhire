namespace QuickHire.Application.Auth;

public interface ITokenService
{
    LoginResponse CreateToken(Guid userId, string email, string name, IReadOnlyList<string> roles);
}