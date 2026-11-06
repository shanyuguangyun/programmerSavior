package com.programmersavior.backend.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.programmersavior.backend.dto.CommentCreateRequest;
import com.programmersavior.backend.dto.CommentListResponse;
import com.programmersavior.backend.dto.CommentResponse;
import com.programmersavior.backend.dto.CommentViewer;
import com.programmersavior.backend.entity.PsComment;
import com.programmersavior.backend.exception.BusinessException;
import com.programmersavior.backend.mapper.PsCommentMapper;
import com.programmersavior.backend.service.CommentService;
import com.programmersavior.backend.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 评论服务实现。
 */
@Service
public class CommentServiceImpl implements CommentService {

    private final PsCommentMapper psCommentMapper;
    private final PostService postService;

    public CommentServiceImpl(PsCommentMapper psCommentMapper,
                              PostService postService) {
        this.psCommentMapper = psCommentMapper;
        this.postService = postService;
    }

    @Override
    public CommentListResponse list(Long postId, CommentViewer viewer) {
        ensurePostExists(postId);

        List<PsComment> comments = psCommentMapper.selectList(
                Wrappers.<PsComment>lambdaQuery()
                        .eq(PsComment::getPostId, postId)
                        .orderByAsc(PsComment::getCreatedAt)
                        .orderByAsc(PsComment::getId)
        );

        List<CommentResponse> responses = comments.stream()
                .map(CommentResponse::from)
                .collect(Collectors.toList());

        return new CommentListResponse(viewer.getName(), viewer.isAdmin(), responses);
    }

    @Override
    public CommentResponse create(Long postId,
                                  CommentCreateRequest request,
                                  CommentViewer viewer) {
        ensurePostExists(postId);

        String content = request.getContent() == null
                ? ""
                : request.getContent().trim();
        if (!StringUtils.hasText(content)) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "评论内容不能为空");
        }
        if (content.length() > 1000) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "评论内容不能超过 1000 个字符");
        }

        if (request.getParentId() != null) {
            PsComment parent = psCommentMapper.selectById(request.getParentId());
            if (parent == null || !postId.equals(parent.getPostId())) {
                throw new BusinessException(HttpStatus.BAD_REQUEST, "回复的评论不存在");
            }
        }

        PsComment comment = new PsComment();
        comment.setPostId(postId);
        comment.setParentId(request.getParentId());
        comment.setContent(content);
        comment.setAuthorName(viewer.getName());
        comment.setAuthorIsAdmin(viewer.isAdmin());
        comment.setIpHash(viewer.getIpHash());
        comment.setCreatedAt(LocalDateTime.now());

        psCommentMapper.insert(comment);
        return CommentResponse.from(comment);
    }

    private void ensurePostExists(Long postId) {
        if (postId == null || postService.findById(postId) == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "内容不存在");
        }
    }
}
