<template>
  <el-dialog
    title="批量导入学校"
    :visible="visible"
    width="480px"
    custom-class="import-dialog"
    @close="handleClose"
  >
    <div class="import-content">
      <div class="import-tips">
        <h4 class="tips-title">导入说明</h4>
        <ul class="tips-list">
          <li>请使用 Excel 文件（.xlsx 或 .xls 格式）</li>
          <li>文件大小不超过 10MB</li>
          <li>单次导入最多 1000 条数据</li>
          <li>请先下载导入模板，按模板格式填写数据</li>
        </ul>
      </div>
      <el-upload
        class="upload-area"
        drag
        action=""
        :auto-upload="false"
        :on-change="handleFileChange"
        :file-list="fileList"
        accept=".xlsx,.xls"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">点击或拖拽文件到此处上传</div>
        <div class="el-upload__tip">支持 .xlsx, .xls 格式</div>
      </el-upload>
      <el-button
        class="btn-outline"
        style="width: 100%; margin-top: 16px"
        :loading="downloadLoading"
        @click="handleDownloadTemplate"
      >
        <i class="el-icon-download"></i>
        下载导入模板
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
  import schoolApi from '@/api/school';

  export default {
    name: 'SchoolImportDialog',
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        fileList: [],
        downloadLoading: false,
      };
    },
    methods: {
      handleClose() {
        this.fileList = [];
        this.$emit('update:visible', false);
        this.$emit('close');
      },
      async handleFileChange(file) {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file.raw);
        try {
          const res = await schoolApi.import(formData);
          if (res.code === 200) {
            this.$message.success('批量导入成功');
            this.$emit('update:visible', false);
            this.$emit('close');
          } else {
            this.$message.error(res.message || '导入失败');
          }
        } catch (error) {
          this.$message.error('导入失败，请检查文件格式');
        }
        this.fileList = [];
      },
      async handleDownloadTemplate() {
        this.downloadLoading = true;
        try {
          const res = await schoolApi.downloadTemplate();
          const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = '学校导入模板.xlsx';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          this.$message.success('模板下载成功');
        } catch (error) {
          this.$message.error('下载模板失败');
        } finally {
          this.downloadLoading = false;
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .btn-outline {
    border-color: #d9d9d9;
    color: #606266;

    &:hover,
    &:focus {
      border-color: #1677ff;
      color: #1677ff;
    }
  }

  ::v-deep .import-dialog {
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
  }
  // ::v-deep .import-dialog .el-dialog__headerbtn .el-dialog__close {
  //   color: black;
  // }
  .import-content {
    .import-tips {
      background: #e6f7ff;
      border: 1px solid #91d5ff;
      border-radius: 4px;
      padding: 12px 16px;
      margin-bottom: 16px;

      .tips-title {
        font-size: 14px;
        font-weight: 500;
        color: #096dd9;
        margin: 0 0 8px;
      }

      .tips-list {
        margin: 0;
        padding-left: 16px;
        color: #1890ff;
        font-size: 12px;
        line-height: 1.8;
      }
    }

    .upload-area {
      ::v-deep .el-upload {
        width: 100%;
      }

      ::v-deep .el-upload-dragger {
        width: 100%;
        height: 160px;
      }
    }
  }
</style>
