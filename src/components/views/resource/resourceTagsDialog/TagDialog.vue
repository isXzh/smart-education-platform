<template>
  <el-dialog
    :title="isEdit ? '编辑标签' : '新增标签'"
    :visible.sync="visible"
    width="480px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1.5"> 标签名称 <span class="text-red-500">*</span> </label>
        <el-input v-model="form.name" placeholder="请输入标签名称" />
      </div>
      <!-- <div>
        <label class="block text-sm font-medium mb-1.5">
          所属分类 <span class="text-red-500">*</span>
        </label>
        <el-select v-model="form.categoryId" placeholder="请选择分类" class="w-full">
          <el-option
            v-for="category in enabledCategories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
      </div> -->
      <div>
        <label class="block text-sm font-medium mb-1.5">描述</label>
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入标签描述" resize="none" />
      </div>
      <!-- <div>
        <label class="block text-sm font-medium mb-1.5">状态</label>
        <el-select v-model="form.status" class="w-full">
          <el-option label="启用" value="enabled" />
          <el-option label="禁用" value="disabled" />
        </el-select>
      </div> -->
    </div>
    <div slot="footer" class="flex justify-end gap-3">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" class="!bg-[#1677FF] !border-[#1677FF]" @click="handleSubmit">
        {{ isEdit ? '保存修改' : '确认新增' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    name: 'TagDialog',
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
      categories: {
        type: Array,
        default: () => [],
      },
      defaultCategoryId: {
        type: [Number, String],
        default: '',
      },
    },
    data() {
      return {
        form: {
          name: '',
          categoryId: '',
          description: '',
          status: 'enabled',
        },
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
      enabledCategories() {
        return this.categories.filter(c => c.status === 'enabled');
      },
    },
    watch: {
      value(val) {
        if (val) {
          this.initForm();
        }
      },
    },
    methods: {
      initForm() {
        if (this.isEdit && this.editData) {
          this.form = {
            name: this.editData.name,
            categoryId: this.editData.categoryId,
            description: this.editData.description,
            status: this.editData.status,
          };
        } else {
          this.form = {
            name: '',
            categoryId: this.defaultCategoryId,
            description: '',
            status: 'enabled',
          };
        }
      },
      handleClose() {
        this.$emit('close');
      },
      handleSubmit() {
        if (!this.form.name.trim() || !this.form.categoryId) {
          this.$message.warning('请填写完整信息');
          return;
        }
        this.$emit('submit', { ...this.form });
        this.visible = false;
      },
    },
  };
</script>
