package com.programmersavior.backend.service;

import com.programmersavior.backend.entity.PsAccount;

/**
 * 登录与当前账号查询服务。
 */
public interface AuthService {

    /**
     * 校验账号和密码。
     *
     * @param username    登录账号
     * @param rawPassword 前端提交的明文密码
     * @return 校验通过的账号
     */
    PsAccount authenticate(String username, String rawPassword);

    /**
     * 根据主键查询账号，用于根据 Session 恢复登录态。
     *
     * @param accountId 账号主键
     * @return 账号，可能为 null
     */
    PsAccount findById(Long accountId);
}
