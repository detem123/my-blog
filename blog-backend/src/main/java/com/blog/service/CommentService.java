package com.blog.service;

import com.blog.entity.Article;
import com.blog.entity.Comment;
import com.blog.entity.User;
import com.blog.repository.ArticleRepository;
import com.blog.repository.CommentRepository;
import com.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    @Transactional
    public Map<String, Object> addComment(Long articleId, String content, Long parentId, String username) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("文章不存在"));
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        Comment comment = Comment.builder()
                .content(content)
                .article(article)
                .author(author)
                .build();

        if (parentId != null) {
            Comment parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("父评论不存在"));
            comment.setParent(parent);
        }

        commentRepository.save(comment);

        Map<String, Object> result = new HashMap<>();
        result.put("id", comment.getId());
        result.put("content", comment.getContent());
        result.put("authorName", comment.getAuthor().getUsername());
        result.put("createdAt", comment.getCreatedAt());
        result.put("parentId", parentId);
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getComments(Long articleId) {
        List<Comment> comments = commentRepository.findByArticleIdOrderByCreatedAtDesc(articleId);
        return comments.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("content", c.getContent());
            map.put("authorName", c.getAuthor().getUsername());
            map.put("authorAvatar", c.getAuthor().getAvatar());
            map.put("createdAt", c.getCreatedAt());
            map.put("parentId", c.getParent() != null ? c.getParent().getId() : null);
            return map;
        }).toList();
    }
}
