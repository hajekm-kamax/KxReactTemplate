using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace KxReactTemplate.Server.Services
{
    public class TokenUtils
    {
        private const string JwtSecret = "supersecretkey!123123123123123123123123";

        public string GenerateJwtToken(string username)
        {
            var claims = new[]
            {
            new Claim(ClaimTypes.Name, username)
        };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtSecret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddSeconds(15),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public void SetRefreshTokenCookie(HttpContext http, string token)
        {
            http.Response.Cookies.Append("refreshToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddMinutes(1)
            });
        }
    }
}
