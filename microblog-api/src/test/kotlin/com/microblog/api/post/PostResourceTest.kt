package com.microblog.api.post

import com.microblog.api.user.RegisterUserRequest
import com.microblog.api.user.User
import com.microblog.api.user.UserDTO
import io.quarkus.test.junit.QuarkusTest
import io.restassured.RestAssured.given
import io.restassured.http.ContentType
import jakarta.transaction.Transactional
import org.hamcrest.CoreMatchers.*
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

@QuarkusTest
class PostResourceTest {

    var testUser: UserDTO? = null

    // Helper to create a user before tests that need an author
    @BeforeEach
    @Transactional // Ensure this setup runs in a transaction and can be rolled back or committed
    fun setup() {
        // Clean up any existing users/posts to ensure test isolation if needed,
        // though @QuarkusTest usually handles this per test class or method depending on config.
        // For simplicity, we'll assume a clean state or rely on transactional rollback.

        // Delete all posts and users to ensure a clean slate for post counts
        // Note: In a real app with foreign keys, delete posts before users.
        given()
            .get("/v1/posts/user/someNonExistentUser") // Dummy call to list, then iterate and delete if any found
            .then()
            .statusCode(anyOf(equalTo(200), equalTo(404))) // Allow 404 if user not found, 200 if found but no posts
            .extract().`as`(Array<PostDTO>::class.java).forEach { post ->
                given().delete("/v1/posts/${post.id}").then().statusCode(anyOf(equalTo(204), equalTo(404)))
            }

        // A more robust cleanup would be direct DB manipulation or a dedicated cleanup endpoint if available
        // User.deleteAll() // This would be ideal if User entity is accessible and configured for test transactions
        // For now, we'll register a new unique user for each test setup if 'testUser' is null,
        // or re-fetch if already created to ensure its state is current.

        val username = "testuser_post_${System.currentTimeMillis()}"
        val userRequest = RegisterUserRequest(
            username = username,
            password = "password123", // Password not used by PostResource but required by RegisterUserRequest
            displayName = "Test User for Posts",
            bio = "Testing posts"
        )

        val createdUser = given()
            .contentType(ContentType.JSON)
            .body(userRequest)
            .post("/v1/users")
            .then()
            .statusCode(201)
            .extract().`as`(UserDTO::class.java)

        assertNotNull(createdUser.id)
        this.testUser = createdUser
    }

