package com.programmersavior.backend.controller;

import com.programmersavior.backend.common.ApiResponse;
import com.programmersavior.backend.dto.CommentCreateRequest;
import com.programmersavior.backend.dto.CommentListResponse;
import com.programmersavior.backend.dto.CommentResponse;
import com.programmersavior.backend.dto.CommentViewer;
import com.programmersavior.backend.service.CommentService;
import com.programmersavior.backend.service.ViewerIdentityService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

/**
 * 文章评论接口。
 *
 * <p>评论不需要登录；管理员登录后会以真实账号名显示。</p>
 */
@RestController
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {

    private final CommentService commentService;
    private final ViewerIdentityService viewerIdentityService;

    public CommentController(CommentService commentService,
                             ViewerIdentityService viewerIdentityService) {
        this.commentService = commentService;
        this.viewerIdentityService = viewerIdentityService;
    }

    @GetMapping
    public ApiResponse<CommentListResponse> list(@PathVariable("postId") Long postId,
                                                 HttpServletRequest httpRequest) {
        CommentViewer viewer = viewerIdentityService.resolve(httpRequest);
        return ApiResponse.success(commentService.list(postId, viewer));
    }

    @PostMapping
    public ApiResponse<CommentResponse> create(
            @PathVariable("postId") Long postId,
            @Valid @RequestBody CommentCreateRequest request,
            HttpServletRequest httpRequest) {
        CommentViewer viewer = viewerIdentityService.resolve(httpRequest);
        return ApiResponse.success(
                "评论成功",
                commentService.create(postId, request, viewer)
        );
    }
}
