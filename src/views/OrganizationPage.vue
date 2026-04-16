<template>
  <div class="organization-page">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-container">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>组织架构</el-breadcrumb-item>
        <el-breadcrumb-item>部门管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 白色卡片容器 -->
    <div class="card-container">
      <!-- 顶部控制栏 -->
      <div class="control-bar">
        <div class="control-bar-left">
          <h2 class="page-title">组织架构</h2>
        </div>
        <div class="control-bar-right">
          <el-input
            v-model="searchQuery"
            placeholder="搜索部门名称"
            prefix-icon="el-icon-search"
            size="small"
            class="search-input"
          ></el-input>
          <el-button type="primary" @click="showAddDepartment = true" size="small">添加部门</el-button>
          <el-button @click="refreshOrganization" size="small">
            <i class="el-icon-refresh"></i>
            刷新
          </el-button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-area">
        <!-- 左侧树形结构 -->
        <div class="tree-container">
          <div class="tree-header">
            <h3 class="tree-title">部门结构</h3>
          </div>
          <div class="tree-content">
            <el-tree
              :data="organizationData"
              :props="defaultProps"
              default-expand-all
              highlight-current
              @node-click="handleNodeClick"
              :filter-node-method="filterNode"
              ref="tree"
            >
              <template slot-scope="{ node, data }">
                <div class="tree-node">
                  <span>{{ node.label }}</span>
                  <span class="node-count">{{ data.memberCount || 0 }}人</span>
                </div>
              </template>
            </el-tree>
          </div>
        </div>

        <!-- 右侧部门详情 -->
        <div class="detail-container">
          <div v-if="selectedDepartment" class="department-detail">
            <div class="detail-header">
              <h3 class="detail-title">{{ selectedDepartment.name }} 详情</h3>
              <div class="detail-actions">
                <el-button @click="showEditDepartment = true" size="small" type="primary">编辑</el-button>
                <el-button @click="handleDeleteDepartment" size="small" type="danger">删除</el-button>
              </div>
            </div>
            <div class="detail-content">
              <div class="detail-section">
                <h4 class="section-title">基本信息</h4>
                <div class="info-item">
                  <span class="info-label">部门名称：</span>
                  <span class="info-value">{{ selectedDepartment.name }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">上级部门：</span>
                  <span class="info-value">{{ selectedDepartment.parentName || '无' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">部门描述：</span>
                  <span class="info-value">{{ selectedDepartment.description || '无' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">成员数量：</span>
                  <span class="info-value">{{ selectedDepartment.memberCount || 0 }} 人</span>
                </div>
              </div>
              <div class="detail-section">
                <h4 class="section-title">部门成员</h4>
                <div class="member-list">
                  <el-table :data="selectedDepartment.members || []" style="width: 100%">
                    <el-table-column prop="name" label="姓名" width="120"></el-table-column>
                    <el-table-column prop="position" label="职位" width="120"></el-table-column>
                    <el-table-column prop="email" label="邮箱" min-width="180"></el-table-column>
                    <el-table-column prop="phone" label="电话" width="120"></el-table-column>
                  </el-table>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-selection">
            <div class="no-selection-icon">
              <i class="el-icon-document"></i>
            </div>
            <p class="no-selection-text">请选择一个部门查看详情</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加部门弹窗 -->
    <el-dialog :visible.sync="showAddDepartment" title="添加部门" width="500px">
      <el-form :model="departmentForm" label-width="120px" :rules="departmentRules" ref="departmentForm">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="departmentForm.name" placeholder="请输入部门名称"></el-input>
        </el-form-item>
        <el-form-item label="上级部门" prop="parentId">
          <el-select v-model="departmentForm.parentId" placeholder="请选择上级部门">
            <el-option label="根节点" value=""></el-option>
            <el-option
              v-for="dept in allDepartments"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门描述" prop="description">
          <el-input type="textarea" v-model="departmentForm.description" placeholder="请输入部门描述"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddDepartment = false">取消</el-button>
        <el-button type="primary" @click="handleAddDepartment">确定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑部门弹窗 -->
    <el-dialog :visible.sync="showEditDepartment" title="编辑部门" width="500px">
      <el-form :model="editForm" label-width="120px" :rules="departmentRules" ref="editForm">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入部门名称"></el-input>
        </el-form-item>
        <el-form-item label="上级部门" prop="parentId">
          <el-select v-model="editForm.parentId" placeholder="请选择上级部门">
            <el-option label="根节点" value=""></el-option>
            <el-option
              v-for="dept in allDepartments"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
              :disabled="dept.id === selectedDepartment.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门描述" prop="description">
          <el-input type="textarea" v-model="editForm.description" placeholder="请输入部门描述"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showEditDepartment = false">取消</el-button>
        <el-button type="primary" @click="handleEditDepartment">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      organizationData: [
        {
          id: '1',
          name: '总经办',
          parentId: '',
          parentName: '',
          description: '公司最高决策机构',
          memberCount: 5,
          members: [
            { name: '张三', position: '总经理', email: 'zhangsan@example.com', phone: '13800138001' },
            { name: '李四', position: '副总经理', email: 'lisi@example.com', phone: '13800138002' }
          ],
          children: [
            {
              id: '1-1',
              name: '行政部',
              parentId: '1',
              parentName: '总经办',
              description: '负责公司行政事务',
              memberCount: 3,
              members: [
                { name: '王五', position: '行政经理', email: 'wangwu@example.com', phone: '13800138003' }
              ]
            },
            {
              id: '1-2',
              name: '人力资源部',
              parentId: '1',
              parentName: '总经办',
              description: '负责公司人力资源管理',
              memberCount: 4,
              members: [
                { name: '赵六', position: 'HR经理', email: 'zhaoliu@example.com', phone: '13800138004' }
              ]
            }
          ]
        },
        {
          id: '2',
          name: '教学部',
          parentId: '',
          parentName: '',
          description: '负责教学管理',
          memberCount: 15,
          members: [
            { name: '孙七', position: '教学总监', email: 'sunqi@example.com', phone: '13800138005' }
          ],
          children: [
            {
              id: '2-1',
              name: '数学组',
              parentId: '2',
              parentName: '教学部',
              description: '负责数学教学',
              memberCount: 5,
              members: []
            },
            {
              id: '2-2',
              name: '英语组',
              parentId: '2',
              parentName: '教学部',
              description: '负责英语教学',
              memberCount: 6,
              members: []
            }
          ]
        }
      ],
      showAddDepartment: false,
      showEditDepartment: false,
      departmentForm: {
        name: '',
        parentId: '',
        description: ''
      },
      editForm: {
        name: '',
        parentId: '',
        description: ''
      },
      departmentRules: {
        name: [
          { required: true, message: '请输入部门名称', trigger: 'blur' }
        ]
      },
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      searchQuery: '',
      selectedDepartment: null
    }
  },
  computed: {
    allDepartments() {
      const departments = []
      const traverse = (data) => {
        data.forEach(item => {
          departments.push(item)
          if (item.children) {
            traverse(item.children)
          }
        })
      }
      traverse(this.organizationData)
      return departments
    }
  },
  watch: {
    searchQuery(val) {
      this.$refs.tree.filter(val)
    }
  },
  methods: {
    refreshOrganization() {
      // 刷新组织架构
      this.$message.success('组织架构已刷新')
    },
    handleNodeClick(data) {
      this.selectedDepartment = data
    },
    handleAddDepartment() {
      // 添加部门
      this.$refs.departmentForm.validate((valid) => {
        if (valid) {
          const newDepartment = {
            id: String(Date.now()),
            name: this.departmentForm.name,
            parentId: this.departmentForm.parentId,
            parentName: this.allDepartments.find(d => d.id === this.departmentForm.parentId)?.name || '',
            description: this.departmentForm.description,
            memberCount: 0,
            members: [],
            children: []
          }
          
          if (this.departmentForm.parentId) {
            // 找到父部门并添加子部门
            const addToParent = (data) => {
              data.forEach(item => {
                if (item.id === this.departmentForm.parentId) {
                  if (!item.children) item.children = []
                  item.children.push(newDepartment)
                } else if (item.children) {
                  addToParent(item.children)
                }
              })
            }
            addToParent(this.organizationData)
          } else {
            // 添加为根部门
            this.organizationData.push(newDepartment)
          }
          
          this.showAddDepartment = false
          this.departmentForm = {
            name: '',
            parentId: '',
            description: ''
          }
          this.$message.success('部门添加成功')
        }
      })
    },
    handleEditDepartment() {
      // 编辑部门
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          // 更新部门信息
          const updateDepartment = (data) => {
            data.forEach(item => {
              if (item.id === this.selectedDepartment.id) {
                item.name = this.editForm.name
                item.parentId = this.editForm.parentId
                item.parentName = this.allDepartments.find(d => d.id === this.editForm.parentId)?.name || ''
                item.description = this.editForm.description
              } else if (item.children) {
                updateDepartment(item.children)
              }
            })
          }
          updateDepartment(this.organizationData)
          
          this.showEditDepartment = false
          this.selectedDepartment = { ...this.editForm, id: this.selectedDepartment.id, memberCount: this.selectedDepartment.memberCount, members: this.selectedDepartment.members, children: this.selectedDepartment.children }
          this.$message.success('部门编辑成功')
        }
      })
    },
    handleDeleteDepartment() {
      // 删除部门
      this.$confirm('确定要删除部门 ' + this.selectedDepartment.name + ' 吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 从组织架构中删除部门
        const removeDepartment = (data) => {
          for (let i = 0; i < data.length; i++) {
            if (data[i].id === this.selectedDepartment.id) {
              data.splice(i, 1)
              return true
            } else if (data[i].children) {
              if (removeDepartment(data[i].children)) {
                return true
              }
            }
          }
          return false
        }
        removeDepartment(this.organizationData)
        
        this.selectedDepartment = null
        this.$message.success('部门删除成功')
      }).catch(() => {
        // 取消删除
      })
    },
    filterNode(value, data) {
      if (!value) return true
      return data.name.toLowerCase().includes(value.toLowerCase())
    }
  }
}
</script>

<style scoped>
.organization-page {
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
  gap: 12px;
}

.search-input {
  width: 300px;
}

.content-area {
  display: flex;
  height: calc(100vh - 280px);
  min-height: 500px;
}

.tree-container {
  width: 300px;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.tree-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
}

.tree-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}

.tree-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.node-count {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.detail-container {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.no-selection-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-selection-text {
  font-size: 16px;
  margin: 0;
}

.department-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.detail-actions {
  display: flex;
  gap: 8px;
}

.detail-content {
  flex: 1;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.info-item {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
}

.info-label {
  width: 100px;
  font-size: 14px;
  color: #606266;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  font-size: 14px;
  color: #303133;
  line-height: 1.5;
}

.member-list {
  margin-top: 8px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .content-area {
    flex-direction: column;
  }
  
  .tree-container {
    width: 100%;
    height: 300px;
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
  }
  
  .detail-container {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .control-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .control-bar-right {
    align-self: stretch;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .tree-container {
    height: 250px;
  }
  
  .detail-container {
    padding: 16px;
  }
}
</style>