package com.microblog.api.post

import java.time.Instant

data class PostDTO(
    val id: String,
    val content: String,
    val createdAt: String, // ISO 8601 string format
    val author: PostAuthorDTO
)
