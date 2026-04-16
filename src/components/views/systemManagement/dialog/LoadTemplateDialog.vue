<template>
  <el-dialog
    title="加载权限模板"
    :visible.sync="dialogVisible"
    width="560px"
    :close-on-click-modal="false"
    custom-class="load-template-dialog"
  >
    <div class="p-6">
      <!-- 模板列表 -->
      <div class="space-y-3">
        <div
          v-for="template in templates"
          :key="template.id"
          class="border rounded-lg p-4 cursor-pointer transition-all"
          :class="selectedTemplate && selectedTemplate.id === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'"
          @click="selectedTemplate = template"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="font-semibold text-gray-800">{{ template.name }}</span>
                <el-tag size="mini" type="success" effect="dark">{{ template.progress }}% 权限</el-tag>
              </div>
              <p class="text-sm text-gray-500 mb-2">{{ template.description }}</p>
              <div class="flex items-center gap-4 text-xs text-gray-400">
                <span>已配置 {{ template.configured }}/{{ template.total }} 个模块</span>
              </div>
            </div>
            <div class="ml-4">
              <div
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                :class="selectedTemplate && selectedTemplate.id === template.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'"
              >
                <i v-if="selectedTemplate && selectedTemplate.id === template.id" class="el-icon-check text-white text-xs"></i>
              </div>
            </div>
          </div>

          <!-- 模块预览 -->
          <div v-if="template.modules && template.modules.length > 0" class="mt-3 pt-3 border-t border-gray-100">
            <div class="flex items-center gap-4 text-xs text-gray-500">
              <div v-for="module in template.modules.slice(0, 4)" :key="module" class="flex items-center gap-1">
                <i class="el-icon-check text-green-500"></i>
                <span>{{ module }}</span>
              </div>
              <span v-if="template.modules.length > 4" class="text-gray-400">...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用提示 -->
      <div class="mt-4 bg-green-50 rounded-lg p-3 border border-green-100">
        <div class="flex items-start gap-2">
          <i class="el-icon-info text-green-600 text-sm mt-0.5"></i>
          <div class="flex-1 text-xs text-green-700 space-y-1">
            <p>• 点击"加载"按钮将模板权限应用到当前选中的角色</p>
            <p>• 加载模板会覆盖当前角色的权限配置，请谨慎操作</p>
            <p>• 可以删除不再使用的模板</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="flex justify-between items-center p-4 border-t border-gray-100">
      <el-button type="text" class="text-red-500" :disabled="!selectedTemplate" @click="deleteTemplate">
        <i class="el-icon-delete mr-1"></i>
        删除模板
      </el-button>
      <div class="flex gap-3">
        <el-button @click="handleCancel">关闭</el-button>
        <el-button type="success" :disabled="!selectedTemplate" :loading="loading" @click="loadTemplate">
          <i class="el-icon-check mr-1"></i>
          加载
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'LoadTemplateDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      selectedTemplate: null,
      templates: [
        {
          id: 1,
          name: '只读权限',
          description: '所有模块仅查看权限',
          progress: 77,
          configured: 10,
          total: 13,
          modules: ['schedule', 'schedule_manage', 'schedule_view', 'device']
        }
      ]
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  methods: {
    handleCancel() {
      this.dialogVisible = false
      this.selectedTemplate = null
    },
    loadTemplate() {
      if (!this.selectedTemplate) return

      this.loading = true
      setTimeout(() => {
        this.loading = false
        this.$emit('select', this.selectedTemplate)
        this.dialogVisible = false
        this.selectedTemplate = null
      }, 500)
    },
    deleteTemplate() {
      if (!this.selectedTemplate) return

      this.$confirm('确认删除该模板吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.templates.findIndex(t => t.id === this.selectedTemplate.id)
        if (index > -1) {
          this.templates.splice(index, 1)
          this.selectedTemplate = null
        }
        this.$message.success('删除成功')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.load-template-dialog {
  ::v-deep .el-dialog__header {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    padding: 20px 24px;
    margin: 0;

    .el-dialog__title {
      color: white;
      font-size: 18px;
      font-weight: 500;
    }

    .el-dialog__headerbtn .el-dialog__close {
      color: white;

      &:hover {
        color: #f0f0f0;
      }
    }
  }

  ::v-deep .el-dialog__body {
    padding: 0;
  }

  ::v-deep .el-dialog__footer {
    padding: 16px 24px;
  }
}

::v-deep .el-button {
  border-radius: 6px;
}
</style>
