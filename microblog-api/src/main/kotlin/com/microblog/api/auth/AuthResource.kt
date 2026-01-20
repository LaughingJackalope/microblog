package com.microblog.api.auth

import io.smallrye.jwt.build.Jwt
import jakarta.enterprise.context.ApplicationScoped
import jakarta.ws.rs.Consumes
import jakarta.ws.rs.POST
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.config.inject.ConfigProperty
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.media.Content
import org.eclipse.microprofile.openapi.annotations.media.Schema
import org.eclipse.microprofile.openapi.annotations.parameters.RequestBody
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse
import org.eclipse.microprofile.openapi.annotations.tags.Tag
// OWASP Encoder removed as it's not used
import java.time.Duration
import java.time.Instant
import java.util.*

@Path("/v1/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
@Tag(name = "Authentication", description = "Authentication operations")
class AuthResource(
    @ConfigProperty(name = "mp.jwt.verify.issuer", defaultValue = "https://microblog.example.com") 
    private val issuer: String
) {
// Import statements
// import javax.xml.parsers.DocumentBuilderFactory
// import org.w3c.dom.Document

    @Schema(description = "Authentication token response")
    data class TokenResponse(
        @field:Schema(description = "JWT token for authentication", required = true, example = "eyJhbGciOiJSUzI1NiJ9...")
        val token: String,
        
        @field:Schema(description = "Token expiration time in seconds", required = true, example = "3600")
        val expiresIn: Long
    )

    @Schema(description = "Authentication request")
    data class TokenRequest(
        @field:Schema(description = "Username", required = true, example = "johndoe")
        val username: String?,
        
        @field:Schema(description = "Password", required = true, example = "your-secure-password", format = "password")
        val password: String?
    )

    @POST
    @Path("/token")
    @Operation(
        summary = "Get authentication token",
        description = "Authenticate a user and retrieve a JWT token"
    )
    @APIResponse(
        responseCode = "200",
        description = "Authentication successful",
        content = [Content(mediaType = "application/json", schema = Schema(implementation = TokenResponse::class))]
    )
    @APIResponse(
        responseCode = "400",
        description = "Invalid request parameters"
    )
    @APIResponse(
        responseCode = "401",
        description = "Invalid credentials"
    )
    fun getToken(
        @RequestBody(
            description = "Authentication request",
            required = true,
            content = [Content(mediaType = "application/json", schema = Schema(implementation = TokenRequest::class))]
        )
        request: TokenRequest
    ): Response {
        if (request.username.isNullOrBlank() || request.password.isNullOrBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(mapOf("error" to "Username and password must be provided"))
                .build()
        }

        // In a real application, validate credentials against your user store
        if (!isValidCredentials(request.username, request.password)) {
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(mapOf("error" to "Invalid credentials"))
                .build()
        }

        val jwt = generateSecureJWT(request.username)
        val expiresIn = 3600L // 1 hour in seconds

        return Response.ok(TokenResponse(jwt, expiresIn)).build()
    }

    private fun generateSecureJWT(username: String): String {
        val now = Instant.now()
        val expiresAt = now.plus(Duration.ofHours(1))

        return Jwt.issuer(issuer)
            .upn(username)
            .groups(setOf("user")
                .filter { group -> group.isNotBlank() }
                .toSet())
            .claim("username", username)
            .issuedAt(now)
            .expiresAt(expiresAt)
            .sign()
    }

    private fun isValidCredentials(username: String, password: String): Boolean {
        // TODO: Implement proper credential validation against your user store
        // This is a placeholder - in production, use secure password hashing
        return username.isNotBlank() && password.isNotBlank()
    }

    // XML parsing with entity expansion disabled (if still needed)
    private fun parseXMLSafely(xmlString: String): String {
        // If you need XML parsing, uncomment and use this secure implementation
        // val dbf = DocumentBuilderFactory.newInstance()
        // dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true)
        // dbf.setFeature("http://xml.org/sax/features/external-general-entities", false)
        // dbf.setFeature("http://xml.org/sax/features/external-parameter-entities", false)
        // val builder = dbf.newDocumentBuilder()
        // return builder.parse(InputSource(StringReader(xmlString)))
        
        // For now, just return the input string as we might not need XML parsing
        return xmlString
    }
}
