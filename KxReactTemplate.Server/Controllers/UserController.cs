using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KxReactTemplate.Server.Controllers
{
    [ApiController]
    [Route("me")]
    public class UserController : ControllerBase
    {
        [HttpGet]
        [Authorize]
        public IActionResult GetUser()
        {
            return Ok(new { username = User.Identity?.Name, displayName = "John Doe" });
        }
    }

}
