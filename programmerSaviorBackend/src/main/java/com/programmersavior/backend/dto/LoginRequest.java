package com.programmersavior.backend.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * 登录请求体。
 */
public class LoginRequest {

    @NotBlank(message = "请输入账号")
    @Size(max = 64, message = "账号长度不能超过 64 个字符")
    private String username;

    @NotBlank(message = "请输入密码")
    @Size(max = 64, message = "密码长度不能超过 64 个字符")
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
