package com.microblog.api.post

import com.microblog.api.user.User
import io.quarkus.security.Authenticated
import jakarta.enterprise.context.ApplicationScoped
import jakarta.inject.Inject
import jakarta.transaction.Transactional
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
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

@Path("/v1/posts")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Posts", description = "Post management operations")
@SecurityScheme(
    securitySchemeName = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT"
)
class PostResource {

    @Inject
    lateinit var jwt: JsonWebToken
    
    private val logger = Logger.getLogger(PostResource::class.java)
    
    companion object {
        private const val STANDARD_POST_LENGTH = 280
        private const val MAX_POST_LENGTH = 25000
        private const val DEFAULT_PAGE_SIZE = 20
        private const val MAX_PAGE_SIZE = 100
    }

    // Helper function to map Post entity to PostDTO
    private fun Post.toDTO(author: User?): PostDTO {
        val authorDTO = author?.let {
            PostAuthorDTO(id = it.id, username = it.username, displayName = it.displayName)
        } ?: PostAuthorDTO(id = this.authorId, username = "unknown", displayName = "Unknown User") // Fallback

        return PostDTO(
            id = this.id,
            content = this.content,
            createdAt = this.createdAt.toString(),
            author = authorDTO
        )
    }

    @POST
    @Transactional
    @Authenticated
    @Operation(
        summary = "Create a new post",
        description = "Creates a new post for the authenticated user"
    )
    @SecurityRequirement(name = "bearerAuth")
    @APIResponses(
        APIResponse(
            responseCode = "201",
            description = "Post created successfully",
            content = [Content(mediaType = "application/json", schema = Schema(implementation = PostDTO::class))]
        ),
        APIResponse(
            responseCode = "400",
            description = "Invalid input"
        ),
        APIResponse(
            responseCode = "401",
            description = "Unauthorized - User not authenticated"
        )
    )
    fun createPost(
        @Valid request: CreatePostRequest,
        @Context securityContext: SecurityContext
    ): Response {
        val authorId = securityContext.userPrincipal.name
        val author = User.findById(authorId)
            ?: return Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf("error" to "User not found"))
                .build()

        // Additional validation
        if (request.content.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(mapOf("error" to "Post content cannot be empty"))
                .build()
        }

        val limit = if (author.isPremium) MAX_POST_LENGTH else STANDARD_POST_LENGTH

