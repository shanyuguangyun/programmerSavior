package com.programmersavior.backend.controller;

import com.programmersavior.backend.common.ApiResponse;
import com.programmersavior.backend.common.AuthSessions;
import com.programmersavior.backend.dto.PostResponse;
import com.programmersavior.backend.dto.PostUploadRequest;
import com.programmersavior.backend.entity.PsPost;
import com.programmersavior.backend.exception.BusinessException;
import com.programmersavior.backend.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * HTML 内容接口。
 *
 * <p>GET 是公开内容；POST 必须是已登录账号，上传账号 id 从 Session 中读取。</p>
 */
@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    /**
     * 上传 HTML，并返回解析、保存后的内容。
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<PostResponse> upload(@ModelAttribute PostUploadRequest request,
                                            @RequestParam("file") MultipartFile file,
                                            HttpServletRequest httpRequest) {
        Long accountId = AuthSessions.requireAccountId(httpRequest);
        return ApiResponse.success(
                "上传成功",
                postService.create(request, file, accountId)
        );
    }

    /**
     * 查询某个菜单路由下的所有 HTML 内容，用于卡片列表。
     */
    @GetMapping
    public ApiResponse<List<PostResponse>> list(
            @RequestParam("path") String path) {
        return ApiResponse.success(postService.listByRoutePath(path));
    }

    /**
     * 单篇内容详情，供独立阅读页加载 HTML 和评论。
     */
    @GetMapping("/{id}")
    public ApiResponse<PostResponse> detail(@PathVariable("id") Long id) {
        PsPost post = postService.findById(id);
        if (post == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "内容不存在");
        }
        return ApiResponse.success(PostResponse.from(post));
    }
}
