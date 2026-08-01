package com.blog.service;

import com.blog.dto.ArticleDTO;
import com.blog.entity.Article;
import com.blog.entity.Category;
import com.blog.entity.Tag;
import com.blog.entity.User;
import com.blog.repository.ArticleRepository;
import com.blog.repository.CategoryRepository;
import com.blog.repository.TagRepository;
import com.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;

    public Page<ArticleDTO> getArticles(int page, int size, String keyword,
                                         Long categoryId, Long tagId) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Article> articles;

        if (keyword != null && !keyword.isBlank()) {
            articles = articleRepository.search(keyword, "PUBLISHED", pageRequest);
        } else if (categoryId != null) {
            articles = articleRepository.findByCategoryIdAndStatus(categoryId, "PUBLISHED", pageRequest);
        } else if (tagId != null) {
            articles = articleRepository.findByTagIdAndStatus(tagId, "PUBLISHED", pageRequest);
        } else {
            articles = articleRepository.findByStatus("PUBLISHED", pageRequest);
        }

        return articles.map(this::toDTO);
    }

    public ArticleDTO getArticleBySlug(String slug) {
        Article article = articleRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("文章不存在"));
        return toDTO(article);
    }

    public ArticleDTO getArticleById(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("文章不存在"));
        return toDTO(article);
    }

    @Transactional
    public ArticleDTO createArticle(ArticleDTO dto, String username) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        Article article = new Article();
        article.setTitle(dto.getTitle());
        article.setSlug(generateSlug(dto.getTitle()));
        article.setContent(dto.getContent());
        article.setSummary(dto.getSummary());
        article.setCoverImage(dto.getCoverImage());
        article.setAuthor(author);
        article.setStatus(dto.getStatus() != null ? dto.getStatus() : "DRAFT");

        if (dto.getCategoryName() != null) {
            Category category = categoryRepository.findByName(dto.getCategoryName())
                    .orElseGet(() -> categoryRepository.save(Category.builder().name(dto.getCategoryName()).build()));
            article.setCategory(category);
        }

        if (dto.getTags() != null && !dto.getTags().isEmpty()) {
            Set<Tag> tags = new HashSet<>();
            for (String tagName : dto.getTags()) {
                Tag tag = tagRepository.findByName(tagName)
                        .orElseGet(() -> tagRepository.save(Tag.builder().name(tagName).build()));
                tags.add(tag);
            }
            article.setTags(tags);
        }

        articleRepository.save(article);
        return toDTO(article);
    }

    @Transactional
    public ArticleDTO updateArticle(Long id, ArticleDTO dto, String username) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("文章不存在"));

        if (!article.getAuthor().getUsername().equals(username)) {
            throw new RuntimeException("无权修改此文章");
        }

        if (dto.getTitle() != null) {
            article.setTitle(dto.getTitle());
            article.setSlug(generateSlug(dto.getTitle()));
        }
        if (dto.getContent() != null) article.setContent(dto.getContent());
        if (dto.getSummary() != null) article.setSummary(dto.getSummary());
        if (dto.getCoverImage() != null) article.setCoverImage(dto.getCoverImage());
        if (dto.getStatus() != null) article.setStatus(dto.getStatus());

        if (dto.getCategoryName() != null) {
            Category category = categoryRepository.findByName(dto.getCategoryName())
                    .orElseGet(() -> categoryRepository.save(Category.builder().name(dto.getCategoryName()).build()));
            article.setCategory(category);
        }

        if (dto.getTags() != null) {
            Set<Tag> tags = new HashSet<>();
            for (String tagName : dto.getTags()) {
                Tag tag = tagRepository.findByName(tagName)
                        .orElseGet(() -> tagRepository.save(Tag.builder().name(tagName).build()));
                tags.add(tag);
            }
            article.setTags(tags);
        }

        articleRepository.save(article);
        return toDTO(article);
    }

    @Transactional
    public void deleteArticle(Long id, String username) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("文章不存在"));

        if (!article.getAuthor().getUsername().equals(username)) {
            throw new RuntimeException("无权删除此文章");
        }

        articleRepository.delete(article);
    }

    public Page<ArticleDTO> getMyArticles(int page, int size, String username) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return articleRepository.findByAuthorId(author.getId(), pageRequest).map(this::toDTO);
    }

    private String generateSlug(String title) {
        String slug = title.toLowerCase()
                .replaceAll("[^a-z0-9\\u4e00-\\u9fa5]+", "-")
                .replaceAll("^-|-$", "");
        return slug + "-" + System.currentTimeMillis();
    }

    private ArticleDTO toDTO(Article article) {
        ArticleDTO dto = new ArticleDTO();
        dto.setId(article.getId());
        dto.setTitle(article.getTitle());
        dto.setSlug(article.getSlug());
        dto.setContent(article.getContent());
        dto.setSummary(article.getSummary());
        dto.setCoverImage(article.getCoverImage());
        dto.setAuthorName(article.getAuthor().getUsername());
        dto.setCategoryName(article.getCategory() != null ? article.getCategory().getName() : null);
        dto.setTags(article.getTags().stream().map(Tag::getName).collect(Collectors.toSet()));
        dto.setStatus(article.getStatus());
        dto.setCreatedAt(article.getCreatedAt());
        dto.setUpdatedAt(article.getUpdatedAt());
        return dto;
    }
}
