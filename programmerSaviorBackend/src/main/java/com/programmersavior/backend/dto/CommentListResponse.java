package com.programmersavior.backend.dto;

import java.util.List;

/**
 * 评论列表响应，同时告诉前端当前访客会使用什么昵称。
 */
public class CommentListResponse {

    private final String viewerName;
    private final boolean viewerAdmin;
    private final List<CommentResponse> comments;

    public CommentListResponse(String viewerName,
                               boolean viewerAdmin,
                               List<CommentResponse> comments) {
        this.viewerName = viewerName;
        this.viewerAdmin = viewerAdmin;
        this.comments = comments;
    }

    public String getViewerName() {
        return viewerName;
    }

    public boolean isViewerAdmin() {
        return viewerAdmin;
    }

    public List<CommentResponse> getComments() {
        return comments;
    }
}
