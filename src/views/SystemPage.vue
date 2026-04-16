<template>
  <div class="system-page">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-container">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>系统设置</el-breadcrumb-item>
        <el-breadcrumb-item>系统配置</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 白色卡片容器 -->
    <div class="card-container">
      <!-- 顶部控制栏 -->
      <div class="control-bar">
        <div class="control-bar-left">
          <h2 class="page-title">系统设置</h2>
        </div>
        <div class="control-bar-right">
          <el-button @click="resetSettings" size="small">重置</el-button>
          <el-button type="primary" @click="saveSettings" size="small">保存设置</el-button>
        </div>
      </div>

      <!-- 设置内容区域 -->
      <div class="settings-content">
        <el-tabs v-model="activeTab" type="border-card" class="settings-tabs">
          <!-- 基础设置 -->
          <el-tab-pane label="基础设置" name="basic">
            <div class="tab-content">
              <el-form :model="settingsForm" label-width="120px" class="settings-form">
                <el-form-item label="系统名称" prop="systemName">
                  <el-input v-model="settingsForm.systemName" placeholder="请输入系统名称"></el-input>
                </el-form-item>
                <el-form-item label="系统版本" prop="systemVersion">
                  <el-input v-model="settingsForm.systemVersion" disabled></el-input>
                </el-form-item>
                <el-form-item label="API基础URL" prop="apiBaseUrl">
                  <el-input v-model="settingsForm.apiBaseUrl" placeholder="请输入API基础URL"></el-input>
                </el-form-item>
                <el-form-item label="系统Logo" prop="systemLogo">
                  <el-upload
                    class="avatar-uploader"
                    action="#"
                    :show-file-list="false"
                    :on-change="handleLogoUpload"
                    :auto-upload="false"
                  >
                    <img v-if="settingsForm.systemLogo" :src="settingsForm.systemLogo" class="avatar">
                    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                  </el-upload>
                </el-form-item>
                <el-form-item label="版权信息" prop="copyright">
                  <el-input type="textarea" v-model="settingsForm.copyright" placeholder="请输入版权信息"></el-input>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>

          <!-- 用户管理 -->
          <el-tab-pane label="用户管理" name="users">
            <div class="tab-content">
              <div class="users-header">
                <el-input
                  v-model="userSearch"
                  placeholder="搜索用户名或邮箱"
                  prefix-icon="el-icon-search"
                  size="small"
                  class="user-search"
                ></el-input>
                <el-button type="primary" @click="showAddUser = true" size="small">添加用户</el-button>
              </div>
              <el-table :data="filteredUsers" style="width: 100%" stripe>
                <el-table-column prop="username" label="用户名" width="180"></el-table-column>
                <el-table-column prop="role" label="角色" width="120">
                  <template slot-scope="scope">
                    <el-tag :type="scope.row.role === '管理员' ? 'primary' : 'info'">
                      {{ scope.row.role }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="email" label="邮箱" min-width="200"></el-table-column>
                <el-table-column prop="lastLogin" label="最后登录" width="180"></el-table-column>
                <el-table-column label="操作" width="180" fixed="right">
                  <template slot-scope="scope">
                    <el-button size="mini" @click="handleEditUser(scope.$index, scope.row)" type="primary">编辑</el-button>
                    <el-button size="mini" type="danger" @click="handleDeleteUser(scope.$index, scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="users-pagination">
                <el-pagination
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  :current-page="currentPage"
                  :page-sizes="[10, 20, 50, 100]"
                  :page-size="pageSize"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="users.length"
                ></el-pagination>
              </div>
            </div>
          </el-tab-pane>

          <!-- 权限设置 -->
          <el-tab-pane label="权限设置" name="permissions">
            <div class="tab-content">
              <el-form :model="permissionForm" label-width="120px" class="settings-form">
                <el-form-item label="角色管理" prop="roleManagement">
                  <el-switch v-model="permissionForm.roleManagement" active-text="开启" inactive-text="关闭"></el-switch>
                </el-form-item>
                <el-form-item label="课程管理" prop="courseManagement">
                  <el-switch v-model="permissionForm.courseManagement" active-text="开启" inactive-text="关闭"></el-switch>
                </el-form-item>
                <el-form-item label="设备管理" prop="deviceManagement">
                  <el-switch v-model="permissionForm.deviceManagement" active-text="开启" inactive-text="关闭"></el-switch>
                </el-form-item>
                <el-form-item label="组织管理" prop="organizationManagement">
                  <el-switch v-model="permissionForm.organizationManagement" active-text="开启" inactive-text="关闭"></el-switch>
                </el-form-item>
                <el-form-item label="统计分析" prop="statistics">
                  <el-switch v-model="permissionForm.statistics" active-text="开启" inactive-text="关闭"></el-switch>
                </el-form-item>
                <el-form-item label="系统设置" prop="systemSettings">
                  <el-switch v-model="permissionForm.systemSettings" active-text="开启" inactive-text="关闭"></el-switch>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>

          <!-- 日志管理 -->
          <el-tab-pane label="日志管理" name="logs">
            <div class="tab-content">
              <div class="logs-header">
                <el-date-picker
                  v-model="logDateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="yyyy-MM-dd"
                  size="small"
                  class="log-date-picker"
                ></el-date-picker>
                <el-button type="primary" @click="exportLogs" size="small">导出日志</el-button>
              </div>
              <el-table :data="logs" style="width: 100%" stripe>
                <el-table-column prop="time" label="时间" width="180"></el-table-column>
                <el-table-column prop="user" label="用户" width="120"></el-table-column>
                <el-table-column prop="action" label="操作" min-width="200"></el-table-column>
                <el-table-column prop="ip" label="IP地址" width="150"></el-table-column>
              </el-table>
              <div class="logs-pagination">
                <el-pagination
                  @size-change="handleLogSizeChange"
                  @current-change="handleLogCurrentChange"
                  :current-page="logCurrentPage"
                  :page-sizes="[10, 20, 50, 100]"
                  :page-size="logPageSize"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="logs.length"
                ></el-pagination>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 添加用户弹窗 -->
    <el-dialog :visible.sync="showAddUser" title="添加用户" width="500px">
      <el-form :model="userForm" label-width="120px" :rules="userRules" ref="userForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="userForm.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="管理员"></el-option>
            <el-option label="教师" value="教师"></el-option>
            <el-option label="学生" value="学生"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddUser = false">取消</el-button>
        <el-button type="primary" @click="handleAddUser">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'basic',
      settingsForm: {
        systemName: '智慧教育云平台',
        systemVersion: 'v2.0.0',
        apiBaseUrl: 'http://localhost:3000/api',
        systemLogo: '',
        copyright: '© 2026 智慧教育云平台 版权所有'
      },
      permissionForm: {
        roleManagement: true,
        courseManagement: true,
        deviceManagement: true,
        organizationManagement: true,
        statistics: true,
        systemSettings: true
      },
      users: [
        { id: 1, username: 'admin', role: '管理员', email: 'admin@example.com', lastLogin: '2026-04-08 14:30:00' },
        { id: 2, username: 'teacher1', role: '教师', email: 'teacher1@example.com', lastLogin: '2026-04-07 16:45:00' },
        { id: 3, username: 'student1', role: '学生', email: 'student1@example.com', lastLogin: '2026-04-08 10:15:00' }
      ],
      logs: [
        { time: '2026-04-08 14:30:00', user: 'admin', action: '登录系统', ip: '192.168.1.1' },
        { time: '2026-04-08 14:25:00', user: 'teacher1', action: '查看课程', ip: '192.168.1.2' },
        { time: '2026-04-08 14:20:00', user: 'admin', action: '修改系统设置', ip: '192.168.1.1' }
      ],
      userSearch: '',
      logDateRange: [],
      currentPage: 1,
      pageSize: 10,
      logCurrentPage: 1,
      logPageSize: 10,
      showAddUser: false,
      userForm: {
        username: '',
        password: '',
        email: '',
        role: ''
      },
      userRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    filteredUsers() {
      if (!this.userSearch) {
        return this.users
      }
      const query = this.userSearch.toLowerCase()
      return this.users.filter(user => 
        user.username.toLowerCase().includes(query) || 
        user.email.toLowerCase().includes(query)
      )
    }
  },
  methods: {
    saveSettings() {
      // 保存设置
      this.$message.success('设置保存成功')
    },
    resetSettings() {
      // 重置设置
      this.$confirm('确定要重置所有设置吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.settingsForm = {
          systemName: '智慧教育云平台',
          systemVersion: 'v2.0.0',
          apiBaseUrl: 'http://localhost:3000/api',
          systemLogo: '',
          copyright: '© 2026 智慧教育云平台 版权所有'
        }
        this.permissionForm = {
          roleManagement: true,
          courseManagement: true,
          deviceManagement: true,
          organizationManagement: true,
          statistics: true,
          systemSettings: true
        }
        this.$message.success('设置已重置')
      }).catch(() => {
        // 取消重置
      })
    },
    handleLogoUpload(file) {
      // 处理Logo上传
      this.settingsForm.systemLogo = URL.createObjectURL(file.raw)
    },
    handleAddUser() {
      // 添加用户
      this.$refs.userForm.validate((valid) => {
        if (valid) {
          const newUser = {
            id: this.users.length + 1,
            username: this.userForm.username,
            password: this.userForm.password,
            email: this.userForm.email,
            role: this.userForm.role,
            lastLogin: '从未登录'
          }
          this.users.push(newUser)
          this.showAddUser = false
          this.userForm = {
            username: '',
            password: '',
            email: '',
            role: ''
          }
          this.$message.success('用户添加成功')
        }
      })
    },
    handleEditUser(index, row) {
      // 编辑用户
      this.$message.info('编辑用户：' + row.username)
    },
    handleDeleteUser(index, row) {
      // 删除用户
      this.$confirm('确定要删除用户 ' + row.username + ' 吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.users.splice(index, 1)
        this.$message.success('用户删除成功')
      }).catch(() => {
        // 取消删除
      })
    },
    exportLogs() {
      // 导出日志
      this.$message.success('日志导出成功')
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
    },
    handleCurrentChange(current) {
      this.currentPage = current
    },
    handleLogSizeChange(size) {
      this.logPageSize = size
      this.logCurrentPage = 1
    },
    handleLogCurrentChange(current) {
      this.logCurrentPage = current
    }
  }
}
</script>

