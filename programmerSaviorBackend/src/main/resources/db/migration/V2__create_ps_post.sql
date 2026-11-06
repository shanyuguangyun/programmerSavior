-- ============================================================
-- HTML 内容表
-- 保存上传的原始 HTML、解析出的标题/首图/纯文本以及所属目录。
-- 字符集：utf8mb4
-- 排序规则：utf8mb4_general_ci
-- ============================================================

CREATE TABLE ps_post (
    id                BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    title             VARCHAR(255) NOT NULL COMMENT '解析出的标题',
    section_id        VARCHAR(64)  NOT NULL COMMENT '一级目录 id',
    section_label     VARCHAR(64)  NOT NULL COMMENT '一级目录名称',
    menu_id           VARCHAR(64)  NOT NULL COMMENT '二级目录 id',
    menu_label        VARCHAR(64)  NOT NULL COMMENT '二级目录名称',
    child_id          VARCHAR(64)  NULL COMMENT '三级目录 id，可为空',
    child_label       VARCHAR(64)  NULL COMMENT '三级目录名称，可为空',
    route_path        VARCHAR(255) NOT NULL COMMENT '前端对应路由路径',
    image_url         VARCHAR(1024) NOT NULL COMMENT '首图地址，没有时使用默认封面',
    plain_text        LONGTEXT     NULL COMMENT '从 body 解析出的纯文本',
    html_content      LONGTEXT     NOT NULL COMMENT '上传的完整 HTML',
    original_filename VARCHAR(255) NOT NULL COMMENT '原始文件名',
    file_size         BIGINT       NOT NULL COMMENT '文件大小，单位字节',
    created_by        BIGINT       NOT NULL COMMENT '上传账号 id',
    created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_ps_post_route_path (route_path),
    KEY idx_ps_post_created_at (created_at),
    CONSTRAINT fk_ps_post_account
        FOREIGN KEY (created_by) REFERENCES ps_account (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci
  COMMENT = 'HTML 内容';
