package com.blog.config;

import com.blog.entity.*;
import com.blog.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final ArticleRepository articleRepository;
    private final CommentRepository commentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        // 创建管理员
        User admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .email("admin@blog.com")
                .role("ADMIN")
                .build();
        userRepository.save(admin);

        // 创建分类
        Category tech = categoryRepository.save(Category.builder().name("技术").description("技术文章").build());
        Category life = categoryRepository.save(Category.builder().name("生活").description("生活随笔").build());

        // 创建标签
        Tag java = tagRepository.save(Tag.builder().name("Java").build());
        Tag spring = tagRepository.save(Tag.builder().name("Spring Boot").build());
        Tag nextjs = tagRepository.save(Tag.builder().name("Next.js").build());
        Tag react = tagRepository.save(Tag.builder().name("React").build());

        // 创建示例文章
        Article article1 = Article.builder()
                .title("Spring Boot 3 入门指南")
                .slug("spring-boot-3-guide")
                .summary("本文介绍 Spring Boot 3 的核心特性和快速入门方法。")
                .content("""
# Spring Boot 3 入门指南

## 简介

Spring Boot 3 是基于 Spring Framework 6 的全新版本，需要 **Java 17** 以上版本。

## 核心特性

- 原生镜像支持
- 可观察性改进
- Jakarta EE 9 迁移
- 虚拟线程支持

## 快速开始

### 1. 创建项目

使用 Spring Initializr 创建项目，选择以下依赖：

- Spring Web
- Spring Data JPA
- Spring Security
- MySQL Driver

### 2. 编写控制器

```java
@RestController
public class HelloController {
    @GetMapping("/hello")
    public String hello() {
        return "Hello, Spring Boot 3!";
    }
}
```

### 3. 启动应用

```bash
mvn spring-boot:run
```

访问 `http://localhost:8080/hello` 即可看到结果。

## 总结

Spring Boot 3 带来了许多激动人心的新特性，是现代 Java 开发的首选框架。
""")
                .author(admin)
                .category(tech)
                .tags(Set.of(java, spring))
                .status("PUBLISHED")
                .build();
        articleRepository.save(article1);

        Article article2 = Article.builder()
                .title("Next.js 14 App Router 实战")
                .slug("nextjs-14-app-router")
                .summary("探索 Next.js 14 的 App Router，学习如何构建现代化前端应用。")
                .content("""
# Next.js 14 App Router 实战

## 什么是 App Router？

Next.js 14 的 App Router 是一种全新的路由系统，基于 React Server Components。

## 核心概念

### 1. 文件约定

```
app/
├── layout.tsx    # 布局
├── page.tsx      # 页面
├── loading.tsx   # 加载状态
└── error.tsx     # 错误处理
```

### 2. 服务端组件

默认情况下，App Router 中的所有组件都是服务端组件：

```tsx
// 这是服务端组件，可以直接访问数据库
export default async function Page() {
  const posts = await db.query('SELECT * FROM posts');
  return <PostList posts={posts} />;
}
```

### 3. 客户端组件

需要使用交互功能时，添加 `'use client'` 指令：

```tsx
'use client';
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

## 总结

Next.js 14 的 App Router 为 React 应用开发带来了全新的范式。
""")
                .author(admin)
                .category(tech)
                .tags(Set.of(nextjs, react))
                .status("PUBLISHED")
                .build();
        articleRepository.save(article2);

        Article article3 = Article.builder()
                .title("我的 2024 年度总结")
                .slug("2024-year-review")
                .summary("回顾 2024 年的成长与收获。")
                .content("""
# 我的 2024 年度总结

## 技术成长

2024 年是技术飞速成长的一年。深入学习了 **Spring Boot** 和 **Next.js** 全栈开发。

## 生活感悟

平衡工作与生活，保持学习的热忱。

## 展望 2025

继续深耕全栈开发，探索 AI 领域。
""")
                .author(admin)
                .category(life)
                .status("PUBLISHED")
                .build();
        articleRepository.save(article3);

        // 创建示例评论
        commentRepository.save(Comment.builder()
                .content("写得很棒，学到了很多！")
                .article(article1)
                .author(admin)
                .build());
    }
}
