package com.programmersavior.backend.service;

import com.programmersavior.backend.dto.PostResponse;
import com.programmersavior.backend.dto.PostUploadRequest;
import com.programmersavior.backend.entity.PsPost;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * HTML 内容业务。
 */
public interface PostService {

    /**
     * 解析并保存一个 HTML 文件。
     *
     * @param request   目录信息
     * @param file      HTML 文件
     * @param accountId 当前登录账号 id
     * @return 保存后的内容
     */
    PostResponse create(PostUploadRequest request, MultipartFile file, Long accountId);

    /**
     * 查询某个前端路由下的内容，按创建时间倒序。
     */
    List<PostResponse> listByRoutePath(String routePath);

    /**
     * 按主键查询，用于新标签页直接打开 HTML。
     */
    PsPost findById(Long id);
}
