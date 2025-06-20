package com.microblog.api.auth

import jakarta.ws.rs.Consumes
import jakarta.ws.rs.POST
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response

@Path("/v1/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
class AuthResource {

    data class TokenResponse(val token: String)

    @POST
    @Path("/token")
    fun getToken(request: TokenRequest): Response {
        if (request.username.isNullOrBlank() || request.password.isNullOrBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(mapOf("error" to "Username and password must be provided"))
                .build()
        }

        // Mock authentication: accept any non-empty username/password
        // In a real application, you would validate credentials and generate a real JWT
        val mockJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
                      "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwidXNlcm5hbWUiOiJ" +
                      "${request.username}\",ImlhdCI6MTUxNjIzOTAyMn0." +
                      "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" // This is a static, unsafe JWT. For testing only.

        return Response.ok(TokenResponse(mockJwt)).build()
    }
}
