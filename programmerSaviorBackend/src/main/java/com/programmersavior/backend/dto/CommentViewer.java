package com.programmersavior.backend.dto;

/**
 * 当前评论者的显示身份。
 *
 * <p>管理员取登录账号名；匿名用户取“用户 + IP MD5 前缀”。</p>
 */
public class CommentViewer {

    private final String name;
    private final boolean admin;
    private final String ipHash;

    public CommentViewer(String name, boolean admin, String ipHash) {
        this.name = name;
        this.admin = admin;
        this.ipHash = ipHash;
    }

    public String getName() {
        return name;
    }

    public boolean isAdmin() {
        return admin;
    }

    public String getIpHash() {
        return ipHash;
    }
}
