package com.microblog.api.post

import com.microblog.api.user.User
import jakarta.enterprise.context.ApplicationScoped
import jakarta.transaction.Transactional
import jakarta.validation.Valid
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import java.time.Instant
import java.util.UUID

@Path("/v1/posts")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
class PostResource {

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
    fun createPost(@Valid request: CreatePostRequest): Response {
        val author = User.findById(request.authorId)
            ?: return Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf("error" to "Author (User) not found with ID: ${request.authorId}"))
                .build()

        val newPost = Post().apply {
            id = "post_${UUID.randomUUID()}"
            content = request.content
            createdAt = Instant.now()
            authorId = request.authorId
        }
        newPost.persist()

        // Increment author's post count
        author.postCount += 1
        author.persist()

        return Response.status(Response.Status.CREATED).entity(newPost.toDTO(author)).build()
    }

    @GET
    @Path("/{postId}")
    fun getPostById(@PathParam("postId") postId: String): Response {
        val post = Post.findById(postId)
            ?: return Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf("error" to "Post not found"))
                .build()

        val author = User.findById(post.authorId)
        // If author is null, toDTO will use a fallback "Unknown User"

        return Response.ok(post.toDTO(author)).build()
    }

    @GET
    @Path("/user/{userId}") // Changed from /users/{userId}/posts to avoid conflict if UserResource is also present
    fun getPostsByUserId(
        @PathParam("userId") userId: String,
        @QueryParam("limit") @DefaultValue("20") limit: Int,
        @QueryParam("offset") @DefaultValue("0") offset: Int
    ): Response {
        val user = User.findById(userId)
            ?: return Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf("error" to "User not found with ID: $userId"))
                .build()

        val posts = Post.find("authorId", userId)
            .page(offset / limit, limit) // Panache page index is 0-based
            .list()

        val postDTOs = posts.map { post ->
            // For multiple posts, fetching each author individually can be N+1.
            // In a real app, consider a more optimized query or batch fetch if performance is critical.
            // For now, direct fetch is acceptable.
            val authorForPost = User.findById(post.authorId) // This could be the same 'user' object if posts are by the queried user.
            post.toDTO(authorForPost ?: user) // Use the initially fetched user as a default if specific author lookup fails
        }
        return Response.ok(postDTOs).build()
    }


    @DELETE
    @Path("/{postId}")
    @Transactional
    fun deletePost(@PathParam("postId") postId: String /*, @Context securityContext: SecurityContext */): Response {
        // Authentication/Authorization needed:
        // val principal = securityContext.userPrincipal
        // if (principal == null || principal.name != post.authorId) {
        //     return Response.status(Response.Status.UNAUTHORIZED).build()
        // }
        // For now, we'll allow deletion if the post exists.

        val post = Post.findById(postId)
            ?: return Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf("error" to "Post not found"))
                .build()

        val author = User.findById(post.authorId)
        if (author != null) {
            author.postCount = (author.postCount - 1).coerceAtLeast(0)
            author.persist()
        }

        Post.deleteById(postId)
        return Response.noContent().build()
    }
}
