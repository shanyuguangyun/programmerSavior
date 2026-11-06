-- ============================================================
-- 文章浏览事件表（去重后）
-- 一次有效浏览 = 一行。重复写入被唯一约束拒绝，调用方用
-- INSERT IGNORE 静默忽略，因此“计数”永远等于“数行数”。
-- 去重口径：同一访客对同一文章，30 分钟桶内只算 1 次。
--   view_bucket = epochMilli / 1800000（UTC，天生无时区歧义）
--   “今日”归属用 created_at（东八区）过滤，两个职责分离。
-- visitor_hash：MD5(ip | UA | 东八区日期 | 盐)，盐在 application.yml。
-- ============================================================

CREATE TABLE ps_post_view (
    id           BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键',
    post_id      BIGINT      NOT NULL COMMENT '文章 id',
    visitor_hash CHAR(32)    NOT NULL COMMENT '访客哈希：MD5(ip|UA|日期|盐)',
    view_bucket  BIGINT      NOT NULL COMMENT '30 分钟去重桶：epochMilli/1800000（UTC）',
    is_admin     TINYINT(1)  NOT NULL DEFAULT 0 COMMENT '是否管理员访问，统计时排除',
    created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上报时间（东八区）',
    PRIMARY KEY (id),
    UNIQUE KEY uk_ps_post_view_dedupe (post_id, visitor_hash, view_bucket),
    KEY idx_ps_post_view_created (created_at),
    KEY idx_ps_post_view_post_created (post_id, created_at),
    CONSTRAINT fk_ps_post_view_post
        FOREIGN KEY (post_id) REFERENCES ps_post (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci
  COMMENT = '文章浏览事件（去重后）';
