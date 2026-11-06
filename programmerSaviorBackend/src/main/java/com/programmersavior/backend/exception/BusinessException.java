package com.programmersavior.backend.exception;

import org.springframework.http.HttpStatus;

/**
 * 可预期的业务异常。
 *
 * <p>由全局异常处理器转换为对应的 HTTP 状态码和统一响应体。</p>
 */
public class BusinessException extends RuntimeException {

    private final HttpStatus status;

    public BusinessException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
