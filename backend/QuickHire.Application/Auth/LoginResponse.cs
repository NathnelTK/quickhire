namespace QuickHire.Application.Auth;

public sealed record LoginResponse(
    string AccessToken,
    DateTimeOffset ExpiresAt,
    string Name,
    IReadOnlyList<string> Roles);