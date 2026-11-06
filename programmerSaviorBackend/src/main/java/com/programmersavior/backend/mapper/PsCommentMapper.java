package com.programmersavior.backend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.programmersavior.backend.entity.PsComment;
import org.apache.ibatis.annotations.Mapper;

/**
 * ps_comment 表的数据访问层。
 */
@Mapper
public interface PsCommentMapper extends BaseMapper<PsComment> {
}
