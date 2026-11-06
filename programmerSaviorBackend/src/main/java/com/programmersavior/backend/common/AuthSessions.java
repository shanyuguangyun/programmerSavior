package com.programmersavior.backend.common;

import com.programmersavior.backend.exception.BusinessException;
import org.springframework.http.HttpStatus;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

/**
 * 从 Session 中读取登录账号 id 的工具。
 *
 * <p>上传等需要登录的接口统一通过这里取当前账号，
 * 避免每个 Controller 重复写 Session 判断。</p>
 */
public final class AuthSessions {

    private AuthSessions() {
    }

    /**
     * 获取当前登录账号 id；未登录返回 null。
     */
    public static Long getAccountId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }

        Object value = session.getAttribute(AuthConstants.SESSION_ACCOUNT_ID);
        return value instanceof Long ? (Long) value : null;
    }

    /**
     * 要求必须登录，未登录直接抛 401。
     */
    public static Long requireAccountId(HttpServletRequest request) {
        Long accountId = getAccountId(request);
        if (accountId == null) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "请先登录");
        }
        return accountId;
    }
}
