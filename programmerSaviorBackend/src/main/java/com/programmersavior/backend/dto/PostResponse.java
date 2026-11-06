package com.programmersavior.backend.dto;

import com.programmersavior.backend.entity.PsPost;

import java.time.LocalDateTime;

/**
 * 返回给前端的 HTML 内容。
 *
 * <p>列表页会直接拿 htmlContent 放入 sandbox iframe 展示。
 * 不返回 createdBy 等内部字段。</p>
 */
public class PostResponse {

    private Long id;
    private String title;
    private String sectionId;
    private String sectionLabel;
    private String menuId;
    private String menuLabel;
    private String childId;
    private String childLabel;
    private String routePath;
    private String imageUrl;
    private String plainText;
    private String htmlContent;
    private String originalFilename;
    private LocalDateTime createdAt;

    public static PostResponse from(PsPost post) {
        PostResponse response = new PostResponse();
        response.id = post.getId();
        response.title = post.getTitle();
        response.sectionId = post.getSectionId();
        response.sectionLabel = post.getSectionLabel();
        response.menuId = post.getMenuId();
        response.menuLabel = post.getMenuLabel();
        response.childId = post.getChildId();
        response.childLabel = post.getChildLabel();
        response.routePath = post.getRoutePath();
        response.imageUrl = post.getImageUrl();
        response.plainText = post.getPlainText();
        response.htmlContent = post.getHtmlContent();
        response.originalFilename = post.getOriginalFilename();
        response.createdAt = post.getCreatedAt();
        return response;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getSectionId() {
        return sectionId;
    }

    public String getSectionLabel() {
        return sectionLabel;
    }

    public String getMenuId() {
        return menuId;
    }

    public String getMenuLabel() {
        return menuLabel;
    }

    public String getChildId() {
        return childId;
    }

    public String getChildLabel() {
        return childLabel;
    }

    public String getRoutePath() {
        return routePath;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getPlainText() {
        return plainText;
    }

    public String getHtmlContent() {
        return htmlContent;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
