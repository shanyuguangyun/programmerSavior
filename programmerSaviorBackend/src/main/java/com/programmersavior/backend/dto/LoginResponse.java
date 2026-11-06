package com.programmersavior.backend.dto;

/**
 * 登录成功后返回给前端的最小账号信息。
 *
 * <p>不包含密码哈希、创建时间等内部字段。</p>
 */
public class LoginResponse {

    private String username;

    public LoginResponse() {
    }

    public LoginResponse(String username) {
        this.username = username;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
