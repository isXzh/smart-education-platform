<template>
  <el-dialog
    :visible.sync="visible"
    width="720px"
    :close-on-click-modal="false"
    custom-class="personal-detail-dialog"
    @close="handleClose"
  >
    <template #title>
      <div class="flex items-center gap-3">
        <i :class="getTypeIcon(detailData && detailData.type)" class="text-lg"></i>
        <span class="text-base font-semibold">{{ detailData && detailData.name }}</span>
      </div>
    </template>

    <div class="max-h-[70vh] overflow-y-auto">
      <div class="p-6 border-b border-gray-100">
        <h4 class="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
          <i class="el-icon-view text-blue-500"></i>
          基础信息
        </h4>
        <div class="grid grid-cols-2 gap-x-8 gap-y-4">
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-400 w-16 shrink-0">上传用户</span>
            <span class="text-sm text-gray-900 font-medium">{{ detailData && detailData.nickname }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-400 w-16 shrink-0">所属学校</span>
            <span class="text-sm text-gray-900">{{ detailData && detailData.school }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-400 w-16 shrink-0">年级学科</span>
            <span class="text-sm text-gray-900"
              >{{ detailData && detailData.grade }} / {{ detailData && detailData.subject }}</span
            >
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-400 w-16 shrink-0">资源类型</span>
            <el-tag size="mini" class="!border-blue-200 !text-blue-600 !bg-blue-50">{{
              detailData && detailData.type
            }}</el-tag>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-400 w-16 shrink-0">资源大小</span>
            <span class="text-sm text-gray-900">{{ detailData && detailData.size }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-400 w-16 shrink-0">上传时间</span>
            <span class="text-sm text-gray-900">{{ detailData && detailData.uploadTime }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-400 w-16 shrink-0">浏览次数</span>
            <span class="text-sm text-blue-600 font-medium">{{ detailData && detailData.views }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-400 w-16 shrink-0">下载次数</span>
            <span class="text-sm text-green-600 font-medium">{{ detailData && detailData.downloads }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-400 w-16 shrink-0">审核状态</span>
            <el-tag :type="getStatusType(detailData && detailData.status)" size="mini">{{
              getStatusLabel(detailData && detailData.status)
            }}</el-tag>
          </div>
          <div
            v-if="detailData && detailData.status === 'rejected' && detailData.rejectReason"
            class="col-span-2 flex items-start gap-3 bg-red-50 p-3 rounded-lg"
          >
            <i class="el-icon-warning text-red-500 mt-0.5 shrink-0"></i>
            <div>
              <span class="text-xs text-red-600 font-medium">驳回原因：</span>
              <span class="text-sm text-red-700">{{ detailData.rejectReason }}</span>
            </div>
          </div>
          <div class="col-span-2 flex items-center gap-3">
            <span class="text-xs text-gray-400 w-16 shrink-0">资源标签</span>
            <div class="flex flex-wrap gap-2">
              <el-tag size="mini" class="!bg-gray-50 !border-gray-200" type="info"
                ><i class="el-icon-price-tag mr-1"></i>同步课程</el-tag
              >
              <el-tag size="mini" class="!bg-gray-50 !border-gray-200" type="info"
                ><i class="el-icon-price-tag mr-1"></i>精品资源</el-tag
              >
              <el-tag size="mini" class="!bg-gray-50 !border-gray-200" type="info"
                ><i class="el-icon-price-tag mr-1"></i>推荐</el-tag
              >
            </div>
          </div>
        </div>
      </div>

      <div class="p-6">
        <h4 class="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
          <i class="el-icon-video-play text-blue-500"></i>
          资源内容
        </h4>
        <div class="bg-gray-100 rounded-lg flex items-center justify-center" style="height: 320px">
          <div
            v-if="detailData && detailData.type === '视频'"
            class="w-full h-full flex items-center justify-center bg-gray-900 rounded-lg relative overflow-hidden"
          >
            <video
              class="w-full h-full object-contain"
              controls
              poster="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=450&fit=crop"
            >
              <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
              您的浏览器不支持视频播放。
            </video>
          </div>
          <div v-else-if="detailData && detailData.type === '图片'" class="text-center">
            <i class="el-icon-picture-outline text-6xl text-purple-400 mb-3"></i>
            <p class="text-sm text-gray-500 mb-2">图片预览</p>
            <img
              src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop"
              alt="资源图片"
              class="max-w-full max-h-48 rounded-lg shadow-sm mx-auto"
            />
          </div>
          <div v-else class="text-center">
            <i class="el-icon-document text-6xl text-gray-400 mb-3"></i>
            <p class="text-sm text-gray-500 mb-1">{{ detailData && detailData.type }}文件预览</p>
            <p class="text-xs text-gray-400">点击下载后查看完整内容</p>
            <el-button type="primary" size="small" class="mt-4 !bg-[#1677FF] !border-[#1677FF]">下载文件</el-button>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
  const statusMap = {
    pending: { label: '待审核', type: 'warning' },
    approved: { label: '已通过', type: 'success' },
    rejected: { label: '已驳回', type: 'danger' },
  };

  export default {
    name: 'DetailDialog',
    props: {
      value: {
        type: Boolean,
        default: false,
      },
      detailData: {
        type: Object,
        default: null,
      },
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
    },
    methods: {
      handleClose() {
        this.$emit('close');
      },
      getStatusType(status) {
        return statusMap[status] ? statusMap[status].type : 'info';
      },
      getStatusLabel(status) {
        return statusMap[status] ? statusMap[status].label : status;
      },
      getTypeIcon(type) {
        const iconMap = {
          视频: 'el-icon-video-play text-blue-600',
          图片: 'el-icon-picture-outline text-purple-600',
          课件: 'el-icon-document text-orange-600',
          教案: 'el-icon-document text-green-600',
          试题: 'el-icon-document text-red-600',
          学案: 'el-icon-document text-cyan-600',
        };
        return iconMap[type] || 'el-icon-document text-gray-600';
      },
    },
  };
</script>

<style lang="scss" scoped>
  ::v-deep .personal-detail-dialog .el-dialog__header {
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
    padding: 16px 24px;
    margin-right: 0;
    .el-dialog__close {
      color: black !important;
    }
  }
  ::v-deep .personal-detail-dialog .el-dialog__body {
    padding: 0;
  }
</style>
