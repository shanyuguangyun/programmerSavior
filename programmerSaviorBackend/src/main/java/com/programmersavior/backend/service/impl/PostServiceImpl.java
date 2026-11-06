package com.programmersavior.backend.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.programmersavior.backend.dto.PostResponse;
import com.programmersavior.backend.dto.PostUploadRequest;
import com.programmersavior.backend.entity.PsPost;
import com.programmersavior.backend.exception.BusinessException;
import com.programmersavior.backend.mapper.PsPostMapper;
import com.programmersavior.backend.service.PostService;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * HTML 内容服务实现。
 *
 * <p>保存三部分信息：</p>
 * <ul>
 *   <li>原始 HTML：前端用 sandbox iframe 直接展示；</li>
 *   <li>解析出的标题和首图：用于列表和封面；</li>
 *   <li>纯文本：为后续搜索、摘要预留。</li>
 * </ul>
 */
@Service
public class PostServiceImpl implements PostService {

    private static final long MAX_FILE_SIZE = 2L * 1024 * 1024;
    private static final String DEFAULT_IMAGE = "/default-cover.svg";

    private final PsPostMapper psPostMapper;

    public PostServiceImpl(PsPostMapper psPostMapper) {
        this.psPostMapper = psPostMapper;
    }

    @Override
    public PostResponse create(PostUploadRequest request,
                               MultipartFile file,
                               Long accountId) {
        validateMetadata(request);
        validateFile(file);

        String originalFilename = normalizeFilename(file.getOriginalFilename());
        String html = readContent(file);
        Document document = Jsoup.parse(html);

        PsPost post = new PsPost();
        post.setTitle(resolveTitle(document, originalFilename));
        post.setSectionId(requireText(request.getSectionId(), "请选择一级目录", 64));
        post.setSectionLabel(requireText(request.getSectionLabel(), "一级目录名称不能为空", 64));
        post.setMenuId(requireText(request.getMenuId(), "请选择二级目录", 64));
        post.setMenuLabel(requireText(request.getMenuLabel(), "二级目录名称不能为空", 64));
        post.setChildId(trimToNull(request.getChildId()));
        post.setChildLabel(trimToNull(request.getChildLabel()));
        post.setRoutePath(requireText(request.getRoutePath(), "目录路径不能为空", 255));
        post.setImageUrl(resolveImage(document));
        post.setPlainText(document.body() == null ? "" : document.body().text());
        post.setHtmlContent(html);
        post.setOriginalFilename(originalFilename);
        post.setFileSize(file.getSize());
        post.setCreatedBy(accountId);
        post.setCreatedAt(LocalDateTime.now());

        psPostMapper.insert(post);
        return PostResponse.from(post);
    }

    @Override
    public List<PostResponse> listByRoutePath(String routePath) {
        if (!StringUtils.hasText(routePath) || !routePath.trim().startsWith("/")) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "目录路径不合法");
        }

        List<PsPost> posts = psPostMapper.selectList(
                Wrappers.<PsPost>lambdaQuery()
                        .eq(PsPost::getRoutePath, routePath.trim())
                        .orderByDesc(PsPost::getCreatedAt)
                        .orderByDesc(PsPost::getId)
        );

        return posts.stream().map(PostResponse::from).collect(Collectors.toList());
    }

    @Override
    public PsPost findById(Long id) {
        return id == null ? null : psPostMapper.selectById(id);
    }

    /**
     * 校验目录字段。三级目录是可选的，但一旦有 id 就要求有名称。
     */
    private void validateMetadata(PostUploadRequest request) {
        if (request == null) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "缺少目录信息");
        }

        String routePath = requireText(request.getRoutePath(), "目录路径不能为空", 255);
        if (!routePath.startsWith("/")) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "目录路径不合法");
        }

        if (StringUtils.hasText(request.getChildId())
                && !StringUtils.hasText(request.getChildLabel())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "三级目录名称不能为空");
        }
    }

    /**
     * 只接受 .html / .htm，且限制 2MB，和 application.yml 的 multipart 配置保持一致。
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "请选择 HTML 文件");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "HTML 文件不能超过 2MB");
        }

        String filename = file.getOriginalFilename();
        String lower = filename == null ? "" : filename.toLowerCase(Locale.ROOT);
        if (!lower.endsWith(".html") && !lower.endsWith(".htm")) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "只允许上传 .html 或 .htm 文件");
        }
    }

    private String readContent(MultipartFile file) {
        try {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            // 去掉 Windows 编辑器可能带上的 UTF-8 BOM。
            if (content.startsWith("\uFEFF")) {
                content = content.substring(1);
            }
            if (!StringUtils.hasText(content)) {
                throw new BusinessException(HttpStatus.BAD_REQUEST, "HTML 文件内容为空");
            }
            return content;
        } catch (IOException exception) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "HTML 文件读取失败");
        }
    }

    /**
     * 标题优先级：title 标签 → 第一个 h1 → 文件名。
     */
    private String resolveTitle(Document document, String originalFilename) {
        String title = document.title();
        if (!StringUtils.hasText(title)) {
            Element heading = document.selectFirst("h1");
            title = heading == null ? "" : heading.text();
        }
        if (!StringUtils.hasText(title)) {
            int dotIndex = originalFilename.lastIndexOf('.');
            title = dotIndex > 0
                    ? originalFilename.substring(0, dotIndex)
                    : originalFilename;
        }
        return truncate(title.trim(), 255);
    }

    /**
     * 只接受绝对 http(s) 图片地址；相对地址无法确定真实资源，统一回退到默认封面。
     */
    private String resolveImage(Document document) {
        Element image = document.selectFirst("img[src]");
        if (image == null) {
            return DEFAULT_IMAGE;
        }

        String source = image.attr("src").trim();
        if (source.startsWith("http://") || source.startsWith("https://")) {
            return truncate(source, 1000);
        }
        return DEFAULT_IMAGE;
    }

    private String normalizeFilename(String originalFilename) {
        String filename = StringUtils.hasText(originalFilename)
                ? originalFilename
                : "uploaded.html";

        filename = filename.replace('\\', '/');
        int slashIndex = filename.lastIndexOf('/');
        if (slashIndex >= 0) {
            filename = filename.substring(slashIndex + 1);
        }
        return truncate(filename, 255);
    }

    private String requireText(String value, String message, int maxLength) {
        if (!StringUtils.hasText(value)) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, message);
        }
        return truncate(value.trim(), maxLength);
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? truncate(value.trim(), 64) : null;
    }

    private String truncate(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }
}
