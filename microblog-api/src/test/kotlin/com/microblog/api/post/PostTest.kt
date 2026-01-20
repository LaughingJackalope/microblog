package com.microblog.api.post

import io.quarkus.test.junit.QuarkusTest
import jakarta.inject.Inject
import jakarta.validation.ConstraintViolation
import jakarta.validation.Validator
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.Instant
import java.util.*

@QuarkusTest
class PostTest {

    @Inject
    lateinit var validator: Validator

    private lateinit var validPost: Post
    private val testAuthorId = "user_${UUID.randomUUID()}"
    private val testContent = "This is a test post content"
    private val testTimestamp = Instant.now()

    @BeforeEach
    fun setUp() {
        validPost = Post().apply {
            id = "post_${UUID.randomUUID()}"
            content = testContent
            authorId = testAuthorId
            createdAt = testTimestamp
        }
    }

    @Test
    fun `should create valid post`() {
        val violations = validator.validate(validPost)
        assertTrue(violations.isEmpty(), "Expected no validation errors but found: $violations")
    }

    @Test
    fun `should validate content not blank`() {
        validPost.content = ""
        
        val violations = validator.validate(validPost)
        assertFalse(violations.isEmpty(), "Expected validation errors for blank content")
        assertTrue(violations.any { it.propertyPath.toString() == "content" },
            "Expected violation for 'content' field")
    }

    @Test
    fun `should validate content max length`() {
        // Create a string that's 281 characters long
        validPost.content = "x".repeat(281)
        
        val violations = validator.validate(validPost)
        assertFalse(violations.isEmpty(), "Expected validation errors for content exceeding max length")
        assertTrue(violations.any { it.message == "Post content must not exceed 280 characters." },
            "Expected violation for content length")
    }

    @Test
    fun `should validate authorId not blank`() {
        validPost.authorId = ""
        
        val violations = validator.validate(validPost)
        assertFalse(violations.isEmpty(), "Expected validation errors for blank authorId")
        assertTrue(violations.any { it.propertyPath.toString() == "authorId" },
            "Expected violation for 'authorId' field")
    }

    @Test
    fun `should have consistent string representation`() {
        val postString = validPost.toString()
        assertTrue(postString.startsWith("Post("), "String representation should start with 'Post('")        
        assertTrue(postString.contains("id='${validPost.id}'"), "String representation should contain id")
        assertTrue(postString.contains("content='$testContent'"), "String representation should contain content")
        assertTrue(postString.contains("authorId='$testAuthorId'"), "String representation should contain authorId")
        assertTrue(postString.endsWith(")"), "String representation should end with ')'")
    }

    @Test
    fun `should handle equals and hashCode`() {
        val samePost = Post().apply {
            id = validPost.id
            content = validPost.content
            authorId = validPost.authorId
            createdAt = validPost.createdAt
        }
        
        val differentPost = Post().apply {
            id = "post_${UUID.randomUUID()}"
            content = "Different content"
            authorId = "user_${UUID.randomUUID()}"
            createdAt = Instant.now()
        }
        
        // Test equals
        assertEquals(validPost, samePost, "Posts with same ID should be equal")
        assertNotEquals(validPost, differentPost, "Posts with different IDs should not be equal")
        
        // Test hashCode
        assertEquals(validPost.hashCode(), samePost.hashCode(), "Equal posts should have same hash code")
        assertNotEquals(validPost.hashCode(), differentPost.hashCode(), "Different posts should have different hash codes")
    }

    @Test
    fun `should handle null values in equals`() {
        assertFalse(validPost.equals(null), "Equals should return false for null")
        assertFalse(validPost.equals("Not a Post"), "Equals should return false for different type")
    }
}
