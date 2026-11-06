package com.programmersavior.backend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.programmersavior.backend.entity.PsAccount;
import org.apache.ibatis.annotations.Mapper;

/**
 * ps_account 表的数据访问层。
 *
 * <p>继承 BaseMapper 后，单表查询、按 id 查询等基础能力由 MyBatis-Plus 提供。</p>
 */
@Mapper
public interface PsAccountMapper extends BaseMapper<PsAccount> {
}
