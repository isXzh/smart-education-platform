<template>
  <div>
    <!-- 操作栏 -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex justify-between items-center">
        <div class="flex gap-4">
          <el-button type="primary" size="small" @click="addRole">
            <i class="el-icon-plus mr-1"></i>添加角色
          </el-button>
          <el-button size="small" @click="batchDelete" :disabled="!selectedRoles.length">
            <i class="el-icon-delete mr-1"></i>批量删除
          </el-button>
        </div>
        <div class="flex gap-4">
          <el-input
            v-model="filters.search"
            placeholder="搜索角色"
            size="small"
            style="width: 200px"
          >
            <i slot="prefix" class="el-icon-search el-input__icon"></i>
          </el-input>
        </div>
      </div>
    </div>

    <!-- 角色列表 -->
    <el-card class="shadow-sm">
      <el-table
        :data="roles"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="角色ID" width="80"></el-table-column>
        <el-table-column prop="name" label="角色名称" width="120"></el-table-column>
        <el-table-column prop="code" label="角色编码" width="120"></el-table-column>
        <el-table-column prop="description" label="描述" min-width="200"></el-table-column>
        <el-table-column prop="userCount" label="用户数" width="80"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160"></el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="editRole(scope.row)">编辑</el-button>
            <el-button size="mini" type="primary" @click="assignPermission(scope.row)">分配权限</el-button>
            <el-button size="mini" type="danger" @click="deleteRole(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑角色对话框 -->
    <el-dialog
      :title="roleDialog.title"
      :visible.sync="roleDialog.visible"
      width="600px"
    >
      <el-form
        ref="roleForm"
        :model="roleForm"
        :rules="roleRules"
        label-width="100px"
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

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="permissionDialog.visible"
      width="600px"
    >
      <div class="mb-4">
        <el-input
          v-model="permissionFilter"
          placeholder="搜索权限"
          size="small"
        >
          <i slot="prefix" class="el-icon-search el-input__icon"></i>
        </el-input>
      </div>
      <el-tree
        ref="permissionTree"
        :data="permissionTree"
        show-checkbox
        node-key="id"
        :props="defaultProps"
        :filter-node-method="filterPermission"
        @check="handlePermissionCheck"
      ></el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="permissionDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="savePermissions">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'RoleManagement',
  data() {
    return {
      selectedRoles: [],
      filters: {
        search: ''
      },
      roleDialog: {
        visible: false,
        title: '添加角色'
      },
      permissionDialog: {
        visible: false
      },
      permissionFilter: '',
      // 角色数据
      roles: [
        {
          id: 'R001',
          name: '超级管理员',
          code: 'super_admin',
          description: '系统超级管理员，拥有所有权限',
          userCount: 1,
          createTime: '2020-09-01 10:00:00'
        },
        {
          id: 'R002',
          name: '学校管理员',
          code: 'school_admin',
          description: '学校管理员，管理学校范围内的用户和权限',
          userCount: 3,
          createTime: '2020-09-02 14:30:00'
        },
        {
          id: 'R003',
          name: '教师',
          code: 'teacher',
          description: '教师角色，可以管理课程和查看学生信息',
          userCount: 25,
          createTime: '2020-09-03 09:15:00'
        },
        {
          id: 'R004',
          name: '学生',
          code: 'student',
          description: '学生角色，可以查看课程和作业',
          userCount: 120,
          createTime: '2020-09-04 16:20:00'
        }
      ],
      roleForm: {
        id: '',
        name: '',
        code: '',
        description: ''
      },
      roleRules: {
        name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
      },
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
                { id: '1-1-1', label: '查看课程' },
                { id: '1-1-2', label: '创建课程' },
                { id: '1-1-3', label: '编辑课程' },
                { id: '1-1-4', label: '删除课程' }
              ]
            },
            {
              id: '1-2',
              label: '排课管理',
              children: [
                { id: '1-2-1', label: '查看排课' },
                { id: '1-2-2', label: '创建排课' },
                { id: '1-2-3', label: '编辑排课' },
                { id: '1-2-4', label: '删除排课' },
                { id: '1-2-5', label: '导出课表' }
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
                { id: '2-1-1', label: '查看设备' },
                { id: '2-1-2', label: '添加设备' },
                { id: '2-1-3', label: '编辑设备' },
                { id: '2-1-4', label: '删除设备' },
                { id: '2-1-5', label: '导入设备' },
                { id: '2-1-6', label: '导出设备' }
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
                { id: '3-1-1', label: '查看用户' },
                { id: '3-1-2', label: '添加用户' },
                { id: '3-1-3', label: '编辑用户' },
                { id: '3-1-4', label: '删除用户' },
                { id: '3-1-5', label: '重置密码' }
              ]
            },
            {
              id: '3-2',
              label: '角色管理',
              children: [
                { id: '3-2-1', label: '查看角色' },
                { id: '3-2-2', label: '添加角色' },
                { id: '3-2-3', label: '编辑角色' },
                { id: '3-2-4', label: '删除角色' },
                { id: '3-2-5', label: '分配权限' }
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
                { id: '4-1-1', label: '查看设置' },
                { id: '4-1-2', label: '修改设置' }
              ]
            },
            {
              id: '4-2',
              label: '日志管理',
              children: [
                { id: '4-2-1', label: '查看日志' },
                { id: '4-2-2', label: '导出日志' }
              ]
            }
          ]
        }
      ],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      currentRole: null,
      selectedPermissions: []
    }
  },
  methods: {
    handleSelectionChange(val) {
      this.selectedRoles = val.map(item => item.id)
    },
    addRole() {
      this.roleDialog.title = '添加角色'
      this.roleDialog.visible = true
      this.roleForm = {
        id: '',
        name: '',
        code: '',
        description: ''
      }
    },
    editRole(row) {
      this.roleDialog.title = '编辑角色'
      this.roleDialog.visible = true
      this.roleForm = { ...row }
    },
    saveRole() {
      this.$refs.roleForm.validate((valid) => {
        if (valid) {
          if (this.roleForm.id) {
            // 编辑
            const index = this.roles.findIndex(item => item.id === this.roleForm.id)
            if (index > -1) {
              this.roles.splice(index, 1, { ...this.roleForm })
            }
          } else {
            // 新增
            this.roleForm.id = 'R' + String(this.roles.length + 1).padStart(3, '0')
            this.roles.push({ ...this.roleForm })
          }
          this.roleDialog.visible = false
          this.$message.success('保存成功')
        }
      })
    },
    deleteRole(row) {
      this.$confirm('确认删除该角色吗？删除后该角色的用户将没有权限', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.roles.findIndex(item => item.id === row.id)
        if (index > -1) {
          this.roles.splice(index, 1)
          this.$message.success('删除成功')
        }
      }).catch(() => {})
    },
    batchDelete() {
      if (this.selectedRoles.length === 0) {
        this.$message.warning('请选择要删除的角色')
        return
      }
      this.$confirm(`确认删除选中的 ${this.selectedRoles.length} 个角色吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.selectedRoles.forEach(id => {
          const index = this.roles.findIndex(item => item.id === id)
          if (index > -1) {
            this.roles.splice(index, 1)
          }
        })
        this.selectedRoles = []
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    assignPermission(row) {
      this.currentRole = row
      this.permissionDialog.visible = true
      // 加载角色已有的权限
      this.$nextTick(() => {
        // 这里应该根据角色ID加载已有权限
        // 模拟数据
        this.selectedPermissions = ['1-1-1', '1-2-1', '2-1-1', '3-1-1']
        this.$refs.permissionTree.setCheckedKeys(this.selectedPermissions)
      })
    },
    savePermissions() {
      // 这里应该调用API保存角色权限
      this.$message.success('权限分配成功')
      this.permissionDialog.visible = false
    },
    handlePermissionCheck(data, checked) {
      // 处理权限选择
      if (checked) {
        if (!this.selectedPermissions.includes(data.id)) {
          this.selectedPermissions.push(data.id)
        }
      } else {
        const index = this.selectedPermissions.indexOf(data.id)
        if (index > -1) {
          this.selectedPermissions.splice(index, 1)
        }
      }
    },
    filterPermission(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    }
  },
  watch: {
    permissionFilter(val) {
      this.$refs.permissionTree.filter(val)
    }
  }
}
</script>

<style scoped>
/* 自定义样式 */
.el-table {
  --el-table-header-bg-color: #f8f9fa;
}
</style>