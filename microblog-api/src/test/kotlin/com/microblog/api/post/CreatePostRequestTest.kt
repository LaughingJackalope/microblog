package com.microblog.api.post

import io.quarkus.test.junit.QuarkusTest
import jakarta.inject.Inject
import jakarta.validation.ConstraintViolation
import jakarta.validation.Validator
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

@QuarkusTest
class CreatePostRequestTest {
    
    @Inject
    lateinit var validator: Validator
    
    @Test
    fun `should create valid request`() {
        val request = CreatePostRequest(
            content = "Test content",
            authorId = "user123"
        )
        
        val violations = validator.validate(request)
        assertTrue(violations.isEmpty(), "Expected no validation errors but found: $violations")
    }
    
    @Test
    fun `should validate content not blank`() {
        val request = CreatePostRequest(
            content = "", // Invalid: blank content
            authorId = "user123"
        )
        
        val violations = validator.validate(request)
        assertFalse(violations.isEmpty(), "Expected validation errors for blank content")
        assertTrue(hasViolationForField(violations, "content"), "Expected violation for 'content' field")
    }
    
    @Test
    fun `should validate authorId not blank`() {
        val request = CreatePostRequest(
            content = "Valid content",
            authorId = "" // Invalid: blank authorId
        )
        
        val violations = validator.validate(request)
        assertFalse(violations.isEmpty(), "Expected validation errors for blank authorId")
        assertTrue(hasViolationForField(violations, "authorId"), "Expected violation for 'authorId' field")
    }
    
    private fun hasViolationForField(violations: Set<ConstraintViolation<*>>, fieldName: String): Boolean {
        return violations.any { it.propertyPath.toString() == fieldName }
    }
}
