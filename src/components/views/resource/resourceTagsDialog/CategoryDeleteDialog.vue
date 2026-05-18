<template>
  <el-dialog
    title="确认删除分类"
    :visible.sync="visible"
    width="400px"
    @close="handleClose"
    custom-class="category-delete-dialog"
    top="30vh"
  >
    <div class="flex items-center gap-4 mb-4">
      <div class="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
        <i class="el-icon-warning text-red-500 text-2xl"></i>
      </div>
      <div>
        <h3 class="text-lg font-semibold">确认删除分类</h3>
        <p class="text-sm text-gray-500">此操作不可恢复</p>
      </div>
    </div>
    <p class="text-sm text-gray-600 mb-6">确定要删除该分类吗？删除后无法恢复。</p>
    <div slot="footer" class="flex justify-end gap-3">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="danger" @click="handleConfirm">确认删除</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'CategoryDeleteDialog',
  props: {
    value: {
      type: Boolean,
      default: false,
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
    handleConfirm() {
      this.$emit('confirm');
      this.visible = false;
    },
  },
};
</script>
<style>
.category-delete-dialog .el-dialog__header {
  display:none;
}
</style>