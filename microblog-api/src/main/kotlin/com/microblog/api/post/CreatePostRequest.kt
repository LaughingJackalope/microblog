package com.microblog.api.post

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class CreatePostRequest(
    @field:NotBlank(message = "Content cannot be empty.")
    @field:Size(max = 25000, message = "Post content must not exceed 25000 characters.")
    val content: String,

    // In a real scenario with authentication, authorId would come from the security context.
    // For now, we'll require it in the request to link the post to a user.
    @field:NotBlank(message = "Author ID cannot be empty.")
    val authorId: String
)
