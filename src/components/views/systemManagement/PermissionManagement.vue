<template>
  <div>
    <div class="flex gap-6">
      <!-- 左侧角色列表 -->
      <div class="w-1/3">
        <el-card class="shadow-sm">
          <div class="p-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium">角色列表</h3>
              <el-button size="mini" @click="addRole">
                <i class="el-icon-plus"></i>
              </el-button>
            </div>
            <el-input
              v-model="roleFilter"
              placeholder="搜索角色"
              size="small"
              class="mb-4"
            >
              <i slot="prefix" class="el-icon-search el-input__icon"></i>
            </el-input>
            <el-menu
              :default-active="currentRole ? currentRole.id : ''"
              @select="selectRole"
            >
              <el-menu-item
                v-for="role in filteredRoles"
                :key="role.id"
                :index="role.id"
              >
                <span>{{ role.name }}</span>
                <span class="role-count">({{ role.userCount }})</span>
              </el-menu-item>
            </el-menu>
          </div>
        </el-card>
      </div>

      <!-- 右侧权限配置 -->
      <div class="w-2/3">
        <el-card class="shadow-sm" v-if="currentRole">
          <div class="p-6">
            <div class="mb-6">
              <h3 class="text-lg font-medium">角色权限配置 - {{ currentRole.name }}</h3>
              <p class="text-gray-600 text-sm">{{ currentRole.description }}</p>
            </div>

            <!-- 权限树 -->
            <div class="mb-6">
              <div class="flex justify-between items-center mb-4">
                <h4 class="font-medium">权限列表</h4>
                <div class="flex gap-2">
                  <el-button size="mini" @click="selectAll">全选</el-button>
                  <el-button size="mini" @click="unselectAll">取消全选</el-button>
                  <el-button size="mini" @click="expandAll">展开全部</el-button>
                  <el-button size="mini" @click="collapseAll">折叠全部</el-button>
                </div>
              </div>
              <el-tree
                ref="permissionTree"
                :data="permissionTree"
                show-checkbox
                node-key="id"
                :props="defaultProps"
                @check="handlePermissionCheck"
              >
                <template slot-scope="{ node, data }">
                  <span class="custom-tree-node">
                    <i :class="getPermissionIcon(data)" class="mr-2"></i>
                    <span>{{ data.label }}</span>
                  </span>
                </template>
              </el-tree>
            </div>

            <!-- 保存按钮 -->
            <div class="flex justify-end">
              <el-button @click="currentRole = null">取消</el-button>
              <el-button type="primary" @click="savePermissions">保存权限</el-button>
            </div>
          </div>
        </el-card>
        <el-card class="shadow-sm" v-else>
          <div class="p-8 text-center text-gray-400">
            <i class="el-icon-user" style="font-size: 48px; margin-bottom: 16px;"></i>
            <p>请选择一个角色进行权限配置</p>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="roleDialog.visible"
      width="500px"
    >
      <el-form
        ref="roleForm"
        :model="roleForm"
        :rules="roleRules"
        label-width="80px"
        size="small"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name"></el-input>
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="roleForm.code"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            type="textarea"
            v-model="roleForm.description"
            :rows="3"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="roleDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveRole">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'PermissionManagement',
  data() {
    return {
      roleFilter: '',
      currentRole: null,
      roleDialog: {
        visible: false
      },
      roleForm: {
        name: '',
        code: '',
        description: ''
      },
      roleRules: {
        name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
      },
      // 角色数据
      roles: [
        {
          id: 'R001',
          name: '超级管理员',
          code: 'super_admin',
          description: '系统超级管理员，拥有所有权限',
          userCount: 1
        },
        {
          id: 'R002',
          name: '学校管理员',
          code: 'school_admin',
          description: '学校管理员，管理学校范围内的用户和权限',
          userCount: 3
        },
        {
          id: 'R003',
          name: '教师',
          code: 'teacher',
          description: '教师角色，可以管理课程和查看学生信息',
          userCount: 25
        },
        {
          id: 'R004',
          name: '学生',
          code: 'student',
          description: '学生角色，可以查看课程和作业',
          userCount: 120
        }
      ],
      // 权限树数据
      permissionTree: [
        {
          id: '1',
          label: '课程管理',
          children: [
            {
              id: '1-1',
              label: '课程列表',
              children: [
                { id: '1-1-1', label: '查看课程', type: 'view' },
                { id: '1-1-2', label: '创建课程', type: 'create' },
                { id: '1-1-3', label: '编辑课程', type: 'edit' },
                { id: '1-1-4', label: '删除课程', type: 'delete' }
              ]
            },
            {
              id: '1-2',
              label: '排课管理',
              children: [
                { id: '1-2-1', label: '查看排课', type: 'view' },
                { id: '1-2-2', label: '创建排课', type: 'create' },
                { id: '1-2-3', label: '编辑排课', type: 'edit' },
                { id: '1-2-4', label: '删除排课', type: 'delete' },
                { id: '1-2-5', label: '导出课表', type: 'export' }
              ]
            }
          ]
        },
        {
          id: '2',
          label: '设备管理',
          children: [
            {
              id: '2-1',
              label: '设备列表',
              children: [
                { id: '2-1-1', label: '查看设备', type: 'view' },
                { id: '2-1-2', label: '添加设备', type: 'create' },
                { id: '2-1-3', label: '编辑设备', type: 'edit' },
                { id: '2-1-4', label: '删除设备', type: 'delete' },
                { id: '2-1-5', label: '导入设备', type: 'import' },
                { id: '2-1-6', label: '导出设备', type: 'export' }
              ]
            },
            {
              id: '2-2',
              label: '设备监控',
              children: [
                { id: '2-2-1', label: '查看监控', type: 'view' },
                { id: '2-2-2', label: '处理告警', type: 'handle' }
              ]
            }
          ]
        },
        {
          id: '3',
          label: '用户管理',
          children: [
            {
              id: '3-1',
              label: '用户列表',
              children: [
                { id: '3-1-1', label: '查看用户', type: 'view' },
                { id: '3-1-2', label: '添加用户', type: 'create' },
                { id: '3-1-3', label: '编辑用户', type: 'edit' },
                { id: '3-1-4', label: '删除用户', type: 'delete' },
                { id: '3-1-5', label: '重置密码', type: 'reset' }
              ]
            },
            {
              id: '3-2',
              label: '角色管理',
              children: [
                { id: '3-2-1', label: '查看角色', type: 'view' },
                { id: '3-2-2', label: '添加角色', type: 'create' },
                { id: '3-2-3', label: '编辑角色', type: 'edit' },
                { id: '3-2-4', label: '删除角色', type: 'delete' },
                { id: '3-2-5', label: '分配权限', type: 'assign' }
              ]
            }
          ]
        },
        {
          id: '4',
          label: '系统管理',
          children: [
            {
              id: '4-1',
              label: '系统设置',
              children: [
                { id: '4-1-1', label: '查看设置', type: 'view' },
                { id: '4-1-2', label: '修改设置', type: 'edit' }
              ]
            },
            {
              id: '4-2',
              label: '日志管理',
              children: [
                { id: '4-2-1', label: '查看日志', type: 'view' },
                { id: '4-2-2', label: '导出日志', type: 'export' }
              ]
            }
          ]
        }
      ],
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  computed: {
    filteredRoles() {
      if (!this.roleFilter) return this.roles
      return this.roles.filter(role =>
        role.name.indexOf(this.roleFilter) !== -1 ||
        role.code.indexOf(this.roleFilter) !== -1
      )
    }
  },
  methods: {
    selectRole(roleId) {
      this.currentRole = this.roles.find(role => role.id === roleId)
      // 加载角色已有权限
      this.$nextTick(() => {
        // 这里应该根据角色ID加载已有权限
        // 模拟数据
        const checkedKeys = ['1-1-1', '1-2-1', '2-1-1', '3-1-1', '4-1-1']
        this.$refs.permissionTree.setCheckedKeys(checkedKeys)
      })
    },
    addRole() {
      this.roleDialog.visible = true
      this.roleForm = {
        name: '',
        code: '',
        description: ''
      }
    },
    saveRole() {
      this.$refs.roleForm.validate((valid) => {
        if (valid) {
          // 这里应该调用API保存角色
          this.roleForm.id = 'R' + String(this.roles.length + 1).padStart(3, '0')
          this.roles.push({ ...this.roleForm })
          this.roleDialog.visible = false
          this.$message.success('保存成功')
        }
      })
    },
    getPermissionIcon(data) {
      const icons = {
        view: 'el-icon-view',
        create: 'el-icon-plus',
        edit: 'el-icon-edit',
        delete: 'el-icon-delete',
        export: 'el-icon-download',
        import: 'el-icon-upload2',
        reset: 'el-icon-key',
        assign: 'el-icon-s-check',
        handle: 'el-icon-warning'
      }
      return icons[data.type] || 'el-icon-document'
    },
    handlePermissionCheck(data, checked) {
      // 处理权限选择
      if (checked) {
        // 处理子节点自动选中
        this.checkAllChildren(data, true)
        // 处理父节点自动选中
        this.checkParent(data, true)
      } else {
        // 处理子节点自动取消
        this.checkAllChildren(data, false)
        // 处理兄弟节点自动取消
        this.checkSiblings(data, false)
      }
    },
    checkAllChildren(data, checked) {
      if (data.children && data.children.length > 0) {
        data.children.forEach(child => {
          this.$refs.permissionTree.setChecked(child.id, checked)
          this.checkAllChildren(child, checked)
        })
      }
    },
    checkParent(data, checked) {
      const parent = this.$refs.permissionTree.getNode(data.parentId)
      if (parent) {
        // 检查所有子节点是否都被选中
        const allChildrenChecked = parent.childNodes.every(child =>
          this.$refs.permissionTree.getCheckedNodes().includes(child.data)
        )
        this.$refs.permissionTree.setChecked(parent, allChildrenChecked)
        this.checkParent(parent, allChildrenChecked)
      }
    },
    checkSiblings(data, checked) {
      const parent = this.$refs.permissionTree.getNode(data.parentId)
      if (parent) {
        parent.childNodes.forEach(sibling => {
          if (sibling.data.id !== data.id && !this.hasCheckedChildren(sibling.data)) {
            this.$refs.permissionTree.setChecked(sibling, false)
          }
        })
      }
    },
    hasCheckedChildren(node) {
      if (!node.children) return false
      return node.children.some(child =>
        this.$refs.permissionTree.getCheckedNodes().includes(child)
      )
    },
    selectAll() {
      this.$refs.permissionTree.setCheckedNodes(this.permissionTree)
    },
    unselectAll() {
      this.$refs.permissionTree.setCheckedKeys([])
    },
    expandAll() {
      this.$refs.permissionTree.store.expandAll()
    },
    collapseAll() {
      this.$refs.permissionTree.store.collapseAll()
    },
    savePermissions() {
      // 这里应该调用API保存角色权限
      const checkedKeys = this.$refs.permissionTree.getCheckedKeys()
      console.log('保存权限:', checkedKeys)
      this.$message.success('权限配置保存成功')
    }
  }
}
</script>

<style scoped>
.custom-tree-node {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.role-count {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.el-menu-item {
  height: 40px;
  line-height: 40px;
}

.el-menu-item span.role-count {
  float: right;
}
</style>