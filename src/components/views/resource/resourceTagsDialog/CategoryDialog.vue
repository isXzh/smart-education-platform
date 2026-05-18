<template>
  <el-dialog
    :title="isEdit ? '编辑分类' : '新增分类'"
    :visible.sync="visible"
    width="480px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-2">
          分类名称 <span class="text-red-500">*</span>
        </label>
        <el-input
          v-model="form.name"
          placeholder="请输入分类名称，如：课件、教案"
        />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">
            关联学科 <span class="text-red-500">*</span>
          </label>
          <el-select
            v-model="form.subject"
            placeholder="选择学科"
            class="w-full"
            @change="form.grade = ''"
          >
            <el-option
              v-for="s in subjects"
              :key="s"
              :label="s"
              :value="s"
            />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">
            关联学段 <span class="text-red-500">*</span>
          </label>
          <el-select
            v-model="form.grade"
            placeholder="选择学段"
            class="w-full"
            :disabled="!form.subject"
          >
            <el-option
              v-for="g in gradeLevels[form.subject] || []"
              :key="g"
              :label="g"
              :value="g"
            />
          </el-select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">排序</label>
          <el-input
            v-model.number="form.sort"
            type="number"
          />
        </div>
        <div class="flex items-center gap-3 pt-8">
          <el-switch
            v-model="form.status"
            active-value="enabled"
            inactive-value="disabled"
          />
          <span class="text-sm font-medium">
            {{ form.status === 'enabled' ? '启用' : '禁用' }}
          </span>
        </div>
      </div>
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
const subjects = ['数学', '语文', '英语', '物理', '化学', '生物'];
const gradeLevels = {
  '数学': ['小学数学', '初中数学', '高中数学'],
  '语文': ['小学语文', '初中语文', '高中语文'],
  '英语': ['小学英语', '初中英语', '高中英语'],
  '物理': ['初中物理', '高中物理'],
  '化学': ['初中化学', '高中化学'],
  '生物': ['初中生物', '高中生物'],
};

export default {
  name: 'CategoryDialog',
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
    categoryCount: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      form: {
        name: '',
        subject: '',
        grade: '',
        sort: 1,
        status: 'enabled',
      },
      subjects,
      gradeLevels,
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
        this.initForm();
      }
    },
  },
  methods: {
    initForm() {
      if (this.isEdit && this.editData) {
        this.form = {
          name: this.editData.name,
          subject: this.editData.grandparentName || '',
          grade: this.editData.parentName || '',
          sort: this.editData.sort,
          status: this.editData.status,
        };
      } else {
        this.form = {
          name: '',
          subject: '',
          grade: '',
          sort: this.categoryCount + 1,
          status: 'enabled',
        };
      }
    },
    handleClose() {
      this.$emit('close');
    },
    handleSubmit() {
      if (!this.form.name || !this.form.subject || !this.form.grade) {
        this.$message.warning('请填写完整信息');
        return;
      }
      this.$emit('submit', { ...this.form });
      this.visible = false;
    },
  },
};
</script>
