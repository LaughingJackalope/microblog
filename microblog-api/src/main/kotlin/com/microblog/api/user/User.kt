package com.microblog.api.user

import io.quarkus.hibernate.orm.panache.kotlin.PanacheCompanionBase
import io.quarkus.hibernate.orm.panache.kotlin.PanacheEntityBase
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

@Entity
@Table(name = "users") // "user" is often a reserved keyword in SQL
class User : PanacheEntityBase {
    companion object : PanacheCompanionBase<User, String> // Use PanacheCompanionBase for custom ID types

    @Id
    @Column(length = 50) // e.g., "user_" + UUID
    lateinit var id: String

    @Column(unique = true, nullable = false, length = 50)
    lateinit var username: String
    
    @Column(unique = true, nullable = false, length = 255)
    lateinit var email: String

    @Column(length = 100)
    var displayName: String? = null

    @Column(length = 250)
    var bio: String? = null

    @Column(nullable = false)
    lateinit var joinDate: Instant

    @Column(nullable = false)
    var postCount: Int = 0

    @Column(nullable = false)
    var followerCount: Int = 0

    @Column(nullable = false)
    var followingCount: Int = 0

    // Password hash will be stored here in a real app, not plain text
    // For now, we are not storing the password from RegisterUserRequest directly in the entity
    // as it's not part of UserDTO and should be handled separately (e.g., auth service)
}

// Helper function to map User entity to UserDTO
fun User.toDTO(): UserDTO {
    return UserDTO(
        id = this.id,
        username = this.username,
        email = this.email,
        displayName = this.displayName,
        bio = this.bio,
        joinDate = this.joinDate.toString(),
        postCount = this.postCount,
        followerCount = this.followerCount,
        followingCount = this.followingCount
    )
}

// Helper function to map RegisterUserRequest to User entity
// This would typically also handle password hashing before persistence
fun RegisterUserRequest.toEntity(id: String, joinDate: Instant): User {
    return User().apply {
        this.id = id
        this.username = this@toEntity.username
        this.email = this@toEntity.email
        this.displayName = this@toEntity.displayName ?: this@toEntity.username
        this.bio = this@toEntity.bio
        this.joinDate = joinDate
        // postCount, followerCount, followingCount default to 0 in the entity
    }
}
