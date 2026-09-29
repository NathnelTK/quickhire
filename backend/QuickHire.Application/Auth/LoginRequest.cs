using System.ComponentModel.DataAnnotations;

namespace QuickHire.Application.Auth;

public sealed record LoginRequest(
    [param: Required, EmailAddress, StringLength(320)] string Email,
    [param: Required, StringLength(128)] string Password);