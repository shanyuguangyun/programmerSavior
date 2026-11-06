package com.programmersavior.backend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.programmersavior.backend.entity.PsPost;
import org.apache.ibatis.annotations.Mapper;

/**
 * ps_post 表的数据访问层。
 */
@Mapper
public interface PsPostMapper extends BaseMapper<PsPost> {
}
