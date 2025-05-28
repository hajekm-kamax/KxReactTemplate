using System.Collections.Concurrent;
using System.Security.Cryptography;
using KxReactTemplate.Server.Models;

namespace KxReactTemplate.Server.Services
{
    public class RefreshTokenService
    {
        private readonly ConcurrentDictionary<string, RefreshToken> _store = new();

        public RefreshToken GenerateRefreshToken(string username, string? ip)
        {
            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            var refreshToken = new RefreshToken
            {
                Token = token,
                UserName = username,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedByIp = ip
            };
            _store[token] = refreshToken;
            return refreshToken;
        }

        public RefreshToken? RotateRefreshToken(string oldToken, string? ip)
        {
            if (!_store.TryGetValue(oldToken, out var existing) || !existing.IsActive)
                return null;

            var newToken = GenerateRefreshToken(existing.UserName, ip);
            existing.RevokedAt = DateTime.UtcNow;
            existing.ReplacedByToken = newToken.Token;
            _store[oldToken] = existing;
            _store[newToken.Token] = newToken;
            return newToken;
        }

        public void RevokeToken(string token)
        {
            if (_store.TryGetValue(token, out var existing))
            {
                existing.RevokedAt = DateTime.UtcNow;
                _store[token] = existing;
            }
        }
    }
}
