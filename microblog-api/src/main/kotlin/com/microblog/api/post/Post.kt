package com.microblog.api.post

import io.quarkus.hibernate.orm.panache.kotlin.PanacheCompanionBase
import io.quarkus.hibernate.orm.panache.kotlin.PanacheEntityBase
import jakarta.persistence.*
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant

@Entity
@Table(name = "posts")
class Post : PanacheEntityBase {
    companion object : PanacheCompanionBase<Post, String>

    @Id
    @Column(length = 50) // e.g., "post_" + UUID
    lateinit var id: String

    @field:NotBlank(message = "Content cannot be empty.")
    @field:Size(max = 280, message = "Post content must not exceed 280 characters.")
    @Column(length = 280, nullable = false)
    lateinit var content: String

    @Column(nullable = false)
    lateinit var createdAt: Instant

    @Column(nullable = false, length = 50) // To link to User.id
    lateinit var authorId: String
}
