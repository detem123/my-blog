package com.blog.controller;

import com.blog.dto.ApiResponse;
import com.blog.dto.ArticleDTO;
import com.blog.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    @GetMapping("/articles")
    public ApiResponse<Page<ArticleDTO>> getArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long tagId) {
        return ApiResponse.ok(articleService.getArticles(page, size, keyword, categoryId, tagId));
    }

    @GetMapping("/articles/{slugOrId}")
    public ApiResponse<ArticleDTO> getArticle(@PathVariable String slugOrId) {
        try {
            Long id = Long.parseLong(slugOrId);
            return ApiResponse.ok(articleService.getArticleById(id));
        } catch (NumberFormatException e) {
            return ApiResponse.ok(articleService.getArticleBySlug(slugOrId));
        }
    }

    @PostMapping("/admin/articles")
    public ApiResponse<ArticleDTO> createArticle(@RequestBody ArticleDTO dto,
                                                  Authentication auth) {
        return ApiResponse.ok("创建成功", articleService.createArticle(dto, auth.getName()));
    }

    @PutMapping("/admin/articles/{id}")
    public ApiResponse<ArticleDTO> updateArticle(@PathVariable Long id,
                                                  @RequestBody ArticleDTO dto,
                                                  Authentication auth) {
        return ApiResponse.ok("更新成功", articleService.updateArticle(id, dto, auth.getName()));
    }

    @DeleteMapping("/admin/articles/{id}")
    public ApiResponse<?> deleteArticle(@PathVariable Long id, Authentication auth) {
        articleService.deleteArticle(id, auth.getName());
        return ApiResponse.ok("删除成功", null);
    }

    @GetMapping("/admin/articles")
    public ApiResponse<Page<ArticleDTO>> getMyArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        return ApiResponse.ok(articleService.getMyArticles(page, size, auth.getName()));
    }
}
