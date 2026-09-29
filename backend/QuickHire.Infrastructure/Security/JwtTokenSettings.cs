namespace QuickHire.Infrastructure.Security;

public sealed record JwtTokenSettings(string Issuer, string Audience, string SigningKey);