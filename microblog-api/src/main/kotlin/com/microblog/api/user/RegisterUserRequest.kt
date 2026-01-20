package com.microblog.api.user

import org.eclipse.microprofile.openapi.annotations.media.Schema
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

/**
 * Request DTO for user registration
 */
@Schema(description = "Request payload for registering a new user")
data class RegisterUserRequest(
    @field:NotBlank(message = "Username cannot be empty.")
    @field:Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters.")
    @field:Pattern(regexp = "^[a-zA-Z0-9_-]+$", message = "Username can only contain letters, numbers, underscores, and hyphens")
    @field:Schema(
        description = "Unique username for the account",
        example = "johndoe123",
        minLength = 3,
        maxLength = 50
    )
    val username: String,

    @field:NotBlank(message = "Email cannot be empty.")
    @field:Email(message = "Please provide a valid email address.")
    @field:Size(max = 255, message = "Email cannot exceed 255 characters.")
    @field:Schema(
        description = "User's email address",
        example = "user@example.com",
        required = true
    )
    val email: String,

    @field:NotBlank(message = "Password cannot be empty.")
    @field:Size(min = 8, message = "Password must be at least 8 characters long.")
    @field:Schema(
        description = "Account password (will be hashed before storage)",
        example = "SecurePass123!",
        minLength = 8,
        required = true
    )
    val password: String,

    @field:Size(max = 100, message = "Display name cannot exceed 100 characters.")
    @field:Schema(
        description = "Optional display name (defaults to username if not provided)",
        example = "John Doe",
        maxLength = 100,
        required = false
    )
    val displayName: String? = null,

    @field:Size(max = 250, message = "Bio cannot exceed 250 characters.")
    @field:Schema(
        description = "Optional user biography",
        example = "Software developer and open source enthusiast",
        maxLength = 250,
        required = false
    )
    val bio: String? = null
)
