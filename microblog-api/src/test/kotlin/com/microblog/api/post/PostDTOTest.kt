package com.microblog.api.post

import com.fasterxml.jackson.core.JsonParseException
import com.fasterxml.jackson.databind.JsonMappingException
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.exc.InvalidFormatException
import com.fasterxml.jackson.databind.exc.MismatchedInputException
import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException
import io.quarkus.test.junit.QuarkusTest
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.time.Instant
import java.util.*
import jakarta.inject.Inject
import jakarta.validation.Validator
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Nested
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import org.junit.jupiter.params.provider.NullAndEmptySource
import org.junit.jupiter.params.provider.ValueSource

@QuarkusTest
class PostDTOTest {

    @Inject
    lateinit var validator: Validator

    @Inject
    lateinit var objectMapper: ObjectMapper

    private val testAuthorId = "user_${UUID.randomUUID()}"
    private val testPostId = "post_${UUID.randomUUID()}"
    private val testTimestamp = Instant.now().toString()
    private val testUsername = "testuser"
    private val testDisplayName = "Test User"
    private val testContent = "This is a test post content"

    @Test
    fun `should create valid PostAuthorDTO`() {
        val author = PostAuthorDTO(
            id = testAuthorId,
            username = testUsername,
            displayName = testDisplayName
        )

        assertEquals(testAuthorId, author.id)
        assertEquals(testUsername, author.username)
        assertEquals(testDisplayName, author.displayName)
    }

    @Test
    fun `should create PostAuthorDTO with null displayName`() {
        val author = PostAuthorDTO(
            id = testAuthorId,
            username = testUsername,
            displayName = null
        )

        assertNull(author.displayName, "Display name should be null")
    }

    @Test
    fun `should create valid PostDTO`() {
        val author = createTestAuthor()
        val post = createTestPost(author)

        assertEquals(testPostId, post.id)
        assertEquals(testContent, post.content)
        assertEquals(testTimestamp, post.createdAt)
        assertEquals(author, post.author)
    }

    @Nested
    inner class SerializationTests {
        @Test
        fun `should serialize and deserialize PostDTO`() {
            val author = createTestAuthor()
            val post = createTestPost(author)

            val json = objectMapper.writeValueAsString(post)
            val deserialized = objectMapper.readValue(json, PostDTO::class.java)

            assertEquals(post, deserialized)
        }

        @Test
        fun `should handle missing optional fields in JSON`() {
            // Test with missing displayName (optional field)
            val json = """
                {
                    "id": "$testPostId",
                    "content": "$testContent",
                    "createdAt": "$testTimestamp",
                    "author": {
                        "id": "$testAuthorId",
                        "username": "$testUsername"
                    }
                }
            """.trimIndent()

            val deserialized = objectMapper.readValue(json, PostDTO::class.java)
            assertNull(deserialized.author.displayName, "displayName should be null when not provided in JSON")
        }

        @Test
        fun `should fail on missing required fields in JSON`() {
            // Missing author field (required)
            val json = """
                {
                    "id": "$testPostId",
                    "content": "$testContent",
                    "createdAt": "$testTimestamp"
                }
            """.trimIndent()

            assertThrows<JsonMappingException> {
                objectMapper.readValue(json, PostDTO::class.java)
            }
        }

        @Test
        fun `should ignore unknown properties in JSON`() {
            val json = """
                {
                    "id": "$testPostId",
                    "content": "$testContent",
                    "createdAt": "$testTimestamp",
                    "author": {
                        "id": "$testAuthorId",
                        "username": "$testUsername",
                        "unknownField": "should be ignored"
                    },
                    "extraField": 123
                }
            """.trimIndent()

            // Should not throw
            val deserialized = objectMapper.readValue(json, PostDTO::class.java)
            assertEquals(testPostId, deserialized.id)
            assertEquals(testUsername, deserialized.author.username)
        }

        @Test
        fun `should reject null content in JSON`() {
            val json = """
                {
                    "id": "$testPostId",
                    "content": null,
                    "createdAt": "$testTimestamp",
                    "author": {
                        "id": "$testAuthorId",
                        "username": "$testUsername"
                    }
                }
            """.trimIndent()

            // Should throw because content is a required non-null field
            assertThrows<com.fasterxml.jackson.databind.exc.ValueInstantiationException> {
                objectMapper.readValue(json, PostDTO::class.java)
            }
        }

        @Test
        fun `should reject null author in JSON`() {
            val json = """
                {
                    "id": "$testPostId",
                    "content": "$testContent",
                    "createdAt": "$testTimestamp",
                    "author": null
                }
            """.trimIndent()

            // Should throw because author is a required non-null field
            assertThrows<com.fasterxml.jackson.databind.exc.ValueInstantiationException> {
                objectMapper.readValue(json, PostDTO::class.java)
            }
        }
    }

    @Test
    fun `should serialize and deserialize PostAuthorDTO`() {
        val author = createTestAuthor()
        val json = objectMapper.writeValueAsString(author)
        val deserialized = objectMapper.readValue(json, PostAuthorDTO::class.java)

        assertEquals(author, deserialized)
    }

    @Test
    fun `should validate PostAuthorDTO with empty username`() {
        // This test shows that validation could be added if needed
        // Currently, there are no validation annotations on the DTOs
        val author = PostAuthorDTO(
            id = testAuthorId,
            username = "",  // Empty username - would normally be validated at the entity level
            displayName = testDisplayName
        )

        // If we add @field:NotBlank to username in the DTO, this would fail
        val violations = validator.validate(author)
        assertTrue(violations.isEmpty(), "No validation violations expected for DTO with empty username")
    }

