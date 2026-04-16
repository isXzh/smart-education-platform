<template>
  <el-dialog
    :visible.sync="visible"
    :width="width"
    :show-close="false"
    :close-on-click-modal="false"
    custom-class="organization-dialog"
    :title="title"
  >
    <!-- 自定义头部 -->
    <!-- <div class="dialog-header">
      <span class="dialog-title">{{ title }}</span>
      <i class="el-icon-close close-icon" @click="handleClose"></i>
    </div> -->

    <!-- 表单内容 -->
    <div
      class="dialog-body"
      v-loading="loading"
      element-loading-text="加载中..."
    >
      <el-form ref="form" :model="form" :rules="rules" label-position="top">
        <!-- 上级组织 - 仅添加下级组织时显示 -->
        <el-form-item v-if="isSubOrgMode" label="上级组织">
          <div class="parent-org-display">
            <div class="org-icon" :class="getOrgIconClass(currentOrg.type)">
              <i :class="getOrgIcon(currentOrg.type)"></i>
            </div>
            <div class="org-info">
              <div class="org-name">{{ currentOrg.orgName }}</div>
              <div class="org-type">{{ getOrgTypeName(currentOrg.type) }}</div>
            </div>
          </div>
        </el-form-item>

        <!-- 组织名称 -->
        <el-form-item label="组织名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入组织名称"
            class="form-input"
          />
        </el-form-item>

        <!-- 组织类型 -->
        <el-form-item label="组织类型">
          <div class="org-type-display" :class="{ 'is-auto': isSubOrgMode }">
            <div class="type-icon">
              <i :class="getOrgIcon(form.type || 'area')"></i>
            </div>
            <div class="type-info">
              <div class="type-name">
                {{ getOrgTypeName(form.type || "area") }}
              </div>
              <div class="type-desc">
                {{
                  isSubOrgMode ? "由上级组织类型自动确定" : "组织类型不可更改"
                }}
              </div>
            </div>
          </div>
        </el-form-item>

        <!-- 负责人 -->
        <el-form-item label="负责人">
          <el-input
            v-model="form.leader"
            placeholder="请输入负责人姓名"
            class="form-input"
          />
        </el-form-item>

        <!-- 描述 -->
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入组织描述"
            class="form-textarea"
            resize="none"
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button class="cancel-btn" @click="handleClose">取消</el-button>
      <el-button class="confirm-btn" type="primary" @click="handleConfirm"
        >添加</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
import orgStructureApi from "@/api/orgStructure.js";

export default {
  name: "OrganizationDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "添加组织",
    },
    width: {
      type: String,
      default: "480px",
    },
    // 是否为添加下级组织模式
    isSubOrgMode: {
      type: Boolean,
      default: false,
    },
    // 父级组织信息（添加下级时使用）
    parentOrg: {
      type: Object,
      default: () => ({}),
    },
    currentOrg: {
      type: Object,
      default: () => ({}),
    },
    // 编辑时的初始数据
    editData: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      form: {
        name: "",
        type: "school",
        leader: "",
        description: "",
        parentId: "",
      },
      rules: {
        name: [{ required: true, message: "请输入组织名称", trigger: "blur" }],
      },
      loading: false,
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.initForm();
      }
    },
  },
  methods: {
    // 初始化表单
    async initForm() {
      if (this.editData) {
        // 编辑模式 - 从接口获取最新数据
        // await this.loadOrgDetail(this.editData.id);
        this.form.name = this.editData.orgName || "";
        this.form.parentId = this.editData.parentId || "";
        this.form.leader = this.editData.leader || "";
        this.form.description = this.editData.remark || "";
      } else {
        // 新增模式
        let type = "school";
        // if (this.isSubOrgMode) {
        //   // 从接口获取下级组织类型
        //   const childType = await this.fetchChildOrgType(this.parentOrg.id);
        //   type = childType || this.getChildOrgType(this.parentOrg.type);
        // }
        this.form = {
          name: "",
          type: type,
          leader: "",
          description: "",
          parentId: "",
        };
      }
    },

    // 加载组织详情
    async loadOrgDetail(id) {
      try {
        this.loading = true;
        const res = await orgStructureApi.getById(id);
        if (res.code === 200) {
          this.form = {
            name: res.data.name || "",
            type: res.data.type || "school",
            leader: res.data.leader || "",
            description: res.data.description || "",
            parentId: res.data.id || "",
          };
        }
      } catch (error) {
        console.error("加载组织详情失败:", error);
        this.$message.error("加载组织详情失败");
      } finally {
        this.loading = false;
      }
    },
    // 获取子组织类型（根据父类型自动确定）
    getChildOrgType(parentType) {
      const typeMap = {
        platform: "area",
        area: "school",
        school: "grade",
        grade: "class",
        class: null,
      };
      return typeMap[parentType] || "school";
    },

    // 从接口获取下级组织类型
    async fetchChildOrgType(parentId) {
      try {
        const res = await orgStructureApi.getChildOrgType(parentId);
        if (res.code === 200) {
          return res.data;
        }
        return null;
      } catch (error) {
        console.error("获取下级组织类型失败:", error);
        return null;
      }
    },
    // 获取组织图标
    getOrgIcon(type) {
      const icons = {
        platform: "el-icon-s-platform",
        area: "el-icon-office-building",
        school: "el-icon-school",
        grade: "el-icon-s-grid",
        class: "el-icon-user-solid",
        department: "el-icon-s-cooperation",
      };
      return icons[type] || "el-icon-s-cooperation";
    },
    // 获取组织图标样式类
    getOrgIconClass(type) {
      const classMap = {
        platform: "platform-bg",
        area: "area-bg",
        school: "school-bg",
        grade: "grade-bg",
        class: "class-bg",
        department: "department-bg",
      };
      return classMap[type] || "default-bg";
    },
    // 获取组织类型名称
    getOrgTypeName(type) {
      const names = {
        platform: "平台",
        area: "区域",
        school: "学校",
        grade: "年级",
        class: "班级",
        department: "部门",
      };
      return names[type] || "组织";
    },
    // 关闭弹窗
    handleClose() {
      this.$emit("update:visible", false);
      this.$refs.form && this.$refs.form.resetFields();
    },
    // 确认提交
    handleConfirm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          let params = {
            parentId: this.form.parentId
              ? this.form.parentId
              : this.currentOrg.id,
            orgName: this.form.name,
            leader: this.form.leader,
            remark: this.form.description,
          };
          this.$emit("confirm", params);
          this.handleClose();
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .organization-dialog {
  // border-radius: 12px;
  // overflow: hidden;

  // .el-dialog__header {
  //   display: none;
  // }

  // .el-dialog__body {
  //   padding: 0;
  // }

  // .el-dialog__footer {
  //   border-top: 1px solid #ebeef5;
  //   padding: 16px 24px;
  // }
}

.dialog-header {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .dialog-title {
    color: #fff;
    font-size: 18px;
    font-weight: 600;
  }

  .close-icon {
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }
  }
}

