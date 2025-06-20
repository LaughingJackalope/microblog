package com.microblog.api.auth

data class TokenRequest(
    val username: String?,
    val password: String?
)
