package com.programmersavior.backend.common;

/**
 * 登录相关的常量。
 */
public final class AuthConstants {

    /**
     * Session 中保存当前登录账号主键的 key。
     * 不把完整账号对象放进 Session，避免密码哈希等敏感字段被序列化。
     */
    public static final String SESSION_ACCOUNT_ID = "PS_LOGIN_ACCOUNT_ID";

    private AuthConstants() {
        // 工具类不允许实例化
    }
}
