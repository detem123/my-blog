package com.blog.repository;

import com.blog.entity.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ArticleRepository extends JpaRepository<Article, Long> {
    Optional<Article> findBySlug(String slug);

    Page<Article> findByStatus(String status, Pageable pageable);

    Page<Article> findByCategoryIdAndStatus(Long categoryId, String status, Pageable pageable);

    @Query("SELECT a FROM Article a JOIN a.tags t WHERE t.id = :tagId AND a.status = :status")
    Page<Article> findByTagIdAndStatus(@Param("tagId") Long tagId, @Param("status") String status, Pageable pageable);

    @Query("SELECT a FROM Article a WHERE " +
           "(:keyword IS NULL OR a.title LIKE %:keyword% OR a.summary LIKE %:keyword%) " +
           "AND a.status = :status")
    Page<Article> search(@Param("keyword") String keyword, @Param("status") String status, Pageable pageable);

    Page<Article> findByAuthorId(Long authorId, Pageable pageable);
}
