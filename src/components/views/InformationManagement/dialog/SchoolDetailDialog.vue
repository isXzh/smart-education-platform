<template>
  <el-dialog
    title="学校详情"
    :visible="visible"
    width="560px"
    custom-class="school-detail-dialog"
    @close="handleClose"
  >
    <div v-if="school" class="detail-content">
      <div class="detail-grid">
        <div class="detail-item">
          <label class="detail-label">学校代码</label>
          <span class="detail-value">{{ school.schoolCode }}</span>
        </div>
        <div class="detail-item">
          <label class="detail-label">学校名称</label>
          <span class="detail-value">{{ school.schoolName }}</span>
        </div>
        <div class="detail-item">
          <label class="detail-label">所属组织</label>
          <span class="detail-value">{{ school.orgName }}</span>
        </div>
        <div class="detail-item">
          <label class="detail-label">学校类型</label>
          <span class="detail-value">{{ school.schoolTypeName }}</span>
        </div>
        <div class="detail-item">
          <label class="detail-label">联系人</label>
          <span class="detail-value">{{ school.contactPerson }}</span>
        </div>
        <div class="detail-item">
          <label class="detail-label">联系电话</label>
          <span class="detail-value">{{ school.contactPhone }}</span>
        </div>
        <div class="detail-item full-width">
          <label class="detail-label">所在地址</label>
          <span class="detail-value">{{ school.address }}</span>
        </div>
        <div class="detail-item">
          <label class="detail-label">排序号</label>
          <span class="detail-value">{{ school.sortOrder }}</span>
        </div>
        <div class="detail-item">
          <label class="detail-label">状态</label>
          <el-tag :type="school.status ? 'success' : 'info'" size="small">
            {{ school.status ? '启用' : '禁用' }}
          </el-tag>
        </div>
        <div class="detail-item">
          <label class="detail-label">创建时间</label>
          <span class="detail-value">{{ school.createdAt.split('T').join(' ') }}</span>
        </div>
        <div class="detail-item full-width">
          <label class="detail-label">备注</label>
          <span class="detail-value">{{ school.remark || '-' }}</span>
        </div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    name: 'SchoolDetailDialog',
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
      school: {
        type: Object,
        default: null,
      },
    },
    methods: {
      handleClose() {
        this.$emit('update:visible', false);
        this.$emit('close');
      },
    },
  };
</script>

<style lang="scss" scoped>
  ::v-deep .school-detail-dialog {
    .el-dialog__header {
      border-bottom: 1px solid #ebeef5;
      padding: 16px 24px;
      background-color: white;
      .el-dialog__headerbtn .el-dialog__close {
        color: black;
      }
      .el-dialog__title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .el-dialog__body {
      padding: 20px 24px;
    }

    .el-dialog__footer {
      border-top: 1px solid #ebeef5;
      padding: 12px 24px;
    }
  }

  .detail-content {
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;

      .detail-item {
        &.full-width {
          grid-column: span 2;
        }

        .detail-label {
          display: block;
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
        }

        .detail-value {
          font-size: 14px;
          color: #303133;
        }
      }
    }
  }
</style>