        if (request.content.length > limit) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(mapOf("error" to "Post content exceeds maximum length of $limit characters for your tier"))
                .build()
        }

        val newPost = Post().apply {
            id = "post_${UUID.randomUUID()}"
            content = request.content.trim()
            createdAt = Instant.now()
            this.authorId = authorId
        }
        
        newPost.persist()

        // Increment author's post count
        author.postCount += 1
        author.persist()
        
        logger.infof("New post created by user %s (ID: %s)", author.username, newPost.id)

        return Response.status(Response.Status.CREATED)
            .entity(newPost.toDTO(author))
            .build()
    }

    @GET
    @Path("/{postId}")
    @Operation(
        summary = "Get post by ID",
        description = "Retrieves a specific post by its ID"
    )
    @SecurityRequirement(name = "bearerAuth")
    @APIResponses(
        APIResponse(
            responseCode = "200",
            description = "Post found",
            content = [Content(mediaType = "application/json", schema = Schema(implementation = PostDTO::class))]
        ),
        APIResponse(
            responseCode = "404",
            description = "Post not found"
        )
    )
    fun getPostById(
        @PathParam("postId") postId: String,
        @Context securityContext: SecurityContext
    ): Response {
        val post = Post.findById(postId)
            ?: return Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf("error" to "Post not found"))
                .build()

        val author = User.findById(post.authorId)
        // If author is null, toDTO will use a fallback "Unknown User"
        
        logger.debugf("Post %s retrieved by user %s", postId, securityContext.userPrincipal?.name ?: "anonymous")
        
        return Response.ok(post.toDTO(author)).build()
    }

    @GET
    @Path("/user/{userId}")
    @Operation(
        summary = "Get posts by user ID",
        description = "Retrieves a paginated list of posts for a specific user"
    )
    @SecurityRequirement(name = "bearerAuth")
    @APIResponses(
        value = [
            APIResponse(
                responseCode = "200",
                description = "List of posts",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = Array<PostDTO>::class)
                    )
                ]
            ),
            APIResponse(
                responseCode = "404",
                description = "User not found"
            )
        ]
    )
    fun getPostsByUserId(
        @Parameter(
            description = "ID of the user whose posts to retrieve",
            required = true,
            example = "user_12345"
        )
        @PathParam("userId") userId: String,
        
        @Parameter(
            description = "Maximum number of posts to return",
            required = false,
            example = "20"
        )
        @QueryParam("limit") 
        @DefaultValue("$DEFAULT_PAGE_SIZE") 
        limit: Int,
        
        @Parameter(
            description = "Number of posts to skip for pagination",
            required = false,
            example = "0"
        )
        @QueryParam("offset") 
        @DefaultValue("0") 
        offset: Int,
        @Context securityContext: SecurityContext
    ): Response {
        // Validate pagination parameters
        val pageSize = limit.coerceIn(1, MAX_PAGE_SIZE)
        val pageIndex = offset.coerceAtLeast(0) / pageSize

        val user = User.findById(userId)
            ?: return Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf("error" to "User not found with ID: $userId"))
                .build()

        // In a real app, you might want to restrict access to private posts here
        // Get posts with pagination
        val posts = Post.find("authorId = ?1 order by createdAt desc", userId)
            .page(offset / limit, limit)
            .list()

        // Get authors for the posts
        val authors = if (posts.isNotEmpty()) {
            val authorIds = posts.map { it.authorId }.toSet()
            User.find("id in ?1", authorIds).list().associateBy { it.id }
        } else {
            emptyMap<String, User>()
        }

        // Map posts to DTOs
        val postDTOs = posts.map { post ->
            val author = authors[post.authorId] ?: user
            PostDTO(
                id = post.id,
                content = post.content,
                author = PostAuthorDTO(
                    id = author.id,
                    username = author.username,
                    displayName = author.displayName ?: author.username
                ),
                createdAt = post.createdAt.toString()
            )
        }
        
        logger.debugf("Retrieved %d posts for user %s", postDTOs.size, userId)
        
        return Response.ok(postDTOs).build()
    }


    @DELETE
    @Path("/{postId}")
    @Transactional
    @Authenticated
    @Operation(
        summary = "Delete a post",
        description = "Deletes a specific post. Only the post author or an admin can delete a post."
    )
    @SecurityRequirement(name = "bearerAuth")
    @APIResponses(
        APIResponse(
            responseCode = "204",
            description = "Post deleted successfully"
        ),
        APIResponse(
            responseCode = "403",
            description = "Not authorized to delete this post"
        ),
        APIResponse(
            responseCode = "404",
            description = "Post not found"
        )
    )
    fun deletePost(
        @PathParam("postId") postId: String,
        @Context securityContext: SecurityContext
    ): Response {
        val currentUserId = securityContext.userPrincipal.name
        
        // Find the post first
        val post = Post.findById(postId)
            ?: return Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf("error" to "Post not found"))
                .build()
        
        // Check if the current user is the author or an admin
        if (post.authorId != currentUserId && !securityContext.isUserInRole("admin")) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(mapOf("error" to "Not authorized to delete this post"))
                .build()
        }

        // Get the author and decrement post count
        val author = User.findById(post.authorId)
        if (author != null) {
            author.postCount = (author.postCount - 1).coerceAtLeast(0)
            author.persist()
        }

        // Delete the post
        val deleted = Post.deleteById(postId)
        
        if (deleted) {
            logger.infof("Post %s deleted by user %s", postId, currentUserId)
            return Response.noContent().build()
        } else {
            logger.errorf("Failed to delete post %s", postId)
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(mapOf("error" to "Failed to delete post"))
                .build()
        }
    }
    
    // Request DTOs
    
    @Schema(description = "Request payload for creating a new post")
    data class CreatePostRequest(
        @field:NotBlank(message = "Post content is required")
        @field:Size(max = MAX_POST_LENGTH, message = "Post content cannot exceed $MAX_POST_LENGTH characters")
        @field:Schema(
            description = "The content of the post",
            required = true,
            maxLength = MAX_POST_LENGTH,
            example = "This is a sample post content. #example #microblog"
        )
        val content: String
    )
    
    // PostDTO and PostAuthorDTO moved to their own files
    // to avoid duplicate declarations and circular dependencies
    

}
