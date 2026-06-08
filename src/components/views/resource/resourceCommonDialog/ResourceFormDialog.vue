<template>
  <el-dialog
    :title="isEdit ? '编辑资源' : '新增资源'"
    :visible.sync="visible"
    width="640px"
    :close-on-click-modal="false"
    custom-class="resource-form-dialog"
    @close="handleClose"
  >
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1.5"> 主讲教师 <span class="text-red-500">*</span> </label>
        <el-select
          v-model="form.teacherId"
          placeholder="请选择主讲教师"
          class="w-full"
          filterable
          @change="handleTeacherChange"
        >
          <el-option
            v-for="teacher in teacherOptions"
            :key="teacher.id"
            :label="teacher.teacherName + (teacher.schoolName ? '（' + teacher.schoolName + '）' : '')"
            :value="teacher.id"
          />
        </el-select>
        <p class="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
          <i class="el-icon-info"></i>选择教师后将自动关联其任教学科和年级
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1.5"> 资源标题 <span class="text-red-500">*</span> </label>
        <el-input v-model="form.title" placeholder="请输入资源标题" maxlength="100" show-word-limit />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1.5"> 资源标签 <span class="text-red-500">*</span> </label>
        <div class="border border-gray-300 rounded-lg overflow-hidden">
          <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 w-16 shrink-0">分类</span>
              <el-select
                v-model="form.categoryId"
                placeholder="请先选择分类"
                size="small"
                class="flex-1"
                @change="handleCategoryChange"
              >
                <el-option v-for="cat in categoryOptions" :key="cat.id" :label="cat.name" :value="cat.id" />
              </el-select>
            </div>
          </div>
          <div v-if="!form.categoryId" class="px-4 py-10 text-center">
            <i class="el-icon-price-tag text-3xl text-gray-300 mb-2 block"></i>
            <p class="text-sm text-gray-400">请先选择分类，系统将为您推荐相关标签</p>
          </div>
          <div v-else class="p-4 space-y-3">
            <div v-if="tagList.length > 0">
              <div class="flex flex-wrap gap-2">
                <label
                  v-for="tag in tagList"
                  :key="tag.id"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-white border rounded-md cursor-pointer hover:border-blue-400 transition-colors"
                  :class="isTagSelected(tag.id) ? 'border-blue-400 bg-blue-50' : 'border-gray-200'"
                >
                  <input
                    type="checkbox"
                    class="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    :checked="isTagSelected(tag.id)"
                    :disabled="!isTagSelected(tag.id) && form.tagIds.length >= 3"
                    @change="handleTagChange(tag.id, $event)"
                  />
                  <span class="text-xs text-gray-700">{{ tag.name }}</span>
                </label>
              </div>
            </div>
            <div v-else class="text-center py-6 text-gray-400">
              <p class="text-sm">该分类暂无可用标签</p>
            </div>
          </div>
        </div>
        <p class="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
          <i class="el-icon-info"></i
          >{{ form.categoryId ? '已根据所选分类智能推荐相关标签，最多可选3个' : '获取标签管理资源分类对应的资源标签' }}
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1.5">资源描述</label>
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入资源描述"
          resize="none"
          maxlength="500"
          show-word-limit
        />
        <p class="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
          <i class="el-icon-info"></i>简要描述资源内容，帮助其他教师快速了解
        </p>
      </div>

      <div v-if="!isEdit">
        <label class="block text-sm font-medium mb-1.5"> 资源文件上传 <span class="text-red-500">*</span> </label>
        <div
          v-if="!uploadFile"
          class="border border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
          @click="triggerFileInput"
        >
          <i class="el-icon-upload text-2xl text-gray-400"></i>
          <p class="text-sm text-gray-500 mt-2">点击上传资源文件</p>
          <p class="text-xs text-gray-400">仅支持 MP4 格式</p>
        </div>
        <div v-else class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 min-w-0">
              <i class="el-icon-video-play text-2xl text-blue-500 shrink-0"></i>
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate" :title="uploadFile.name">{{ uploadFile.name }}</p>
                <p class="text-xs text-gray-400">{{ formatFileSize(uploadFile.size) }}</p>
              </div>
            </div>
            <el-button type="text" size="small" class="!text-red-500" @click="removeFile">
              <i class="el-icon-delete mr-1"></i>移除
            </el-button>
          </div>
        </div>
        <input ref="fileInput" type="file" accept=".mp4,video/mp4" class="hidden" @change="handleFileSelect" />
        <div v-if="uploading || uploadProgress > 0" class="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-medium text-blue-600">{{ uploadProgressText || '准备上传...' }}</span>
            <span class="text-xs font-medium text-blue-600">{{ uploadProgress }}%</span>
          </div>
          <el-progress
            :percentage="uploadProgress"
            :status="uploadStatus || undefined"
            :stroke-width="8"
            :show-text="false"
          />
        </div>
        <p class="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
          <i class="el-icon-info"></i>单个文件不超过500MB可直接上传，超过500MB将自动分片上传
        </p>
      </div>
    </div>

    <div slot="footer" class="flex justify-end gap-3">
      <el-button @click="visible = false">取消</el-button>
      <el-button
        type="primary"
        class="!bg-[#1677FF] !border-[#1677FF]"
        :disabled="!canSubmit"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ isEdit ? '确认保存' : '确认新增' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
  import SparkMD5 from 'spark-md5';
  import publicResourceApi from '@/api/publicResource.js';
  import teacherApi from '@/api/teacher.js';
  import resourceTagApi from '@/api/resourceTag.js';

  const CHUNK_SIZE = 5 * 1024 * 1024;
  const SIZE_LIMIT = 500 * 1024 * 1024;

  export default {
    name: 'ResourceFormDialog',
    props: {
      value: {
        type: Boolean,
        default: false,
      },
      isEdit: {
        type: Boolean,
        default: false,
      },
      editData: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        form: {
          teacherId: '',
          title: '',
          categoryId: '',
          tagIds: [],
          description: '',
          stageId: '',
          gradeId: '',
          subjectId: '',
        },
        detailData: null,
        teacherOptions: [],
        categoryOptions: [],
        tagList: [],
        uploadFile: null,
        fileMd5: '',
        uploadProgress: 0,
        uploadStatus: '',
        uploadProgressText: '',
        uploading: false,
        submitting: false,
      };
    },
    computed: {
      visible: {
        get() {
          return this.value;
        },
        set(val) {
          this.$emit('input', val);
        },
      },
      canSubmit() {
        if (!this.form.teacherId || !this.form.title.trim()) return false;
        if (this.isEdit) return true;
        return !this.uploading && this.fileMd5 !== '';
      },
    },
    watch: {
      value(val) {
        if (val) {
          this.loadTeacherOptions();
          this.loadCategoryOptions();
          if (this.isEdit && this.editData) {
            this.loadDetail(this.editData.id);
          } else {
            this.initForm();
          }
        }
      },
    },
    methods: {
      async loadDetail(id) {
        try {
          const res = await publicResourceApi.getById(id);
          this.detailData = res.data || {};
          this.initFormWithDetail(this.detailData);
        } catch (e) {
          console.error(e);
          this.initForm();
        }
      },
      initForm() {
        this.form = {
          teacherId: '',
          title: '',
          categoryId: '',
          tagIds: [],
          description: '',
          stageId: '',
          gradeId: '',
          subjectId: '',
        };
        this.tagList = [];
        this.uploadFile = null;
        this.fileMd5 = '';
        this.uploadProgress = 0;
        this.uploadStatus = '';
        this.uploadProgressText = '';
        this.uploading = false;
        this.submitting = false;
        this.detailData = null;
      },
      initFormWithDetail(detail) {
        this.form = {
          teacherId: detail.teacherId || '',
          title: detail.title || '',
          categoryId: '',
          tagIds: detail.tagIds || [],
          description: detail.description || '',
          stageId: detail.stageId || '',
          gradeId: detail.gradeId || '',
          subjectId: detail.subjectId || '',
        };
        this.uploadFile = null;
        this.fileMd5 = '';
        this.uploadProgress = 0;
        this.uploadStatus = '';
        this.uploadProgressText = '';
        this.uploading = false;
        this.submitting = false;

        if (detail.tagIds && detail.tagIds.length > 0) {
          this.loadTagListForEdit(detail.tagIds);
        }
      },
      async loadTagListForEdit(tagIds) {
        try {
          const res = await resourceTagApi.tagList();
          const allTags = res.data || [];
          if (allTags.length > 0 && tagIds.length > 0) {
            const matchedTag = allTags.find(t => t.id === tagIds[0]);
            if (matchedTag) {
              this.form.categoryId = matchedTag.categoryId;
              await this.loadTagList(matchedTag.categoryId);
            }
          }
        } catch (e) {
          console.error(e);
        }
      },
      async loadTeacherOptions() {
        try {
          const res = await teacherApi.page({ pageNum: 1, pageSize: 9999 });
          this.teacherOptions = res.data?.list || [];
        } catch (e) {
          console.error(e);
        }
      },
      async loadCategoryOptions() {
        try {
          const res = await resourceTagApi.categoryList();
          this.categoryOptions = res.data || [];
        } catch (e) {
          console.error(e);
        }
      },
      async loadTagList(categoryId) {
        try {
          const res = await resourceTagApi.tagList(categoryId);
          this.tagList = res.data || [];
        } catch (e) {
          console.error(e);
        }
      },
      handleTeacherChange(teacherId) {
        const teacher = this.teacherOptions.find(t => t.id === teacherId);
        if (teacher) {
          if (teacher.teachingList && teacher.teachingList.length > 0) {
            const teaching = teacher.teachingList[0];
            this.form.subjectId = teaching.subjectId || '';
            this.form.gradeId = teaching.gradeId || '';
          }
          if (teacher.stageId) {
            this.form.stageId = teacher.stageId;
          }
        }
      },
      handleCategoryChange(categoryId) {
        this.form.tagIds = [];
        if (categoryId) {
          this.loadTagList(categoryId);
        } else {
          this.tagList = [];
        }
      },
      isTagSelected(tagId) {
        return this.form.tagIds.includes(tagId);
      },
      handleTagChange(tagId, event) {
        const checked = event.target.checked;
        if (checked) {
          if (this.form.tagIds.length < 3) {
            this.form.tagIds.push(tagId);
          }
        } else {
          this.form.tagIds = this.form.tagIds.filter(id => id !== tagId);
        }
      },
      triggerFileInput() {
        this.$refs.fileInput.click();
      },
      handleFileSelect(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.name.toLowerCase().endsWith('.mp4') && file.type !== 'video/mp4') {
          this.$message.warning('仅支持上传 MP4 格式文件');
          return;
        }
        this.uploadFile = file;
        this.fileMd5 = '';
        this.uploadProgress = 0;
        this.uploadStatus = '';
        this.uploadProgressText = '';
        this.startUpload(file);
      },
      removeFile() {
        this.uploadFile = null;
        this.fileMd5 = '';
        this.uploadProgress = 0;
        this.uploadStatus = '';
        this.uploadProgressText = '';
        this.uploading = false;
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = '';
        }
      },
      async startUpload(file) {
        this.uploading = true;
        try {
          if (file.size <= SIZE_LIMIT) {
            await this.uploadSmallFile(file);
          } else {
            await this.uploadLargeFile(file);
          }
        } catch (e) {
          console.error(e);
          this.uploadStatus = 'exception';
          this.uploadProgressText = '上传失败，请重试';
          this.uploading = false;
        }
      },
      async uploadSmallFile(file) {
        this.uploadProgressText = '正在上传...';
        const formData = new FormData();
        formData.append('file', file);
        try {
          const res = await publicResourceApi.uploadVideo(formData);
          this.fileMd5 = res.data?.fileMd5 || '';
          this.uploadProgress = 100;
          this.uploadStatus = 'success';
          this.uploadProgressText = '上传完成';
          this.uploading = false;
        } catch (e) {
          this.uploadStatus = 'exception';
          this.uploadProgressText = '上传失败';
          this.uploading = false;
          throw e;
        }
      },
      async uploadLargeFile(file) {
        this.uploadProgressText = '正在计算文件MD5...';
        const fileMd5 = await this.calculateFileMd5(file);
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

        this.uploadProgressText = `开始分片上传，共 ${totalChunks} 个分片`;

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
          const start = chunkIndex * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);

          const formData = new FormData();
          formData.append('chunkFile', chunk);
          formData.append('chunkIndex', chunkIndex);
          formData.append('totalChunks', totalChunks);
          formData.append('fileMd5', fileMd5);

          await publicResourceApi.uploadChunk(formData);
          this.uploadProgress = Math.round(((chunkIndex + 1) / totalChunks) * 90);
          this.uploadProgressText = `分片 ${chunkIndex + 1}/${totalChunks} 上传完成`;
        }

        this.uploadProgressText = '正在合并分片...';
        const mergeRes = await publicResourceApi.mergeChunks({
          fileMd5: fileMd5,
          fileName: file.name,
          totalChunks: totalChunks,
        });

        this.fileMd5 = mergeRes.data?.fileMd5 || '';
        this.uploadProgress = 100;
        this.uploadStatus = 'success';
        this.uploadProgressText = '上传完成';
        this.uploading = false;
      },
      calculateFileMd5(file) {
        return new Promise((resolve, reject) => {
          const spark = new SparkMD5.ArrayBuffer();
          const reader = new FileReader();
          const chunkSize = 2 * 1024 * 1024;
          const totalChunks = Math.ceil(file.size / chunkSize);
          let currentChunk = 0;

          reader.onload = e => {
            spark.append(e.target.result);
            currentChunk++;
            if (currentChunk < totalChunks) {
              const start = currentChunk * chunkSize;
              const end = Math.min(start + chunkSize, file.size);
              reader.readAsArrayBuffer(file.slice(start, end));
            } else {
              resolve(spark.end());
            }
          };

          reader.onerror = e => reject(e);
          reader.readAsArrayBuffer(file.slice(0, Math.min(chunkSize, file.size)));
        });
      },
      formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      },
      handleClose() {
        this.$emit('close');
      },
      async handleSubmit() {
        if (!this.form.teacherId) {
          this.$message.warning('请选择主讲教师');
          return;
        }
        if (!this.form.title.trim()) {
          this.$message.warning('请输入资源标题');
          return;
        }

        this.submitting = true;
        try {
          const data = {
            title: this.form.title,
            teacherId: this.form.teacherId,
            tagIds: this.form.tagIds,
            description: this.form.description,
            stageId: this.form.stageId || undefined,
            gradeId: this.form.gradeId || undefined,
            subjectId: this.form.subjectId || undefined,
            publishStatus: 0,
          };

          if (this.isEdit) {
            data.id = this.editData.id;
            await publicResourceApi.update(this.editData.id, data);
            this.$message.success('编辑成功');
          } else {
            if (!this.fileMd5) {
              this.$message.warning('请上传资源文件');
              this.submitting = false;
              return;
            }
            data.fileMd5 = this.fileMd5;
            await publicResourceApi.add(data);
            this.$message.success('新增成功');
          }
          this.$emit('confirm');
          this.visible = false;
        } catch (e) {
          console.error(e);
        } finally {
          this.submitting = false;
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  ::v-deep .resource-form-dialog .el-dialog__header {
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
    padding: 16px 24px;
    margin-right: 0;
    .el-dialog__title {
      color: black;
    }
    .el-dialog__close {
      color: black !important;
    }
  }

  ::v-deep .resource-form-dialog .el-dialog__body {
    padding: 24px;
  }
</style>
