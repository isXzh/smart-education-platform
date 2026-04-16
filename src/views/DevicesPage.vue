<template>
  <div class="devices-page">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-container">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>设备管理</el-breadcrumb-item>
        <el-breadcrumb-item>设备列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 设备状态统计 -->
    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-icon online-icon"></div>
        <div class="stat-content">
          <div class="stat-value">{{ onlineCount }}</div>
          <div class="stat-label">在线设备</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon offline-icon"></div>
        <div class="stat-content">
          <div class="stat-value">{{ offlineCount }}</div>
          <div class="stat-label">离线设备</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon total-icon"></div>
        <div class="stat-content">
          <div class="stat-value">{{ totalCount }}</div>
          <div class="stat-label">总设备数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning-icon"></div>
        <div class="stat-content">
          <div class="stat-value">{{ warningCount }}</div>
          <div class="stat-label">异常设备</div>
        </div>
      </div>
    </div>

    <!-- 白色卡片容器 -->
    <div class="card-container">
      <!-- 顶部控制栏 -->
      <div class="control-bar">
        <div class="control-bar-left">
          <h2 class="page-title">设备列表</h2>
        </div>
        <div class="control-bar-right">
          <el-input
            v-model="searchQuery"
            placeholder="搜索设备名称或ID"
            prefix-icon="el-icon-search"
            size="small"
            class="search-input"
          ></el-input>
          <el-select v-model="statusFilter" placeholder="状态" size="small" class="status-filter">
            <el-option label="全部" value=""></el-option>
            <el-option label="在线" value="在线"></el-option>
            <el-option label="离线" value="离线"></el-option>
            <el-option label="异常" value="异常"></el-option>
          </el-select>
          <el-button type="primary" @click="showAddDevice = true" size="small">添加设备</el-button>
          <el-button @click="refreshDevices" size="small">
            <i class="el-icon-refresh"></i>
            刷新
          </el-button>
        </div>
      </div>

      <!-- 设备列表 -->
      <div class="device-list">
        <el-table :data="filteredDevices" style="width: 100%" stripe>
          <el-table-column prop="id" label="设备ID" width="120"></el-table-column>
          <el-table-column prop="name" label="设备名称" min-width="180"></el-table-column>
          <el-table-column prop="type" label="设备类型" width="120"></el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="location" label="位置" min-width="150"></el-table-column>
          <el-table-column prop="lastSeen" label="最后在线时间" width="180"></el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template slot-scope="scope">
              <el-button size="mini" @click="handleEdit(scope.$index, scope.row)" type="primary">编辑</el-button>
              <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalCount"
        ></el-pagination>
      </div>
    </div>

    <!-- 添加设备弹窗 -->
    <el-dialog :visible.sync="showAddDevice" title="添加设备" width="500px">
      <el-form :model="deviceForm" label-width="120px" :rules="deviceRules" ref="deviceForm">
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="deviceForm.name" placeholder="请输入设备名称"></el-input>
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-select v-model="deviceForm.type" placeholder="请选择设备类型">
            <el-option label="移动课堂箱" value="移动课堂箱"></el-option>
            <el-option label="投影仪" value="投影仪"></el-option>
            <el-option label="电脑" value="电脑"></el-option>
            <el-option label="音响" value="音响"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="deviceForm.status" active-text="在线" inactive-text="离线"></el-switch>
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="deviceForm.location" placeholder="请输入设备位置"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddDevice = false">取消</el-button>
        <el-button type="primary" @click="handleAddDevice">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      devices: [
        {
          id: 'D001',
          name: '移动课堂箱 A1',
          type: '移动课堂箱',
          status: '在线',
          location: '教学楼 A 栋 101',
          lastSeen: '2026-04-08 14:30:00'
        },
        {
          id: 'D002',
          name: '投影仪 B2',
          type: '投影仪',
          status: '离线',
          location: '教学楼 B 栋 202',
          lastSeen: '2026-04-07 16:45:00'
        },
        {
          id: 'D003',
          name: '电脑 C3',
          type: '电脑',
          status: '在线',
          location: '实验室 C 栋 303',
          lastSeen: '2026-04-08 15:20:00'
        },
        {
          id: 'D004',
          name: '音响 D4',
          type: '音响',
          status: '异常',
          location: '多功能厅 D 栋',
          lastSeen: '2026-04-08 10:15:00'
        }
      ],
      showAddDevice: false,
      deviceForm: {
        name: '',
        type: '',
        status: true,
        location: ''
      },
      deviceRules: {
        name: [
          { required: true, message: '请输入设备名称', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择设备类型', trigger: 'change' }
        ],
        location: [
          { required: true, message: '请输入设备位置', trigger: 'blur' }
        ]
      },
      searchQuery: '',
      statusFilter: '',
      currentPage: 1,
      pageSize: 10
    }
  },
  computed: {
    filteredDevices() {
      let result = [...this.devices]
      
      // 搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        result = result.filter(device => 
          device.name.toLowerCase().includes(query) || 
          device.id.toLowerCase().includes(query)
        )
      }
      
      // 状态过滤
      if (this.statusFilter) {
        result = result.filter(device => device.status === this.statusFilter)
      }
      
      return result
    },
    onlineCount() {
      return this.devices.filter(device => device.status === '在线').length
    },
    offlineCount() {
      return this.devices.filter(device => device.status === '离线').length
    },
    totalCount() {
      return this.devices.length
    },
    warningCount() {
      return this.devices.filter(device => device.status === '异常').length
    }
  },
  methods: {
    refreshDevices() {
      // 刷新设备列表
      this.$message.success('设备列表已刷新')
    },
    handleEdit(index, row) {
      // 编辑设备
      this.$message.info('编辑设备：' + row.name)
    },
    handleDelete(index, row) {
      // 删除设备
      this.$confirm('确定要删除设备 ' + row.name + ' 吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.devices.splice(index, 1)
        this.$message.success('设备删除成功')
      }).catch(() => {
        // 取消删除
      })
    },
    handleAddDevice() {
      // 添加设备
      this.$refs.deviceForm.validate((valid) => {
        if (valid) {
          const newDevice = {
            id: 'D' + String(this.devices.length + 1).padStart(3, '0'),
            name: this.deviceForm.name,
            type: this.deviceForm.type,
            status: this.deviceForm.status ? '在线' : '离线',
            location: this.deviceForm.location,
            lastSeen: new Date().toISOString().slice(0, 19).replace('T', ' ')
          }
          this.devices.push(newDevice)
          this.showAddDevice = false
          this.deviceForm = {
            name: '',
            type: '',
            status: true,
            location: ''
          }
          this.$message.success('设备添加成功')
        }
      })
    },
    getStatusType(status) {
      const types = {
        '在线': 'success',
        '离线': 'danger',
        '异常': 'warning'
      }
      return types[status] || 'info'
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
    },
    handleCurrentChange(current) {
      this.currentPage = current
    }
  }
}
</script>

<style scoped>
.devices-page {
  width: 100%;
}

.breadcrumb-container {
  margin-bottom: 16px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.online-icon {
  background: #f0f9eb;
  color: #67c23a;
}

.offline-icon {
  background: #fef0f0;
  color: #f56c6c;
}

.total-icon {
  background: #dbeafe;
  color: #2563eb;
}

.warning-icon {
  background: #fdf6ec;
  color: #e6a23c;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
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

.status-filter {
  width: 120px;
}

.device-list {
  padding: 24px;
}

.pagination-container {
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: flex-end;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .control-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .control-bar-right {
    align-self: stretch;
    justify-content: space-between;
  }
  
  .search-input {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr;
  }
  
  .control-bar-right {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .search-input,
  .status-filter {
    width: 100%;
  }
}
</style>