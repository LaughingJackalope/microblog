package com.microblog.api.user

import jakarta.enterprise.context.ApplicationScoped
import jakarta.transaction.Transactional
import jakarta.validation.Valid
import jakarta.validation.constraints.Size
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import java.time.Instant
import java.util.UUID

@Path("/v1/users")
@ApplicationScoped // Required for Panache transactions and CDI
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
class UserResource {

    @POST
    @Transactional // Panache operations that modify the DB should be transactional
    fun registerUser(@Valid request: RegisterUserRequest): Response {
        // Check if username already exists
        if (User.find("username", request.username).firstResult() != null) {
            return Response.status(Response.Status.CONFLICT)
                .entity(mapOf("error" to "Username already exists"))
                .build()
        }

        val newUserEntity = request.toEntity(
            id = "user_${UUID.randomUUID()}",
            joinDate = Instant.now()
        )

        newUserEntity.persist()

        // Log user registration
        println("New user registered: ${newUserEntity.username} (ID: ${newUserEntity.id})")

        return Response.status(Response.Status.CREATED).entity(newUserEntity.toDTO()).build()
    }

    @GET
    @Path("/{userId}")
    fun getUserById(@PathParam("userId") userId: String): Response {
        val userEntity: User? = User.findById(userId)
        return if (userEntity != null) {
            Response.ok(userEntity.toDTO()).build()
        } else {
            Response.status(Response.Status.NOT_FOUND).entity(mapOf("error" to "User not found")).build()
        }
    }

    @GET
    @Path("/me")
    // @Authenticated // Will be secured later
    fun getCurrentUser(): Response {
        // Placeholder - this needs actual authentication context to work correctly.
        // For now, let's try to retrieve the first user from DB as a mock.
        val firstUserEntity: User? = User.findAll().firstResult()
        return if (firstUserEntity != null) {
            Response.ok(firstUserEntity.toDTO()).build()
        } else {
            Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf("error" to "No users available or authenticated user not found"))
                .build()
        }
    }

    @PUT
    @Path("/me")
    // @Authenticated // Will be secured later
    fun updateCurrentUser(@Valid request: UpdateUserRequest): Response {
        // Placeholder
        // To be implemented: update the authenticated user's profile.
        // For now, this is a stub.
        // A real implementation would get current user ID from security context.
        return Response.status(Response.Status.NOT_IMPLEMENTED)
                       .entity(mapOf("message" to "Endpoint not yet implemented"))
                       .build()
    }
}

// Define UpdateUserRequest for the PUT /users/me endpoint placeholder
data class UpdateUserRequest(
    @field:Size(max = 100, message = "Display name cannot exceed 100 characters.")
    val displayName: String?,

    @field:Size(max = 250, message = "Bio cannot exceed 250 characters.")
    val bio: String?
)
