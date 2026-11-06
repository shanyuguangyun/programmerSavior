package com.programmersavior.backend.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.programmersavior.backend.entity.PsAccount;
import com.programmersavior.backend.exception.BusinessException;
import com.programmersavior.backend.mapper.PsAccountMapper;
import com.programmersavior.backend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 登录服务实现。
 *
 * <p>密码使用 BCrypt 校验，数据库不保存明文。</p>
 */
@Service
public class AuthServiceImpl implements AuthService {

    private final PsAccountMapper psAccountMapper;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(PsAccountMapper psAccountMapper,
                           PasswordEncoder passwordEncoder) {
        this.psAccountMapper = psAccountMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public PsAccount authenticate(String username, String rawPassword) {
        if (!StringUtils.hasText(username) || !StringUtils.hasText(rawPassword)) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "账号或密码错误");
        }

        PsAccount account = psAccountMapper.selectOne(
                Wrappers.<PsAccount>lambdaQuery()
                        .eq(PsAccount::getUsername, username.trim())
                        .last("LIMIT 1")
        );

        // 无论在账号不存在还是密码错误时都返回相同提示，避免暴露账号是否存在。
        if (account == null
                || !passwordEncoder.matches(rawPassword, account.getPasswordHash())) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "账号或密码错误");
        }

        return account;
    }

    @Override
    public PsAccount findById(Long accountId) {
        if (accountId == null) {
            return null;
        }
        return psAccountMapper.selectById(accountId);
    }
}
