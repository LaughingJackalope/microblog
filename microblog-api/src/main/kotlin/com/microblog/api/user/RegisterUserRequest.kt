package com.microblog.api.user

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

// Request DTO for user registration
data class RegisterUserRequest(
    @field:NotBlank(message = "Username cannot be empty.")
    @field:Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters.")
    val username: String,

    @field:NotBlank(message = "Password cannot be empty.")
    @field:Size(min = 8, message = "Password must be at least 8 characters long.")
    val password: String, // Password will be handled securely later

    @field:Size(max = 100, message = "Display name cannot exceed 100 characters.")
    val displayName: String?,

    @field:Size(max = 250, message = "Bio cannot exceed 250 characters.")
    val bio: String?
)
