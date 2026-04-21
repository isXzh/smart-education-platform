<template>
  <el-dialog
    title="批量导入排课"
    :visible.sync="visible"
    width="600px"
    :close-on-click-modal="false"
    custom-class="schedule-import-dialog"
    @close="handleClose"
  >
    <div class="import-content">
      <div class="import-notice">
        <div class="notice-title">
          <i class="el-icon-info"></i>
          <span>导入说明</span>
        </div>
        <ul class="notice-list">
          <li>1. 下载导入模板，按照模板格式填写数据</li>
          <li>2. 模板包含：课程名称、课程类型、学科、教师、年级、日期、时间、地点、状态等</li>
          <li>3. 课程名称在同一时间段内不可重复</li>
          <li>4. 教师、学科、年级必须在系统中已存在</li>
          <li>5. 状态填写"已取消"、"已排课"、"进行中"或"已完成"</li>
        </ul>
      </div>

      <div class="download-section">
        <el-button type="primary" plain class="download-btn" @click="handleDownloadTemplate">
          <i class="el-icon-download"></i>
          下载导入模板
        </el-button>
      </div>

      <div class="upload-section">
        <div class="upload-label">上传文件</div>
        <el-upload
          ref="upload"
          class="upload-area"
          drag
          action=""
          :auto-upload="false"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :file-list="fileList"
          accept=".xlsx,.xls"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            点击上传或拖拽文件到此区域
          </div>
          <div class="el-upload__tip">
            支持 .xlsx, .xls 格式，文件大小不超过 10MB
          </div>
        </el-upload>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :disabled="!canImport" @click="handleImport">导入</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
  import schedule from '@/api/schedule';

  export default {
    name: 'ScheduleImportDialog',
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        fileList: [],
      };
    },
    computed: {
      canImport() {
        return this.fileList.length > 0;
      },
    },
    watch: {
      visible(val) {
        if (val) {
          this.resetForm();
        }
      },
    },
    methods: {
      resetForm() {
        this.fileList = [];
        if (this.$refs.upload) {
          this.$refs.upload.clearFiles();
        }
      },
      handleClose() {
        this.$emit('update:visible', false);
      },
      handleCancel() {
        this.$emit('update:visible', false);
      },
      async handleDownloadTemplate() {
        try {
          const response = await schedule.downloadTemplate();
          
          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = '排课导入模板.xlsx';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          this.$message.success('模板下载成功');
        } catch (error) {
          console.error('下载模板失败:', error);
          this.$message.error('下载模板失败');
        }
      },
      handleFileChange(file) {
        const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
        const isLt10M = file.size / 1024 / 1024 < 10;

        if (!isExcel) {
          this.$message.error('只能上传 .xlsx 或 .xls 格式的文件');
          this.$refs.upload.clearFiles();
          return false;
        }

        if (!isLt10M) {
          this.$message.error('文件大小不能超过 10MB');
          this.$refs.upload.clearFiles();
          return false;
        }

        this.fileList = [file];
        return true;
      },
      handleFileRemove() {
        this.fileList = [];
      },
      async handleImport() {
        if (this.fileList.length === 0) {
          this.$message.warning('请先上传文件');
          return;
        }

        try {
          const formData = new FormData();
          formData.append('file', this.fileList[0].raw);
          await schedule.importSchedules(formData);
          this.$message.success('导入成功');
          this.$emit('confirm');
          this.$emit('update:visible', false);
        } catch (error) {
          console.error('导入失败:', error);
          this.$message.error('导入失败');
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .schedule-import-dialog {
    ::v-deep .el-dialog__header {
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;

      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        color: #111827;
      }
    }

    ::v-deep .el-dialog__body {
      padding: 24px;
    }

    ::v-deep .el-dialog__footer {
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
    }
  }

  .import-content {
    .import-notice {
      background: #eff6ff;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 24px;

      .notice-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;

        i {
          color: #3b82f6;
          font-size: 16px;
        }

        span {
          color: #1d4ed8;
          font-weight: 500;
          font-size: 14px;
        }
      }

      .notice-list {
        margin: 0;
        padding-left: 0;
        list-style: none;

        li {
          color: #3b82f6;
          font-size: 13px;
          line-height: 1.8;
        }
      }
    }

    .download-section {
      margin-bottom: 24px;

      .download-btn {
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;

        i {
          margin-right: 6px;
        }
      }
    }

    .upload-section {
      .upload-label {
        font-size: 14px;
        font-weight: 500;
        color: #374151;
        margin-bottom: 12px;
        display: block;
      }

      .upload-area {
        ::v-deep .el-upload {
          width: 100%;
        }

        ::v-deep .el-upload-dragger {
          width: 100%;
          height: 200px;
          border: 2px dashed #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          &:hover {
            border-color: #4f46e5;
            background: #eff6ff;
          }

          .el-icon-upload {
            font-size: 48px;
            color: #9ca3af;
            margin-bottom: 16px;
          }

          .el-upload__text {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
          }

          .el-upload__tip {
            font-size: 12px;
            color: #9ca3af;
          }
        }

        ::v-deep .el-upload-list {
          margin-top: 16px;

          .el-upload-list__item {
            border-radius: 6px;
            border-color: #e5e7eb;

            &:hover {
              border-color: #4f46e5;
            }
          }
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
</style>
