-- ============================================================
-- 登录账号表
-- 字符集：utf8mb4
-- 排序规则：utf8mb4_general_ci
-- 说明：MySQL 没有 utf8mb4_gen_ci 这个排序规则，
--       这里使用标准的 utf8mb4_general_ci。
-- ============================================================

CREATE TABLE ps_account (
    id            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    username      VARCHAR(64)  NOT NULL COMMENT '登录账号',
    password_hash VARCHAR(100) NOT NULL COMMENT 'BCrypt 密码哈希，不保存明文',
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_ps_account_username (username)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci
  COMMENT = '登录账号';

-- 初始账号：fengwen / fengwenpsd
-- 下面的字符串是 fengwenpsd 的 BCrypt 哈希，不是明文密码。
INSERT INTO ps_account (username, password_hash)
VALUES ('fengwen', '$2a$10$DDD91l5SrS/nRlvx9bfy7OPJQwM9MiyFmmcxCwZooLbAoLXvJNwvm');
