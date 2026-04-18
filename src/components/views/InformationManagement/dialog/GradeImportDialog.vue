<template>
  <el-dialog
    title="批量导入年级"
    :visible.sync="visible"
    width="700px"
    :close-on-click-modal="false"
    custom-class="grade-import-dialog"
    @close="handleClose"
  >
    <div class="import-content">
      <!-- 导入步骤说明 -->
      <div class="steps-section">
        <div class="step-item">
          <div class="step-number">1</div>
          <div class="step-content">
            <div class="step-title">下载导入模板文件</div>
            <div class="step-desc">获取标准模板，确保数据格式正确</div>
          </div>
        </div>
        <div class="step-arrow">
          <i class="el-icon-arrow-down"></i>
        </div>
        <div class="step-item">
          <div class="step-number">2</div>
          <div class="step-content">
            <div class="step-title">按照模板格式填写年级数据</div>
            <div class="step-desc">根据要求填写年级信息，确保数据完整准确</div>
          </div>
        </div>
        <div class="step-arrow">
          <i class="el-icon-arrow-down"></i>
        </div>
        <div class="step-item">
          <div class="step-number">3</div>
          <div class="step-content">
            <div class="step-title">上传填写好的文件</div>
            <div class="step-desc">选择填写完成的Excel文件进行上传</div>
          </div>
        </div>
        <div class="step-arrow">
          <i class="el-icon-arrow-down"></i>
        </div>
        <div class="step-item">
          <div class="step-number">4</div>
          <div class="step-content">
            <div class="step-title">预览并确认导入</div>
            <div class="step-desc">检查数据无误后，确认导入系统</div>
          </div>
        </div>
      </div>

      <!-- 步骤1：下载模板 -->
      <div class="section">
        <div class="section-title">
          <span class="step-tag">步骤 1</span>
          <span>下载模板</span>
        </div>
        <div class="section-content">
          <el-button type="primary" plain icon="el-icon-download" @click="handleDownloadTemplate">
            下载年级导入模板
          </el-button>
          <span class="template-tip">
            <i class="el-icon-info"></i>
            模板文件包含标准的数据格式和示例
          </span>
        </div>
      </div>

      <!-- 步骤2：上传文件 -->
      <div class="section">
        <div class="section-title">
          <span class="step-tag">步骤 2</span>
          <span>上传文件</span>
        </div>
        <div class="section-content">
          <el-upload
            ref="upload"
            class="upload-area"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="fileList"
            accept=".xls,.xlsx"
            :limit="1"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">点击上传或将拖拽文件到此处</div>
            <div class="el-upload__tip">支持 .xls, .xlsx 格式，文件大小不超过 5MB</div>
          </el-upload>
        </div>
      </div>

      <!-- 注意事项 -->
      <div class="section notice-section">
        <div class="section-title">
          <i class="el-icon-warning-outline"></i>
          <span>注意事项：</span>
        </div>
        <div class="section-content">
          <ul class="notice-list">
            <li>年级名称不能为空，且同一年级下不能重复</li>
            <li>所属学段只能是小学、初中、高中</li>
            <li>排序必须为数字格式，数字越小排序越靠前</li>
            <li>状态只能填写：启用/禁用</li>
            <li>单次最多导入 100 条数据</li>
          </ul>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :disabled="!canImport" :loading="importing" @click="handleConfirm">
          <i class="el-icon-check"></i>
          确认导入
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
  import gradeApi from '@/api/base.js';

  export default {
    name: 'GradeImportDialog',
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        fileList: [],
        currentFile: null,
        importing: false,
      };
    },
    computed: {
      canImport() {
        return this.currentFile !== null && !this.importing;
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
        this.currentFile = null;
        this.importing = false;
        this.$refs.upload && this.$refs.upload.clearFiles();
      },
      handleClose() {
        this.$emit('update:visible', false);
      },
      handleCancel() {
        this.$emit('update:visible', false);
      },
      async handleDownloadTemplate() {
        try {
          const response = await gradeApi.downloadTemplate();
          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = '年级导入模板.xlsx';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          this.$message.success('模板下载成功');
        } catch (error) {
          this.$message.error('模板下载失败');
        }
      },
      handleFileChange(file) {
        this.currentFile = file.raw;
        this.fileList = [file];
      },
      handleFileRemove() {
        this.currentFile = null;
        this.fileList = [];
      },
      async handleConfirm() {
        if (!this.currentFile) {
          this.$message.warning('请先选择要上传的文件');
          return;
        }

        this.importing = true;
        const formData = new FormData();
        formData.append('file', this.currentFile);
        let res = await gradeApi.import(formData);
        console.log('re========', res);

        if (res.code == 200) {
          this.$message.success('导入成功');
          this.$emit('confirm');
          this.$emit('update:visible', false);
        } else {
          this.$message.error(res.message || '导入失败');
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .grade-import-dialog {
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
      padding: 0;
    }

    ::v-deep .el-dialog__footer {
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
    }
  }

  .import-content {
    max-height: 600px;
    overflow-y: auto;
    padding: 24px;
  }

  // 步骤说明
  .steps-section {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;

    .step-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;

      .step-number {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .step-content {
        flex: 1;
        padding-top: 4px;

        .step-title {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }

        .step-desc {
          font-size: 12px;
          color: #6b7280;
        }
      }
    }

    .step-arrow {
      text-align: center;
      padding: 8px 0;

      i {
        font-size: 16px;
        color: #3b82f6;
      }
    }
  }

  // 通用区块
  .section {
    margin-bottom: 24px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 12px;

      .step-tag {
        background: #4f46e5;
        color: #fff;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
      }

      i {
        color: #f59e0b;
        font-size: 16px;
      }
    }

    .section-content {
      padding-left: 0;
    }
  }

  // 下载模板
  .template-tip {
    margin-left: 12px;
    font-size: 13px;
    color: #6b7280;

    i {
      color: #3b82f6;
      margin-right: 4px;
    }
  }

  // 上传区域
  .upload-area {
    ::v-deep .el-upload {
      width: 100%;

      .el-upload-dragger {
        width: 100%;
        height: 160px;
        border: 2px dashed #d1d5db;
        border-radius: 12px;
        background: #f9fafb;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;

        &:hover {
          border-color: #4f46e5;
          background: #f0f9ff;
        }

        .el-icon-upload {
          font-size: 40px;
          color: #9ca3af;
          margin-bottom: 12px;
        }

        .el-upload__text {
          font-size: 14px;
          color: #4b5563;

          em {
            color: #4f46e5;
            font-style: normal;
          }
        }

        .el-upload__tip {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 8px;
        }
      }
    }
  }

  // 注意事项
  .notice-section {
    background: #fffbeb;
    border: 1px solid #fcd34d;
    border-radius: 8px;
    padding: 16px;

    .section-title {
      color: #92400e;
      margin-bottom: 8px;

      i {
        color: #f59e0b;
      }
    }

    .notice-list {
      margin: 0;
      padding-left: 20px;
      list-style: disc;

      li {
        font-size: 13px;
        color: #92400e;
        line-height: 1.8;
      }
    }
  }

  // 底部按钮
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .el-button {
      padding: 9px 20px;
      border-radius: 8px;

      &--primary {
        background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
        border: none;

        &:hover {
          background: linear-gradient(135deg, #4338ca 0%, #2563eb 100%);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }
  }
</style>
