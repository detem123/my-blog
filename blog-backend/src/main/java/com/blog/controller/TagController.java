package com.blog.controller;

import com.blog.dto.ApiResponse;
import com.blog.entity.Tag;
import com.blog.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagRepository tagRepository;

    @GetMapping
    public ApiResponse<List<Tag>> getAll() {
        return ApiResponse.ok(tagRepository.findAll());
    }

    @PostMapping
    public ApiResponse<Tag> create(@RequestBody Tag tag) {
        return ApiResponse.ok("创建成功", tagRepository.save(tag));
    }
}
