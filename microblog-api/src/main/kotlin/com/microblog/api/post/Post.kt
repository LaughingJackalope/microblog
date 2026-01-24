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
    @field:Size(max = 25000, message = "Post content must not exceed 25000 characters.")
    @Column(length = 25000, nullable = false)
    lateinit var content: String

    @Column(nullable = false)
    lateinit var createdAt: Instant

    @field:NotBlank(message = "Author ID cannot be empty.")
    @Column(nullable = false, length = 50) // To link to User.id
    lateinit var authorId: String

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Post

        return id == other.id
    }

    override fun hashCode(): Int {
        return id.hashCode()
    }

    override fun toString(): String {
        return "Post(id='$id', content='$content', createdAt=$createdAt, authorId='$authorId')"
    }
}
