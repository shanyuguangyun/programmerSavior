-- ============================================================
-- 评论表
-- 支持通过 parent_id 无限层级回复；删除文章或父评论时级联删除。
-- 字符集：utf8mb4
-- 排序规则：utf8mb4_general_ci
-- ============================================================

CREATE TABLE ps_comment (
    id              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    post_id         BIGINT       NOT NULL COMMENT '所属 HTML 内容 id',
    parent_id       BIGINT       NULL COMMENT '父评论 id，可为空',
    content         TEXT         NOT NULL COMMENT '评论正文（纯文本）',
    author_name     VARCHAR(64)  NOT NULL COMMENT '展示昵称；管理员使用登录账号',
    author_is_admin TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否管理员',
    ip_hash         CHAR(32)     NOT NULL COMMENT '客户端 IP 的 MD5，用于生成匿名昵称',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_ps_comment_post_created (post_id, created_at),
    KEY idx_ps_comment_parent (parent_id),
    CONSTRAINT fk_ps_comment_post
        FOREIGN KEY (post_id) REFERENCES ps_post (id) ON DELETE CASCADE,
    CONSTRAINT fk_ps_comment_parent
        FOREIGN KEY (parent_id) REFERENCES ps_comment (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci
  COMMENT = 'HTML 内容评论';
