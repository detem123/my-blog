package com.blog.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class ArticleDTO {
    private Long id;
    private String title;
    private String slug;
    private String summary;
    private String content;
    private String coverImage;
    private String authorName;
    private String categoryName;
    private Set<String> tags;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
