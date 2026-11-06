package com.programmersavior.backend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

/**
 * 评论实体，对应表 ps_comment。
 *
 * <p>通过 parentId 支持任意层级回复。匿名评论只保存 IP 的 MD5，
 * 不保存原始 IP。</p>
 */
@TableName("ps_comment")
public class PsComment {

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private Long postId;

    /** 父评论 id；顶级评论为 null */
    private Long parentId;

    /** 评论正文，纯文本 */
    private String content;

    /** 展示昵称；管理员使用登录账号 */
    private String authorName;

    /** 是否为管理员发表 */
    private Boolean authorIsAdmin;

    /** 客户端 IP 的 MD5 */
    private String ipHash;

    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public Boolean getAuthorIsAdmin() {
        return authorIsAdmin;
    }

    public void setAuthorIsAdmin(Boolean authorIsAdmin) {
        this.authorIsAdmin = authorIsAdmin;
    }

    public String getIpHash() {
        return ipHash;
    }

    public void setIpHash(String ipHash) {
        this.ipHash = ipHash;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
