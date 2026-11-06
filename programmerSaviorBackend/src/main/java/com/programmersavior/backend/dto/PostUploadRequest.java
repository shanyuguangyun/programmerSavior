package com.programmersavior.backend.dto;

/**
 * HTML 上传表单的目录字段。
 *
 * <p>文件通过单独的 MultipartFile 参数接收；
 * 这些字段由前端根据导航数据一起提交。</p>
 */
public class PostUploadRequest {

    private String sectionId;
    private String sectionLabel;
    private String menuId;
    private String menuLabel;
    private String childId;
    private String childLabel;
    private String routePath;

    public String getSectionId() {
        return sectionId;
    }

    public void setSectionId(String sectionId) {
        this.sectionId = sectionId;
    }

    public String getSectionLabel() {
        return sectionLabel;
    }

    public void setSectionLabel(String sectionLabel) {
        this.sectionLabel = sectionLabel;
    }

    public String getMenuId() {
        return menuId;
    }

    public void setMenuId(String menuId) {
        this.menuId = menuId;
    }

    public String getMenuLabel() {
        return menuLabel;
    }

    public void setMenuLabel(String menuLabel) {
        this.menuLabel = menuLabel;
    }

    public String getChildId() {
        return childId;
    }

    public void setChildId(String childId) {
        this.childId = childId;
    }

    public String getChildLabel() {
        return childLabel;
    }

    public void setChildLabel(String childLabel) {
        this.childLabel = childLabel;
    }

    public String getRoutePath() {
        return routePath;
    }

    public void setRoutePath(String routePath) {
        this.routePath = routePath;
    }
}
