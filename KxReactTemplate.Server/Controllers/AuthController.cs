
using KxReactTemplate.Server.Models;
using KxReactTemplate.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace KxReactTemplate.Server.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly RefreshTokenService _refreshTokenService;
        private readonly TokenUtils _tokenUtils;
        private const string Username = "john";
        private const string Password = "doe";

        public AuthController(RefreshTokenService refreshTokenService, TokenUtils tokenUtils)
        {
            _refreshTokenService = refreshTokenService;
            _tokenUtils = tokenUtils;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest req)
        {
            if (req.Username != Username || req.Password != Password)
                return Unauthorized();

            var accessToken = _tokenUtils.GenerateJwtToken(req.Username);
            var refreshToken = _refreshTokenService.GenerateRefreshToken(req.Username, HttpContext.Connection.RemoteIpAddress?.ToString());

            _tokenUtils.SetRefreshTokenCookie(HttpContext, refreshToken.Token);
            return Ok(new { accessToken });
        }

        [HttpPost("refresh")]
        public IActionResult Refresh()
        {
            var oldToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrWhiteSpace(oldToken)) return Unauthorized();

            var result = _refreshTokenService.RotateRefreshToken(oldToken, HttpContext.Connection.RemoteIpAddress?.ToString());
            if (result == null) return Unauthorized();

            _tokenUtils.SetRefreshTokenCookie(HttpContext, result.Token);
            var accessToken = _tokenUtils.GenerateJwtToken(result.UserName);
            return Ok(new { accessToken });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            var token = Request.Cookies["refreshToken"];
            if (!string.IsNullOrEmpty(token)) _refreshTokenService.RevokeToken(token);
            Response.Cookies.Delete("refreshToken");
            return Ok();
        }
    }
}
