<template>
  <el-dialog
    :visible.sync="visible"
    width="480px"
    :close-on-click-modal="false"
    @close="handleClose"
    custom-class="audit-dialog"
  >
    <template #title>
      <div class="flex items-center gap-3">
        <i
          :class="auditType === 'approve' ? 'el-icon-circle-check text-green-600' : 'el-icon-circle-close text-red-600'"
          class="text-lg"
        ></i>
        <span class="text-base font-semibold">{{ auditType === 'approve' ? '确认通过' : '确认驳回' }}</span>
      </div>
    </template>

    <div class="p-6">
      <p class="text-sm text-gray-600 mb-4">
        确定要{{ auditType === 'approve' ? '通过' : '驳回' }}资源
        <span class="font-medium text-gray-900">「{{ auditData && auditData.name }}」</span> 吗？
      </p>
      <div v-if="auditType === 'reject'" class="mb-4">
        <label class="text-sm font-medium text-gray-700 mb-2 block">
          驳回原因 <span class="text-red-500">*</span>
        </label>
        <el-input v-model="rejectReason" type="textarea" :rows="4" placeholder="请输入驳回原因，这将反馈给上传者..." />
        <p class="text-xs text-gray-400 mt-1">上传者将能够看到此驳回原因</p>
      </div>
      <div v-if="auditType === 'approve'" class="bg-green-50 p-3 rounded-lg flex items-start gap-2">
        <i class="el-icon-circle-check text-green-600 mt-0.5 shrink-0"></i>
        <p class="text-sm text-green-700">通过后，该资源将对其他用户可见并可被下载使用。</p>
      </div>
    </div>

    <div slot="footer" class="flex justify-end gap-3">
      <el-button @click="visible = false">取消</el-button>
      <el-button
        :type="auditType === 'approve' ? 'success' : 'danger'"
        :disabled="auditType === 'reject' && !rejectReason.trim()"
        @click="confirmAudit"
      >
        {{ auditType === 'approve' ? '确认通过' : '确认驳回' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    name: 'AuditDialog',
    props: {
      value: {
        type: Boolean,
        default: false,
      },
      auditData: {
        type: Object,
        default: null,
      },
      auditType: {
        type: String,
        default: 'approve',
      },
    },
    data() {
      return {
        rejectReason: '',
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
    },
    watch: {
      value(val) {
        if (val) {
          this.rejectReason = '';
        }
      },
    },
    methods: {
      handleClose() {
        this.$emit('close');
      },
      confirmAudit() {
        this.$emit('confirm', {
          type: this.auditType,
          reason: this.rejectReason,
        });
        this.visible = false;
      },
    },
  };
</script>
<style lang="scss" scoped>
  ::v-deep .audit-dialog .el-dialog__header {
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
    padding: 16px 24px;
    margin-right: 0;
    .el-dialog__close {
      color: black !important;
    }
  }
</style>
