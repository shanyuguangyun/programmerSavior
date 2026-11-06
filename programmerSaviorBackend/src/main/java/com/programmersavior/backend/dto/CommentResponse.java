package com.programmersavior.backend.dto;

import com.programmersavior.backend.entity.PsComment;

import java.time.LocalDateTime;

/**
 * 返回给前端的评论结构。
 *
 * <p>前端使用 parentId 自行组装嵌套树，不暴露 ipHash。</p>
 */
public class CommentResponse {

    private Long id;
    private Long postId;
    private Long parentId;
    private String content;
    private String authorName;
    private boolean admin;
    private LocalDateTime createdAt;

    public static CommentResponse from(PsComment comment) {
        CommentResponse response = new CommentResponse();
        response.id = comment.getId();
        response.postId = comment.getPostId();
        response.parentId = comment.getParentId();
        response.content = comment.getContent();
        response.authorName = comment.getAuthorName();
        response.admin = Boolean.TRUE.equals(comment.getAuthorIsAdmin());
        response.createdAt = comment.getCreatedAt();
        return response;
    }

    public Long getId() {
        return id;
    }

    public Long getPostId() {
        return postId;
    }

    public Long getParentId() {
        return parentId;
    }

    public String getContent() {
        return content;
    }

    public String getAuthorName() {
        return authorName;
    }

    public boolean isAdmin() {
        return admin;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
