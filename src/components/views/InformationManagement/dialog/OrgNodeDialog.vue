<template>
  <el-dialog
    :visible="visible"
    width="480px"
    :show-close="false"
    :close-on-click-modal="false"
    custom-class="org-node-dialog"
  >
    <!-- 自定义头部 -->
    <div class="dialog-header">
      <span class="dialog-title">{{ dialogTitle }}</span>
      <i class="el-icon-close close-icon" @click="handleClose"></i>
    </div>

    <!-- 表单内容 -->
    <div class="dialog-body">
      <el-form ref="form" :model="form" :rules="rules" label-position="top">
        <!-- 上级组织 - 添加子节点时显示 -->
        <el-form-item v-if="isAddSubMode && parentNodeData" label="上级组织">
          <div class="parent-org-display">
            <!-- <div class="org-icon" :class="getIconBgClass(parentNodeData.orgType)">
              <i :class="getNodeIcon(parentNodeData.orgType)"></i>
            </div> -->
            <div class="org-info">
              <div class="org-name">{{ parentNodeData.orgName }}</div>
              <!-- <div class="org-type">{{ getNodeTypeName(parentNodeData.orgType) }}</div> -->
            </div>
          </div>
        </el-form-item>

        <!-- 节点名称 -->
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入节点名称" />
        </el-form-item>
      </el-form>
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button class="cancel-btn" @click="handleClose">取消</el-button>
      <el-button class="confirm-btn" type="primary" :loading="submitLoading" @click="handleConfirm">
        {{ isEditMode ? '保存' : '添加' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    name: 'OrgNodeDialog',
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
      // 对话框模式: 'add' 添加同级, 'addSub' 添加下级, 'edit' 编辑
      mode: {
        type: String,
        default: 'add',
      },
      // 父级节点信息（添加下级时使用）
      parentNode: {
        type: Object,
        default: () => ({}),
      },
      // 当前选中的节点
      currentNode: {
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
          name: '',
          type: 'district',
          parentId: '',
        },
        rules: {
          name: [{ required: true, message: '请输入节点名称', trigger: 'blur' }],
        },
        submitLoading: false,
      };
    },
    computed: {
      dialogTitle() {
        if (this.mode === 'edit') return '编辑节点';
        if (this.mode === 'addSub') return '新增子级';
        return '添加节点';
      },
      isEditMode() {
        return this.mode === 'edit';
      },
      isAddSubMode() {
        return this.mode === 'addSub';
      },
      parentNodeData() {
        if (this.mode === 'addSub') {
          return this.parentNode;
        }
        return null;
      },
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
      initForm() {
        this.$nextTick(() => {
          this.$refs.form && this.$refs.form.clearValidate();
        });

        if (this.isEditMode && this.editData) {
          this.form = {
            name: this.editData.orgName || '',
            type: this.editData.orgType || 'district',
            parentId: this.editData.parentId || '',
          };
        } else {
          let type = 'district';
          if (this.mode === 'addSub' && this.parentNode) {
            const parentOrgType = this.parentNode.orgType;
            const typeMap = {
              1: 2,
              2: 3,
              3: 4,
              4: 4,
            };
            type = typeMap[parentOrgType] || 2;
          }
          this.form = {
            name: '',
            type: type,
            parentId: this.parentNodeData ? this.parentNodeData.id : (this.currentNode ? this.currentNode.id : ''),
          };
        }
      },

      getNodeIcon(type) {
        const icons = {
          1: 'el-icon-office-building',
          2: 'el-icon-school',
          3: 'el-icon-location',
          4: 'el-icon-user-solid',
        };
        return icons[type] || 'el-icon-s-cooperation';
      },

      getIconBgClass(type) {
        const classes = {
          1: 'root-bg',
          2: 'district-bg',
          3: 'school-bg',
          4: 'class-bg',
        };
        return classes[type] || 'default-bg';
      },

      getNodeTypeName(type) {
        const names = {
          1: '平台',
          2: '区域',
          3: '学校',
          4: '班级',
        };
        return names[type] || '组织';
      },

      // 关闭弹窗
      handleClose() {
        this.$emit('update:visible', false);
        this.$nextTick(() => {
          this.$refs.form && this.$refs.form.resetFields();
        });
      },

      // 确认提交
      handleConfirm() {
        this.$refs.form.validate(valid => {
          if (valid) {
            this.submitLoading = true;
            const params = {
              name: this.form.name,
            };

            if (this.isEditMode) {
              // 编辑模式
              params.id = this.editData.id;
              params.type = this.form.type;
              params.parentId = this.form.parentId;
            } else {
              // 新增模式
              params.parentId = this.parentNodeData ? this.parentNodeData.id : (this.currentNode ? this.currentNode.id : '');
              params.type = this.form.type;
            }

            this.$emit('confirm', params, this.mode);
            this.submitLoading = false;
          }
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  ::v-deep .org-node-dialog {
    border-radius: 12px;
    overflow: hidden;

    .el-dialog__header {
      display: none;
    }

    .el-dialog__body {
      padding: 0;
    }

    .el-dialog__footer {
      border-top: 1px solid #e5e7eb;
      padding: 16px 24px;
    }
  }

  .dialog-header {
    background: linear-gradient(135deg, #1677FF 0%, #0958d9 100%);
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
  }

  ::v-deep .el-form-item {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

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

  ::v-deep .el-input__inner {
    border-radius: 8px;
    border-color: #d1d5db;
    height: 40px;
    font-size: 14px;

    &:focus {
      border-color: #1677FF;
    }

    &::placeholder {
      color: #9ca3af;
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
      flex-shrink: 0;

      &.root-bg {
        background: linear-gradient(135deg, #1677FF 0%, #4096ff 100%);
      }
      &.district-bg {
        background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
      }
      &.school-bg {
        background: linear-gradient(135deg, #fa8c16 0%, #ffa940 100%);
      }
      &.grade-bg {
        background: linear-gradient(135deg, #722ed1 0%, #9254de 100%);
      }
      &.class-bg {
        background: linear-gradient(135deg, #eb2f96 0%, #f759ab 100%);
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

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .cancel-btn {
      min-width: 80px;
      height: 36px;
      border-radius: 6px;
      border-color: #d1d5db;
      color: #374151;

      &:hover {
        border-color: #9ca3af;
        color: #111827;
      }
    }

    .confirm-btn {
      min-width: 80px;
      height: 36px;
      border-radius: 6px;
      background: #1677FF;
      border: none;

      &:hover {
        background: #0958d9;
      }
    }
  }
</style>
