package com.programmersavior.backend.controller;

import com.programmersavior.backend.common.ApiResponse;
import com.programmersavior.backend.common.AuthConstants;
import com.programmersavior.backend.dto.LoginRequest;
import com.programmersavior.backend.dto.LoginResponse;
import com.programmersavior.backend.entity.PsAccount;
import com.programmersavior.backend.exception.BusinessException;
import com.programmersavior.backend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.validation.Valid;

/**
 * 登录相关接口。
 *
 * <p>登录态保存在服务端 HttpSession 中，浏览器通过 JSESSIONID 维持会话。</p>
 */
@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * 账号密码登录。
     *
     * <p>登录成功后会销毁旧 Session 并创建新 Session，降低会话固定攻击风险。</p>
     */
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request,
                                            HttpServletRequest httpRequest) {
        PsAccount account = authService.authenticate(
                request.getUsername(),
                request.getPassword()
        );

        HttpSession oldSession = httpRequest.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }

        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(AuthConstants.SESSION_ACCOUNT_ID, account.getId());

        return ApiResponse.success(
                "登录成功",
                new LoginResponse(account.getUsername())
        );
    }

    /**
     * 查询当前登录账号。
     *
     * <p>前端刷新页面后调用这个接口恢复登录态；未登录返回 401。</p>
     */
    @GetMapping("/me")
    public ApiResponse<LoginResponse> me(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        Long accountId = session == null
                ? null
                : (Long) session.getAttribute(AuthConstants.SESSION_ACCOUNT_ID);

        if (accountId == null) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "未登录");
        }

        PsAccount account = authService.findById(accountId);
        if (account == null) {
            // 账号被删除后，清理已经失效的 Session。
            session.invalidate();
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "登录已失效");
        }

        return ApiResponse.success(new LoginResponse(account.getUsername()));
    }

    /**
     * 退出登录：销毁服务端 Session。
     *
     * <p>即使当前没有 Session 也返回成功，方便前端做幂等处理。</p>
     */
    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return new ApiResponse<Void>(true, "已退出登录", null);
    }
}
