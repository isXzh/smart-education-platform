<template>
  <div>
    <!-- 操作栏 -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex justify-between items-center">
        <div class="flex gap-4">
          <el-button type="primary" size="small" @click="addUser">
            <i class="el-icon-plus mr-1"></i>添加用户
          </el-button>
          <el-button size="small" @click="batchDelete" :disabled="!selectedUsers.length">
            <i class="el-icon-delete mr-1"></i>批量删除
          </el-button>
          <el-button size="small" @click="resetPassword" :disabled="!selectedUsers.length">
            <i class="el-icon-key mr-1"></i>重置密码
          </el-button>
          <el-button size="small" @click="exportUsers">
            <i class="el-icon-download mr-1"></i>导出用户
          </el-button>
        </div>
        <div class="flex gap-4">
          <el-input
            v-model="filters.search"
            placeholder="搜索用户"
            size="small"
            style="width: 200px"
          >
            <i slot="prefix" class="el-icon-search el-input__icon"></i>
          </el-input>
          <el-select v-model="filters.role" placeholder="角色" size="small" clearable>
            <el-option label="管理员" value="admin"></el-option>
            <el-option label="教师" value="teacher"></el-option>
            <el-option label="学生" value="student"></el-option>
          </el-select>
          <el-select v-model="filters.status" placeholder="状态" size="small" clearable>
            <el-option label="启用" value="active"></el-option>
            <el-option label="禁用" value="inactive"></el-option>
          </el-select>
        </div>
      </div>
    </div>

    <!-- 用户列表 -->
    <el-card class="shadow-sm">
      <el-table
        :data="users"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="用户ID" width="80"></el-table-column>
        <el-table-column prop="username" label="用户名" width="120"></el-table-column>
        <el-table-column prop="realName" label="真实姓名" width="100"></el-table-column>
        <el-table-column prop="role" label="角色" width="100">
          <template slot-scope="scope">
            <el-tag :type="getRoleType(scope.row.role)" size="small">
              {{ getRoleName(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="org" label="所属组织" width="150"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
        <el-table-column prop="phone" label="手机号" width="120"></el-table-column>
        <el-table-column prop="lastLogin" label="最后登录" width="160"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="toggleStatus(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="editUser(scope.row)">编辑</el-button>
            <el-button size="mini" type="warning" @click="resetPassword(scope.row)">重置密码</el-button>
            <el-button size="mini" type="danger" @click="deleteUser(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="mt-4 flex justify-end">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </div>
    </el-card>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      :title="userDialog.title"
      :visible.sync="userDialog.visible"
      width="600px"
    >
      <el-form
        ref="userForm"
        :model="userForm"
        :rules="userRules"
        label-width="100px"
        size="small"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username"></el-input>
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="userForm.realName"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role">
            <el-option label="管理员" value="admin"></el-option>
            <el-option label="教师" value="teacher"></el-option>
            <el-option label="学生" value="student"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属组织" prop="org">
          <el-cascader
            v-model="userForm.org"
            :options="orgOptions"
            :props="{ checkStrictly: true }"
            placeholder="请选择所属组织"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!userForm.id">
          <el-input v-model="userForm.password" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="!userForm.id">
          <el-input v-model="userForm.confirmPassword" type="password" show-password></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="userDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'UserManagement',
  data() {
    return {
      loading: false,
      selectedUsers: [],
      filters: {
        search: '',
        role: '',
        status: ''
      },
      currentPage: 1,
      pageSize: 10,
      total: 0,
      userDialog: {
        visible: false,
        title: '添加用户'
      },
      // 用户数据
      users: [
        {
          id: 'U001',
          username: 'admin',
          realName: '超级管理员',
          role: 'admin',
          org: '兴华小学',
          email: 'admin@school.com',
          phone: '13800138000',
          lastLogin: '2026-04-09 10:30:00',
          status: true
        },
        {
          id: 'U002',
          username: 'teacher1',
          realName: '张老师',
          role: 'teacher',
          org: '兴华小学 > 一年级 > 1班',
          email: 'zhang@school.com',
          phone: '13800138001',
          lastLogin: '2026-04-09 09:15:00',
          status: true
        },
        {
          id: 'U003',
          username: 'teacher2',
          realName: '李老师',
          role: 'teacher',
          org: '兴华小学 > 一年级 > 2班',
          email: 'li@school.com',
          phone: '13800138002',
          lastLogin: '2026-04-08 14:20:00',
          status: false
        },
        {
          id: 'U004',
          username: 'student1',
          realName: '王小明',
          role: 'student',
          org: '兴华小学 > 一年级 > 1班',
          email: 'student1@school.com',
          phone: '13800138003',
          lastLogin: '2026-04-07 16:45:00',
          status: true
        }
      ],
      userForm: {
        id: '',
        username: '',
        realName: '',
        role: '',
        org: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      },
      userRules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
        role: [{ required: true, message: '请选择角色', trigger: 'change' }],
        org: [{ required: true, message: '请选择所属组织', trigger: 'change' }],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: this.validateConfirmPassword, trigger: 'blur' }
        ]
      },
      orgOptions: [
        {
          value: '1',
          label: '兴华小学',
          children: [
            {
              value: '1-1',
              label: '一年级',
              children: [
                { value: '1-1-1', label: '1班' },
                { value: '1-1-2', label: '2班' }
              ]
            }
          ]
        },
        {
          value: '2',
          label: '实验中学',
          children: [
            {
              value: '2-1',
              label: '初中部',
              children: [
                { value: '2-1-1', label: '初一1班' }
              ]
            }
          ]
        }
      ]
    }
  },
  methods: {
    getRoleType(role) {
      const types = {
        admin: 'danger',
        teacher: 'primary',
        student: 'info'
      }
      return types[role] || ''
    },
    getRoleName(role) {
      const names = {
        admin: '管理员',
        teacher: '教师',
        student: '学生'
      }
      return names[role] || role
    },
    handleSelectionChange(val) {
      this.selectedUsers = val.map(item => item.id)
    },
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    addUser() {
      this.userDialog.title = '添加用户'
      this.userDialog.visible = true
      this.userForm = {
        id: '',
        username: '',
        realName: '',
        role: '',
        org: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      }
      this.$refs.userForm && this.$refs.userForm.resetFields()
    },
    editUser(row) {
      this.userDialog.title = '编辑用户'
      this.userDialog.visible = true
      this.userForm = { ...row }
    },
    saveUser() {
      this.$refs.userForm.validate((valid) => {
        if (valid) {
          if (this.userForm.id) {
            // 编辑
            const index = this.users.findIndex(item => item.id === this.userForm.id)
            if (index > -1) {
              this.users.splice(index, 1, { ...this.userForm })
            }
          } else {
            // 新增
            this.userForm.id = 'U' + String(this.users.length + 1).padStart(3, '0')
            this.users.push({ ...this.userForm })
          }
          this.userDialog.visible = false
          this.$message.success('保存成功')
        }
      })
    },
    deleteUser(row) {
      this.$confirm('确认删除该用户吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.users.findIndex(item => item.id === row.id)
        if (index > -1) {
          this.users.splice(index, 1)
          this.$message.success('删除成功')
        }
      }).catch(() => {})
    },
    batchDelete() {
      if (this.selectedUsers.length === 0) {
        this.$message.warning('请选择要删除的用户')
        return
      }
      this.$confirm(`确认删除选中的 ${this.selectedUsers.length} 个用户吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.selectedUsers.forEach(id => {
          const index = this.users.findIndex(item => item.id === id)
          if (index > -1) {
            this.users.splice(index, 1)
          }
        })
        this.selectedUsers = []
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    toggleStatus(row) {
      // 这里应该调用API更新用户状态
      const statusText = row.status ? '启用' : '禁用'
      this.$message.success(`用户已${statusText}`)
    },
    resetPassword(row) {
      if (row) {
        this.$confirm(`确认重置用户 ${row.realName} 的密码吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 这里应该调用API重置密码
          this.$message.success('密码重置成功，新密码已发送至用户邮箱')
        }).catch(() => {})
      } else {
        // 批量重置
        this.$confirm(`确认重置选中的 ${this.selectedUsers.length} 个用户的密码吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 这里应该调用API批量重置密码
          this.$message.success('密码重置成功，新密码已发送至用户邮箱')
        }).catch(() => {})
      }
    },
    exportUsers() {
      // 这里应该调用API导出用户数据
      this.$message.info('导出功能开发中')
    },
    validateConfirmPassword(rule, value, callback) {
      if (value !== this.userForm.password) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
  }
}
</script>