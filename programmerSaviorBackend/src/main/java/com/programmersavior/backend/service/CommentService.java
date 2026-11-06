package com.programmersavior.backend.service;

import com.programmersavior.backend.dto.CommentCreateRequest;
import com.programmersavior.backend.dto.CommentListResponse;
import com.programmersavior.backend.dto.CommentResponse;
import com.programmersavior.backend.dto.CommentViewer;

/**
 * 评论业务。
 */
public interface CommentService {

    /**
     * 查询某篇 HTML 下的全部评论（扁平列表，由前端组装树）。
     */
    CommentListResponse list(Long postId, CommentViewer viewer);

    /**
     * 发表评论或回复。
     */
    CommentResponse create(Long postId,
                           CommentCreateRequest request,
                           CommentViewer viewer);
}
