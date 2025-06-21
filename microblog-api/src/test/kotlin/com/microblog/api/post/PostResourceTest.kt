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

    @BeforeEach
    @Transactional
    fun setup() {
        // Clean up database before each test for isolation
        Post.deleteAll()
        User.deleteAll()

        val username = "testuser_post_${System.currentTimeMillis()}"
        val userRequest = RegisterUserRequest(
            username = username,
            password = "password123",
            displayName = "Test User for Posts",
            bio = "Testing posts"
        )

        // More robust user creation for setup
        val response = given()
            .contentType(ContentType.JSON)
            .body(userRequest)
            .post("/v1/users")
            .then()
            .extract()

        if (response.statusCode() != 201) {
            throw RuntimeException("Failed to create user in test setup. Status: ${response.statusCode()}. Raw response: ${response.asStringDontClenseBody()}")
        }

        val createdUser = response.body().`as`(UserDTO::class.java)

        assertNotNull(createdUser?.id, "Created user ID should not be null in setup")
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

        val userAfterPostCreation = User.findById(currentTestUser.id)!!
        assertEquals(1, userAfterPostCreation.postCount, "Post count should be 1 after creating a post.")


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
            .body("size()", equalTo(1))
            .body("[0].id", equalTo(createdPost.id))
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

        val userAfterSecondPost = User.findById(currentTestUser.id)!!
        assertEquals(2, userAfterSecondPost.postCount, "Post count should be 2 after second post.")


        given()
            .get("/v1/posts/user/${currentTestUser.id}?limit=1&offset=0")
            .then()
            .statusCode(200)
            .body("size()", equalTo(1))

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

        val userAfterDelete = User.findById(currentTestUser.id)!!
        assertEquals(1, userAfterDelete.postCount, "Post count should decrement after deleting a post.")


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

        val userAfterAllDeletes = User.findById(currentTestUser.id)!!
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
            .statusCode(404)
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
            .statusCode(404)
            .body("error", containsString("User not found"))
    }

    @Test
    fun `test delete non-existent post`() {
        given()
            .delete("/v1/posts/post_nonexistent_${System.currentTimeMillis()}")
            .then()
            .statusCode(404)
    }

    // Removed User.toDTO() as it's not strictly needed if User entity isn't directly used for assertions after this point.
    // API calls should return DTOs.
}