    @Test
    @Transactional
    fun `test create post, get post, get posts by user, and delete post`() {
        assertNotNull(testUser, "Test user should be initialized")
        val currentTestUser = testUser!!

        // 1. Create Post
        val postContent = "My first test post! Time: ${System.currentTimeMillis()}"
        val createPostRequest = CreatePostRequest(content = postContent, authorId = currentTestUser.id)

        val createdPost = given()
            .contentType(ContentType.JSON)
            .body(createPostRequest)
            .post("/v1/posts")
            .then()
            .statusCode(201)
            .body("content", equalTo(postContent))
            .body("author.id", equalTo(currentTestUser.id))
            .body("author.username", equalTo(currentTestUser.username))
            .extract().`as`(PostDTO::class.java)

        assertNotNull(createdPost.id)

        // Verify user's postCount increased
        val updatedUser = given()
            .get("/v1/users/${currentTestUser.id}")
            .then()
            .statusCode(200)
            .extract().`as`(UserDTO::class.java)
        assertEquals(currentTestUser.postCount + 1, updatedUser.postCount, "Post count should increment after creating a post.")


        // 2. Get Created Post by ID
        given()
            .get("/v1/posts/${createdPost.id}")
            .then()
            .statusCode(200)
            .body("id", equalTo(createdPost.id))
            .body("content", equalTo(postContent))
            .body("author.id", equalTo(currentTestUser.id))

        // 3. Get Posts by User
        given()
            .get("/v1/posts/user/${currentTestUser.id}")
            .then()
            .statusCode(200)
            .body("size()", equalTo(updatedUser.postCount)) // Should match the updated post count
            .body("[0].id", equalTo(createdPost.id)) // Assuming latest post is first (default order might vary)
            .body("[0].content", equalTo(postContent))

        // Create another post to test pagination and count
        val anotherPostContent = "Another post for pagination ${System.currentTimeMillis()}"
        val anotherCreatePostRequest = CreatePostRequest(content = anotherPostContent, authorId = currentTestUser.id)
        val anotherCreatedPost = given()
            .contentType(ContentType.JSON)
            .body(anotherCreatePostRequest)
            .post("/v1/posts")
            .then()
            .statusCode(201)
            .extract().`as`(PostDTO::class.java)

        val userAfterSecondPost = User.findById(currentTestUser.id)!!.toDTO() // Re-fetch user to get latest postCount
        assertEquals(currentTestUser.postCount + 2, userAfterSecondPost.postCount, "Post count should be 2 after second post.")


        given()
            .get("/v1/posts/user/${currentTestUser.id}?limit=1&offset=0")
            .then()
            .statusCode(200)
            .body("size()", equalTo(1))
            // Order is by createdAt descending, new post should be first if not specified
            // Panache default order is not guaranteed without .orderBy() in query
            // For now, check if one of them is returned

        given()
            .get("/v1/posts/user/${currentTestUser.id}?limit=1&offset=1")
            .then()
            .statusCode(200)
            .body("size()", equalTo(1))


        // 4. Delete Post
        given()
            .delete("/v1/posts/${createdPost.id}")
            .then()
            .statusCode(204)

        // Verify user's postCount decreased
        val userAfterDelete = User.findById(currentTestUser.id)!!.toDTO()
        assertEquals(userAfterSecondPost.postCount -1, userAfterDelete.postCount, "Post count should decrement after deleting a post.")


        // Try to get deleted post - should be 404
        given()
            .get("/v1/posts/${createdPost.id}")
            .then()
            .statusCode(404)

        // Delete the other post
         given()
            .delete("/v1/posts/${anotherCreatedPost.id}")
            .then()
            .statusCode(204)

        val userAfterAllDeletes = User.findById(currentTestUser.id)!!.toDTO()
        assertEquals(0, userAfterAllDeletes.postCount, "Post count should be 0 after all posts are deleted.")

    }

    @Test
    fun `test create post for non-existent user`() {
        val postContent = "Post for non-existent user"
        val createPostRequest = CreatePostRequest(content = postContent, authorId = "user_nonexistent_${System.currentTimeMillis()}")

        given()
            .contentType(ContentType.JSON)
            .body(createPostRequest)
            .post("/v1/posts")
            .then()
            .statusCode(404) // Author not found
            .body("error", containsString("Author (User) not found"))
    }

    @Test
    fun `test get non-existent post`() {
        given()
            .get("/v1/posts/post_nonexistent_${System.currentTimeMillis()}")
            .then()
            .statusCode(404)
    }

    @Test
    fun `test get posts for non-existent user`() {
        given()
            .get("/v1/posts/user/user_nonexistent_${System.currentTimeMillis()}")
            .then()
            .statusCode(404) // User not found
            .body("error", containsString("User not found"))
    }

    @Test
    fun `test delete non-existent post`() {
        given()
            .delete("/v1/posts/post_nonexistent_${System.currentTimeMillis()}")
            .then()
            .statusCode(404)
    }

    // Helper to convert User entity to UserDTO for tests, assuming User entity is accessible.
    // If User entity is not directly accessible in test scope due to module restrictions,
    // then rely on fetching UserDTO via API calls.
    private fun User.toDTO(): UserDTO {
        return UserDTO(
            id = this.id,
            username = this.username,
            displayName = this.displayName,
            bio = this.bio,
            joinDate = this.joinDate.toString(), // Ensure joinDate is not null
            postCount = this.postCount,
            followerCount = this.followerCount,
            followingCount = this.followingCount
        )
    }
}
