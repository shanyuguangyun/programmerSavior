package com.programmersavior.backend.service;

import com.programmersavior.backend.common.AuthSessions;
import com.programmersavior.backend.dto.CommentViewer;
import com.programmersavior.backend.entity.PsAccount;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.UUID;

/**
 * 解析当前评论者身份。
 *
 * <p>规则：</p>
 * <ul>
 *   <li>已登录管理员：展示账号名，例如 fengwen；</li>
 *   <li>未登录访客：展示“用户 + IP MD5 前 12 位”；</li>
 *   <li>数据库只保存 IP 的 MD5，不保存原始 IP。</li>
 * </ul>
 */
@Service
public class ViewerIdentityService {

    private final AuthService authService;

    public ViewerIdentityService(AuthService authService) {
        this.authService = authService;
    }

    public CommentViewer resolve(HttpServletRequest request) {
        String ip = resolveClientIp(request);
        String ipHash = md5(ip);

        Long accountId = AuthSessions.getAccountId(request);
        if (accountId != null) {
            PsAccount account = authService.findById(accountId);
            if (account != null) {
                return new CommentViewer(account.getUsername(), true, ipHash);
            }
        }

        String suffix = ipHash.substring(0, Math.min(12, ipHash.length()));
        return new CommentViewer("用户" + suffix, false, ipHash);
    }

    /**
     * 开发环境由 Vite 代理转发 X-Forwarded-For；
     * 生产环境需要在反向代理中正确设置该请求头。
     */
    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            String first = forwarded.split(",")[0].trim();
            if (StringUtils.hasText(first)) {
                return first;
            }
        }
        return request.getRemoteAddr();
    }

    private String md5(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            byte[] bytes = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder(bytes.length * 2);
            for (byte item : bytes) {
                builder.append(String.format("%02x", item & 0xff));
            }
            return builder.toString();
        } catch (Exception exception) {
            // MD5 在标准 JDK 中一定存在；这里只做极端兜底。
            return UUID.randomUUID().toString().replace("-", "");
        }
    }
}
