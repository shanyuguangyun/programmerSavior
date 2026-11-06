package com.programmersavior.backend;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 后端启动类。
 *
 * <p>使用 Spring Boot 2.7 + Java 8，启动时会自动执行 Flyway 数据库迁移。</p>
 */
@SpringBootApplication
@MapperScan("com.programmersavior.backend.mapper")
public class ProgrammerSaviorBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProgrammerSaviorBackendApplication.class, args);
    }
}