    @Nested
    inner class PostAuthorDTOTests {
        @Test
        fun `should handle equality`() {
            val author1 = createTestAuthor()
            val author2 = createTestAuthor() // Same values as author1
            val author3 = createTestAuthor(displayName = "Different Name")

            // Test equals
            assertEquals(author1, author2, "Authors with same values should be equal")
            assertNotEquals(author1, author3, "Authors with different display names should not be equal")
            
            // Test hashCode
            assertEquals(author1.hashCode(), author2.hashCode(), "Equal authors should have same hash code")
            assertNotEquals(author1.hashCode(), author3.hashCode(), "Different authors should have different hash codes")
        }

        @Test
        fun `should handle equality with null displayName`() {
            val author1 = createTestAuthor(displayName = null)
            val author2 = createTestAuthor(displayName = null)
            val author3 = createTestAuthor(displayName = "Not null")

            assertEquals(author1, author2, "Null displayNames should be considered equal")
            assertNotEquals(author1, author3, "Null and non-null displayNames should not be equal")
            assertEquals(author1.hashCode(), author2.hashCode(), "Equal authors should have same hash code")
        }

        @Test
        fun `should handle whitespace in usernames`() {
            val usernames = listOf(" ", "\t", "\n", "  user  ")
            usernames.forEach { username ->
                val author = createTestAuthor(username = username)
                assertEquals(username, author.username, "Should preserve exact whitespace")
            }
        }

        @Test
        fun `should handle very long display names`() {
            val longName = "x".repeat(1000)
            val author = createTestAuthor(displayName = longName)
            assertEquals(longName, author.displayName, "Should handle long display names")
        }

        @Test
        fun `should handle special characters in fields`() {
            val specialUsername = "user@domain.com"
            val specialDisplayName = "User 😊 你好 こんにちは"
            val specialId = "user#123!@#$%^&*()"
            
            val author = createTestAuthor(
                id = specialId,
                username = specialUsername,
                displayName = specialDisplayName
            )
            
            assertEquals(specialId, author.id)
            assertEquals(specialUsername, author.username)
            assertEquals(specialDisplayName, author.displayName)
        }
    }

    @Nested
    inner class PostDTOTests {
        @Test
        fun `should handle equality`() {
            val author = createTestAuthor()
            val post1 = createTestPost(author)
            val post2 = createTestPost(author) // Same values as post1
            val post3 = createTestPost(author, content = "Different content")
            val post4 = createTestPost(createTestAuthor(username = "different")) // Different author

            // Test equals
            assertEquals(post1, post2, "Posts with same values should be equal")
            assertNotEquals(post1, post3, "Posts with different content should not be equal")
            assertNotEquals(post1, post4, "Posts with different authors should not be equal")
            
            // Test hashCode
            assertEquals(post1.hashCode(), post2.hashCode(), "Equal posts should have same hash code")
            assertNotEquals(post1.hashCode(), post3.hashCode(), "Different posts should have different hash codes")
        }

        @Test
        fun `should handle different authors in equals`() {
            val author1 = createTestAuthor()
            val author2 = createTestAuthor(username = "differentuser")
            val post1 = createTestPost(author1)
            val post2 = createTestPost(author1) // Same author
            val post3 = createTestPost(author2) // Different author

            assertEquals(post1, post2, "Posts with same authors should be equal")
            assertNotEquals(post1, post3, "Posts with different authors should not be equal")
        }

        @Test
        fun `should handle very long content`() {
            val longContent = "x".repeat(1000)
            val post = createTestPost(createTestAuthor(), content = longContent)
            assertEquals(longContent, post.content, "Should handle very long content")
        }

        @Test
        fun `should handle various date formats`() {
            val author = createTestAuthor()
            val formats = listOf(
                "2023-01-01T12:00:00Z",
                "2023-01-01T12:00:00.000Z",
                "2023-01-01T12:00:00+00:00"
            )

            formats.forEach { dateString ->
                val post = createTestPost(author, createdAt = dateString)
                assertEquals(dateString, post.createdAt, "Should preserve date string format: $dateString")
            }
        }

        @Test
        fun `should handle special characters in content`() {
            val specialContent = "Special chars: 😊 你好 こんにちは #@$%^&*()_+{}|:<>?\""
            val post = createTestPost(createTestAuthor(), content = specialContent)
            assertEquals(specialContent, post.content, "Should handle special characters in content")
        }
    }

    private fun createTestAuthor(
        id: String = testAuthorId,
        username: String = testUsername,
        displayName: String? = testDisplayName
    ): PostAuthorDTO {
        return PostAuthorDTO(
            id = id,
            username = username,
            displayName = displayName
        )
    }

    private fun createTestPost(
        author: PostAuthorDTO?,
        id: String = testPostId,
        content: String = testContent,
        createdAt: String = testTimestamp
    ): PostDTO {
        return PostDTO(
            id = id,
            content = content,
            createdAt = createdAt,
            author = author ?: createTestAuthor()
        )
    }
    
    companion object {
        @JvmStatic
        fun stringProvider() = listOf(
            Arguments.of(""),
            Arguments.of(" "),
            Arguments.of("\t"),
            Arguments.of("\n"),
            Arguments.of("x".repeat(1000)),
            Arguments.of("special!@#$%^&*()_+{}|:<>?\"'")
        )
    }
}
