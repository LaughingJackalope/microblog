package com.microblog.api.user

// Based on the User Object in apiarch.md
data class UserDTO(
    val id: String,
    val username: String,
    val displayName: String?,
    val bio: String?,
    val joinDate: String, // Using String for now, will refine to date/time type later
    val postCount: Int = 0,
    val followerCount: Int = 0,
    val followingCount: Int = 0
)
