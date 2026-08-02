package com.blog.controller;

import com.blog.dto.ApiResponse;
import com.blog.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/articles/{articleId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public ApiResponse<?> getComments(@PathVariable Long articleId) {
        return ApiResponse.ok(commentService.getComments(articleId));
    }

    @PostMapping
    public ApiResponse<?> addComment(@PathVariable Long articleId,
                                      @RequestBody Map<String, Object> body,
                                      Authentication auth) {
        if (auth == null) {
            return ApiResponse.error(401, "请先登录后再评论");
        }
        String content = (String) body.get("content");
        Long parentId = body.get("parentId") != null
                ? ((Number) body.get("parentId")).longValue()
                : null;
        return ApiResponse.ok("评论成功", commentService.addComment(articleId, content, parentId, auth.getName()));
    }
}
