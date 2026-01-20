package com.microblog.api.user

import org.eclipse.microprofile.openapi.annotations.media.Schema

/**
 * Data Transfer Object for User information.
 * This is the public representation of a user that's exposed via the API.
 */
@Schema(description = "User information data transfer object")
data class UserDTO(
    @field:Schema(
        description = "Unique identifier of the user",
        example = "user_12345",
        required = true
    )
    val id: String,

    @field:Schema(
        description = "Unique username",
        example = "johndoe",
        minLength = 3,
        maxLength = 50,
        required = true
    )
    val username: String,

    @field:Schema(
        description = "User's email address",
        example = "user@example.com",
        format = "email",
        required = true
    )
    val email: String,

    @field:Schema(
        description = "User's display name (can be different from username)",
        example = "John Doe",
        maxLength = 100,
        required = false
    )
    val displayName: String?,

    @field:Schema(
        description = "User's biography or description",
        example = "Software developer and open source enthusiast",
        maxLength = 250,
        required = false
    )
    val bio: String?,

    @field:Schema(
        description = "ISO-8601 timestamp when the user joined",
        example = "2023-01-01T12:00:00Z",
        required = true
    )
    val joinDate: String,

    @field:Schema(
        description = "Number of posts made by the user",
        example = "42",
        defaultValue = "0"
    )
    val postCount: Int = 0,

    @field:Schema(
        description = "Number of users following this user",
        example = "100",
        defaultValue = "0"
    )
    val followerCount: Int = 0,

    @field:Schema(
        description = "Number of users this user is following",
        example = "50",
        defaultValue = "0"
    )
    val followingCount: Int = 0
)