<style scoped>
.system-page {
  width: 100%;
}

.breadcrumb-container {
  margin-bottom: 16px;
}

.card-container {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.control-bar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.settings-content {
  padding: 24px;
}

.settings-tabs {
  border: none;
}

.tab-content {
  padding: 24px;
  background: #f9f9f9;
  border-radius: 4px;
  margin-top: 16px;
}

.settings-form {
  max-width: 600px;
}

/* Logo上传样式 */
.avatar-uploader {
  display: flex;
  align-items: center;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 4px;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #909399;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
}

/* 用户管理样式 */
.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.user-search {
  width: 300px;
}

.users-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

/* 日志管理样式 */
.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.log-date-picker {
  width: 240px;
}

.logs-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .control-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .control-bar-right {
    align-self: stretch;
    justify-content: flex-end;
  }
  
  .users-header {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .user-search {
    width: 100%;
  }
  
  .logs-header {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .log-date-picker {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .settings-content {
    padding: 16px;
  }
  
  .tab-content {
    padding: 16px;
  }
  
  .settings-form {
    max-width: 100%;
  }
  
  .avatar,
  .avatar-uploader-icon {
    width: 80px;
    height: 80px;
  }
  
  .avatar-uploader-icon {
    line-height: 80px;
  }
}
</style>