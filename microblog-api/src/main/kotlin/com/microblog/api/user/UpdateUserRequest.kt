package com.microblog.api.user

import org.eclipse.microprofile.openapi.annotations.media.Schema
import jakarta.validation.constraints.Size

/**
 * Request DTO for updating user profile information.
 */
@Schema(description = "Request payload for updating user profile")
data class UpdateUserRequest(
    @field:Size(max = 100, message = "Display name cannot exceed 100 characters")
    @field:Schema(
        description = "New display name for the user",
        example = "John Doe",
        maxLength = 100,
        required = false
    )
    val displayName: String? = null,

    @field:Size(max = 250, message = "Bio cannot exceed 250 characters")
    @field:Schema(
        description = "New biography for the user",
        example = "Software developer and open source enthusiast",
        maxLength = 250,
        required = false
    )
    val bio: String? = null
)
