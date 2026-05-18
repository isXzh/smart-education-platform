<template>
  <el-dialog
    :visible.sync="visible"
    width="480px"
    :close-on-click-modal="false"
    @close="handleClose"
    custom-class="batch-audit-dialog"
  >
    <div slot="title" class="flex items-center gap-3">
      <i
        :class="batchType === 'approve' ? 'el-icon-circle-check text-green-600' : 'el-icon-circle-close text-red-600'"
        class="text-lg"
      ></i>
      <span class="text-base font-semibold">批量{{ batchType === 'approve' ? '通过' : '驳回' }}</span>
    </div>

    <div class="p-6">
      <p class="text-sm text-gray-600 mb-4">
        确定要批量{{ batchType === 'approve' ? '通过' : '驳回' }}选中的
        <span class="font-medium text-gray-900">{{ selectedCount }}</span> 个资源吗？
      </p>
      <div v-if="batchType === 'reject'" class="mb-4">
        <label class="text-sm font-medium text-gray-700 mb-2 block">
          驳回原因 <span class="text-red-500">*</span>
        </label>
        <el-input v-model="rejectReason" type="textarea" :rows="4" placeholder="请输入批量驳回的原因..." />
      </div>
    </div>

    <div slot="footer" class="flex justify-end gap-3">
      <el-button @click="visible = false">取消</el-button>
      <el-button
        :type="batchType === 'approve' ? 'success' : 'danger'"
        :disabled="batchType === 'reject' && !rejectReason.trim()"
        @click="confirmBatchAudit"
      >
        确认{{ batchType === 'approve' ? '通过' : '驳回' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    name: 'BatchAuditDialog',
    props: {
      value: {
        type: Boolean,
        default: false,
      },
      batchType: {
        type: String,
        default: 'approve',
      },
      selectedCount: {
        type: Number,
        default: 0,
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
      confirmBatchAudit() {
        this.$emit('confirm', {
          type: this.batchType,
          reason: this.rejectReason,
        });
        this.visible = false;
      },
    },
  };
</script>
<style lang="scss" scoped>
  ::v-deep .batch-audit-dialog .el-dialog__header {
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
    padding: 16px 24px;
    margin-right: 0;
    .el-dialog__close {
      color: black !important;
    }
  }
</style>
