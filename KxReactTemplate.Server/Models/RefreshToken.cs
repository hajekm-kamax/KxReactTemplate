namespace KxReactTemplate.Server.Models
{
    public class RefreshToken
    {
        public string Token { get; set; } = default!;
        public string UserName { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime? RevokedAt { get; set; }
        public string? ReplacedByToken { get; set; }
        public string? CreatedByIp { get; set; }
        public bool IsActive => RevokedAt == null && !IsExpired;
        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    }
}
