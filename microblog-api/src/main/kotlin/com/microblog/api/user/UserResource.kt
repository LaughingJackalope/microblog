package com.microblog.api.user

import io.quarkus.hibernate.orm.panache.kotlin.PanacheQuery
import io.quarkus.security.Authenticated
import jakarta.enterprise.context.ApplicationScoped
import jakarta.inject.Inject
import jakarta.transaction.Transactional
import jakarta.validation.Valid
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import jakarta.ws.rs.*
import jakarta.ws.rs.core.Context
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import jakarta.ws.rs.core.SecurityContext
import org.eclipse.microprofile.jwt.JsonWebToken
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.enums.SecuritySchemeType
import org.eclipse.microprofile.openapi.annotations.media.Content
import org.eclipse.microprofile.openapi.annotations.media.ExampleObject
import org.eclipse.microprofile.openapi.annotations.media.Schema
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter
import org.eclipse.microprofile.openapi.annotations.parameters.RequestBody
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement
import org.eclipse.microprofile.openapi.annotations.security.SecurityScheme
import org.eclipse.microprofile.openapi.annotations.tags.Tag
import org.jboss.logging.Logger
import java.time.Instant
import java.util.*
import jakarta.json.Json
import jakarta.json.JsonObject

@Path("/v1/users")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Users", description = "User management operations")
@SecurityScheme(
    securitySchemeName = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT"
)
class UserResource {

    @Inject
    lateinit var jwt: JsonWebToken

    private val logger = Logger.getLogger(UserResource::class.java)

    @POST
    @Path("/register")
    @Transactional
    @Operation(
        summary = "Register a new user",
        description = "Creates a new user account with the provided details"
    )
    @APIResponses(
        APIResponse(
            responseCode = "201",
            description = "User registered successfully",
            content = [Content(mediaType = "application/json", schema = Schema(implementation = UserDTO::class))]
        ),
        APIResponse(
            responseCode = "400",
            description = "Invalid input"
        ),
        APIResponse(
            responseCode = "409",
            description = "Username or email already exists"
        )
    )
    fun registerUser(@Valid request: RegisterUserRequest): Response {
        // Check if username already exists
        if (User.find("username", request.username).firstResult() != null) {
            return Response.status(Response.Status.CONFLICT)
                .entity(mapOf("error" to "Username already exists"))
                .build()
        }

        val newUserEntity = request.toEntity(id = "user_${UUID.randomUUID()}", joinDate = Instant.now())
        newUserEntity.persist()
        
        logger.info("New user registered: ${newUserEntity.username} (ID: ${newUserEntity.id})")
        
        return Response.status(Response.Status.CREATED)
            .entity(newUserEntity.toDTO())
            .build()
    }

    @GET
    @Path("/{userId}")
    @Authenticated
    @Operation(
        summary = "Get user by ID",
        description = "Retrieves user details by user ID. Users can only view their own profile unless they are admins."
    )
    @SecurityRequirement(name = "bearerAuth")
    @APIResponses(
        APIResponse(
            responseCode = "200",
            description = "User found",
            content = [Content(mediaType = "application/json", schema = Schema(implementation = UserDTO::class))]
        ),
        APIResponse(
            responseCode = "403",
            description = "Not authorized to view this user"
        ),
        APIResponse(
            responseCode = "404",
            description = "User not found"
        )
    )
    fun getUserById(
        @PathParam("userId") userId: String,
        @Context securityContext: SecurityContext
    ): Response {
        val currentUser = securityContext.userPrincipal.name
        
        // Only allow users to view their own profile or admins to view any profile
        if (currentUser != userId && !securityContext.isUserInRole("admin")) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(mapOf("error" to "Not authorized to view this user"))
                .build()
        }

        val userEntity = User.findById(userId)
            ?: return Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf("error" to "User not found"))
                .build()

        return Response.ok(userEntity.toDTO()).build()
    }

    @GET
    @Path("/me")
    @Authenticated
    @Operation(
        summary = "Get current user profile",
        description = "Retrieves the profile of the currently authenticated user"
    )
    @SecurityRequirement(name = "bearerAuth")
    @APIResponses(
        APIResponse(
            responseCode = "200",
            description = "User profile retrieved successfully",
            content = [Content(mediaType = "application/json", schema = Schema(implementation = UserDTO::class))]
        ),
        APIResponse(
            responseCode = "404",
            description = "User not found"
        )
    )
    fun getCurrentUser(
        @Context securityContext: SecurityContext
    ): Response {
        val userId = securityContext.userPrincipal.name
        val user = User.findById(userId)
            ?: return Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf("error" to "User not found"))
                .build()

        logger.debugf("User %s accessed their profile", userId)
        return Response.ok(user.toDTO()).build()
    }

    @PUT
    @Path("/me")
    @Authenticated
    @Transactional
    @Operation(
        summary = "Update current user profile",
        description = "Updates the profile of the currently authenticated user"
    )
    @SecurityRequirement(name = "bearerAuth")
    @APIResponses(
        APIResponse(
            responseCode = "200",
            description = "Profile updated successfully",
            content = [Content(mediaType = "application/json", schema = Schema(implementation = UserDTO::class))]
        ),
        APIResponse(
            responseCode = "400",
            description = "Invalid input"
        ),
        APIResponse(
            responseCode = "404",
            description = "User not found"
        )
    )
    fun updateCurrentUser(
        @Valid request: UpdateUserRequest,
        @Context securityContext: SecurityContext
    ): Response {
        val userId = securityContext.userPrincipal.name
        val user = User.findById(userId)
            ?: return Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf("error" to "User not found"))
                .build()

        // Update allowed fields
        request.displayName?.let { user.displayName = it }
        request.bio?.let { user.bio = it }
        
        user.persist()
        
        logger.infof("User %s updated their profile", userId)
        return Response.ok(user.toDTO()).build()
    }
}

// Request DTOs

    // RegisterUserRequest is defined in its own file