.dialog-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

::v-deep .el-form-item {
  margin-bottom: 20px;

  &__label {
    color: #374151;
    font-weight: 500;
    font-size: 14px;
    padding-bottom: 8px;
    line-height: 1.4;

    &::before {
      color: #ef4444;
      margin-right: 4px;
    }
  }
}

.form-input,
.form-textarea {
  ::v-deep .el-input__inner {
    border-radius: 8px;
    border-color: #d1d5db;
    height: 40px;
    font-size: 14px;

    &:focus {
      border-color: #4f46e5;
    }

    &::placeholder {
      color: #9ca3af;
    }
  }
}

.form-textarea {
  ::v-deep .el-textarea__inner {
    border-radius: 8px;
    border-color: #d1d5db;
    font-size: 14px;
    padding: 12px;

    &:focus {
      border-color: #4f46e5;
    }

    &::placeholder {
      color: #9ca3af;
    }
  }
}

// 上级组织显示
.parent-org-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f0f7ff;
  border: 1px solid #dbeafe;
  border-radius: 8px;

  .org-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #fff;

    &.platform-bg {
      background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
    }
    &.area-bg {
      background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
    }
    &.school-bg {
      background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
    }
    &.grade-bg {
      background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    }
    &.class-bg {
      background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
    }
    &.department-bg {
      background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
    }
    &.default-bg {
      background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
    }
  }

  .org-info {
    flex: 1;

    .org-name {
      font-size: 16px;
      font-weight: 500;
      color: #111827;
      margin-bottom: 2px;
    }

    .org-type {
      font-size: 12px;
      color: #6b7280;
    }
  }
}

// 组织类型显示
.org-type-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;

  &.is-auto {
    background: #f0f7ff;
    border-color: #dbeafe;
  }

  .type-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #fff;
    background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);

    .el-icon-school {
      background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
    }
  }

  .type-info {
    flex: 1;

    .type-name {
      font-size: 16px;
      font-weight: 500;
      color: #111827;
      margin-bottom: 2px;
    }

    .type-desc {
      font-size: 12px;
      color: #6b7280;
    }
  }
}

// .dialog-footer {
//   display: flex;
//   justify-content: flex-end;
//   gap: 12px;

//   .cancel-btn {
//     min-width: 80px;
//     height: 36px;
//     border-radius: 6px;
//     border-color: #d1d5db;
//     color: #374151;

//     &:hover {
//       border-color: #9ca3af;
//       color: #111827;
//     }
//   }

//   .confirm-btn {
//     min-width: 80px;
//     height: 36px;
//     border-radius: 6px;
//     background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
//     border: none;

//     &:hover {
//       background: linear-gradient(135deg, #4338ca 0%, #2563eb 100%);
//     }
//   }
// }
</style>
