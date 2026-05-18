<template>
  <el-dialog
    :visible.sync="visible"
    width="480px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <template #title>
      <div class="flex items-center gap-3">
        <i class="el-icon-chat-line-square text-amber-600 text-lg"></i>
        <span class="text-base font-semibold">驳回原因</span>
      </div>
    </template>

    <div class="p-6">
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <i class="el-icon-warning-outline text-amber-600 text-lg mt-0.5 shrink-0"></i>
          <div>
            <p class="text-sm font-medium text-amber-800 mb-1">资源「{{ rejectData && rejectData.name }}」被驳回</p>
            <p class="text-sm text-amber-700">{{ rejectData && rejectData.rejectReason }}</p>
          </div>
        </div>
      </div>
    </div>

    <div slot="footer" class="flex justify-end">
      <el-button @click="visible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'RejectReasonDialog',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    rejectData: {
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
  },
};
</script>
