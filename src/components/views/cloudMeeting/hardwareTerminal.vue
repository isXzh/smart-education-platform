<template>
  <div class="hardware-terminal-page">
    <div class="page-breadcrumb">
      <span class="breadcrumb-item primary">云会议管理</span>
      <span class="breadcrumb-sep">/</span>
      <span class="breadcrumb-item current">硬件终端</span>
      <template v-if="selectedNode">
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-item current">{{ selectedNode.deptName }}</span>
      </template>
    </div>

    <div class="page-search-bar">
      <div class="search-right">
        <el-input
          v-model="globalSearch"
          placeholder="搜索设备名称/SN码..."
          size="small"
          class="search-input"
          clearable
          @input="handleSearchDebounce"
        >
          <i slot="prefix" class="el-icon-search el-input__icon"></i>
        </el-input>
        <el-select
          v-model="statusFilter"
          placeholder="全部状态"
          size="small"
          class="status-select"
          @change="handleFilterChange"
        >
          <el-option label="全部状态" value=""></el-option>
          <el-option label="正常" value="0"></el-option>
          <el-option label="冻结" value="1"></el-option>
        </el-select>
      </div>
    </div>

    <div class="page-main">
      <div class="left-sidebar">
        <div class="sidebar-header">
          <h3 class="sidebar-title">
            <i class="el-icon-office-building"></i>
            组织架构
          </h3>
        </div>
        <div class="sidebar-search">
          <el-input v-model="orgFilter" placeholder="搜索部门..." size="small" clearable>
            <i slot="prefix" class="el-icon-search el-input__icon"></i>
          </el-input>
        </div>
        <div class="tree-container">
          <el-tree
            ref="orgTree"
            :data="orgData"
            :props="defaultProps"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            node-key="deptCode"
            default-expand-all
            highlight-current
            @node-click="handleNodeClick"
          >
            <template slot-scope="{ node }">
              <span class="custom-tree-node">
                <span class="node-label">
                  <i class="el-icon-folder node-icon"></i>
                  {{ node.label }}
                </span>
              </span>
            </template>
          </el-tree>
        </div>
      </div>

      <div class="right-content">
        <div class="content-header">
          <h3 class="content-title">硬件终端列表</h3>
          <span class="device-count" v-if="total > 0">共 {{ total }} 台设备</span>
        </div>

        <div class="table-container" v-loading="loading">
          <el-table
            :data="paginatedDevices"
            style="width: 100%"
            :header-cell-style="headerCellStyle"
            @selection-change="handleSelectionChange"
            stripe
          >
            <el-table-column type="selection" width="50"></el-table-column>
            <el-table-column prop="name" label="名称" min-width="140">
              <template slot-scope="scope">
                <span class="device-name">{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="department" label="部门" min-width="200">
              <template slot-scope="scope">
                <span class="dept-text">{{ scope.row.department }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="model" label="设备型号" width="140">
              <template slot-scope="scope">
                <span class="model-text">{{ scope.row.model }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="sn" label="SN码" width="130">
              <template slot-scope="scope">
                <span class="sn-code">{{ scope.row.sn }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <span :class="getStatusBadgeClass(scope.row.status)">
                  <span :class="getStatusDotClass(scope.row.status)"></span>
                  {{ getStatusLabel(scope.row.status) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="expiryDate" label="到期时间" width="110"></el-table-column>
            <el-table-column prop="activationDate" label="激活时间" width="110"></el-table-column>
          </el-table>

          <div class="table-empty" v-if="deviceData.length === 0 && !loading">
            <div class="empty-content">
              <i class="el-icon-office-building empty-icon"></i>
              <p class="empty-text">暂无终端设备</p>
              <p class="empty-subtext">{{ selectedNode ? '该部门下还没有设备' : '请在左侧选择部门查看设备' }}</p>
            </div>
          </div>
        </div>

        <div class="pagination-wrapper" v-if="total > 0">
          <div class="pagination-info">共 {{ total }} 台设备，当前第 {{ currentPage }} / {{ totalPages }} 页</div>
          <el-pagination
            background
            layout="prev, pager, next"
            :total="filteredDevices.length"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handleCurrentChange"
          ></el-pagination>
        </div>
      </div>
    </div>

    <DeviceFormDialog
      :visible.sync="formDialogVisible"
      :edit-data="editingDevice"
      :org-tree="orgData"
      @confirm="handleFormConfirm"
    />

    <DeviceLogDialog :visible.sync="logDialogVisible" :device="logDevice" />
  </div>
</template>

<script>
  import device from '@/api/device';
  import DeviceFormDialog from './dialog/DeviceFormDialog.vue';
  import DeviceLogDialog from './dialog/DeviceLogDialog.vue';

  export default {
    name: 'HardwareTerminal',
    components: {
      DeviceFormDialog,
      DeviceLogDialog,
    },
    data() {
      return {
        loading: false,
        globalSearch: '',
        statusFilter: '',
        orgFilter: '',
        selectedNode: null,
        selectedDevices: [],
        currentPage: 1,
        pageSize: 10,
        total: 0,
        orgData: [],
        defaultProps: {
          children: 'childDepts',
          label: 'deptName',
        },
        deviceData: [],
        formDialogVisible: false,
        logDialogVisible: false,
        editingDevice: null,
        logDevice: null,
        searchTimer: null,
      };
    },
    computed: {
      filteredDevices() {
        let result = [...this.deviceData];
        if (this.globalSearch) {
          const query = this.globalSearch.toLowerCase();
          result = result.filter(d => d.name.toLowerCase().includes(query) || d.sn.toLowerCase().includes(query));
        }
        if (this.statusFilter !== '') {
          result = result.filter(d => String(d.status) === String(this.statusFilter));
        }
        return result;
      },
      totalPages() {
        return Math.ceil(this.total / this.pageSize) || 1;
      },
      paginatedDevices() {
        return this.filteredDevices;
      },
    },
    watch: {
      orgFilter(val) {
        this.$refs.orgTree.filter(val);
      },
    },
    mounted() {
      this.loadDeptTree();
    },
    beforeDestroy() {
      if (this.searchTimer) clearTimeout(this.searchTimer);
    },
    methods: {
      headerCellStyle() {
        return {
          background: '#f5f7fa',
          color: '#606266',
          fontWeight: '500',
          fontSize: '13px',
        };
      },
      async loadDeptTree() {
        try {
          const res = await device.deptTree();
          if (res.success && res.data) {
            this.orgData = [];
            this.orgData.push(res.data);
            this.$nextTick(() => {
              if (this.orgData.length > 0) {
                const firstNode = this.orgData[0];
                this.$refs.orgTree.setCurrentKey(firstNode.deptCode);
                this.selectedNode = firstNode;
                this.loadDeviceList();
              }
            });
          }
        } catch (error) {
          console.error('加载组织架构失败:', error);
        }
      },
      async loadDeviceList() {
        try {
          this.loading = true;
          const params = {
            pageNum: this.currentPage,
            pageSize: this.pageSize,
          };
          if (this.selectedNode) {
            params.deptCode = this.selectedNode.deptCode;
          }
          if (this.globalSearch) {
            params.searchKey = this.globalSearch;
          }
          const res = await device.hardDevices(params);
          if (res.success && res.data) {
            this.deviceData = (res.data.list || []).map(item => this.mapDeviceData(item));
            this.total = res.data.total || 0;
          }
        } catch (error) {
          console.error('加载设备列表失败:', error);
        } finally {
          this.loading = false;
        }
      },
      mapDeviceData(apiData) {
        return {
          id: apiData.userId,
          name: apiData.name || '',
          department: apiData.deptNamePath || '',
          deptCode: apiData.deptCode || '',
          model: apiData.model || '',
          sn: apiData.sn || '',
          status: apiData.status,
          expiryDate: this.formatTimestamp(apiData.expireDate),
          activationDate: this.formatTimestamp(apiData.activeTime),
        };
      },
      formatTimestamp(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      },
      filterNode(value, data) {
        if (!value) return true;
        return data.deptName.indexOf(value) !== -1;
      },
      handleNodeClick(data) {
        this.selectedNode = data;
        this.currentPage = 1;
        this.loadDeviceList();
      },
      handleSearchDebounce() {
        if (this.searchTimer) clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => {
          this.currentPage = 1;
          this.loadDeviceList();
        }, 300);
      },
      handleFilterChange() {
        this.currentPage = 1;
      },
      handleCurrentChange(page) {
        this.currentPage = page;
        this.loadDeviceList();
      },
      handleSelectionChange(selection) {
        this.selectedDevices = selection;
      },
      getStatusBadgeClass(status) {
        return String(status) === '0' ? 'status-badge online' : 'status-badge disabled';
      },
      getStatusDotClass(status) {
        return String(status) === '0' ? 'status-dot online' : 'status-dot disabled';
      },
      getStatusLabel(status) {
        return String(status) === '0' ? '正常' : '冻结';
      },
    },
  };
</script>

<style lang="scss" scoped>
  .hardware-terminal-page {
    height: 100%;
    padding: 16px;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
  }

  .page-breadcrumb {
    margin-bottom: 12px;
    font-size: 14px;
    display: flex;
    align-items: center;
  }

  .breadcrumb-item {
    color: #606266;

    &.primary {
      color: #409eff;
      font-weight: 500;
    }

    &.current {
      color: #303133;
    }
  }

  .breadcrumb-sep {
    margin: 0 8px;
    color: #c0c4cc;
  }

  .page-search-bar {
    margin-bottom: 12px;
    display: flex;
    justify-content: flex-end;
  }

  .search-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .search-input {
    width: 320px;
  }

  .status-select {
    width: 144px;
  }

  .page-main {
    flex: 1;
    display: flex;
    gap: 16px;
    min-height: 0;
  }

  .left-sidebar {
    width: 280px;
    flex-shrink: 0;
    background: #fff;
    border-radius: 12px;
    border: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .sidebar-header {
    padding: 16px;
    border-bottom: 1px solid #e4e7ed;
  }

  .sidebar-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
  }

  .sidebar-title i {
    color: #409eff;
    font-size: 18px;
  }

  .sidebar-search {
    padding: 12px 16px;
    border-bottom: 1px solid #e4e7ed;
  }

  .tree-container {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    font-size: 13px;
  }

  .node-label {
    display: flex;
    align-items: center;
  }

  .node-icon {
    margin-right: 6px;
    color: #409eff;
    font-size: 14px;
  }

  .right-content {
    flex: 1;
    background: #fff;
    border-radius: 12px;
    border: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .content-header {
    padding: 16px 24px;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .content-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }

  .device-count {
    font-size: 13px;
    color: #909399;
  }

  .table-container {
    flex: 1;
    overflow: auto;
    padding: 0;
  }

  .device-name {
    font-weight: 500;
    color: #303133;
  }

  .dept-text {
    font-size: 13px;
    color: #606266;
  }

  .model-text {
    font-size: 13px;
    color: #606266;
  }

  .sn-code {
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: #606266;
  }

  .status-cell {
    display: flex;
    flex-direction: column;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    width: fit-content;
  }

  .status-badge.online {
    background: #f0f9eb;
    color: #4caf50;
    border: 1px solid #c2e7b0;
  }

  .status-badge.offline {
    background: #f5f7fa;
    color: #909399;
    border: 1px solid #e4e7ed;
  }

  .status-badge.inuse {
    background: #ecf5ff;
    color: #1e88e5;
    border: 1px solid #b3d8ff;
  }

  .status-badge.expired {
    background: #fef0f0;
    color: #f44336;
    border: 1px solid #fbc4c4;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .status-dot.online {
    background: #4caf50;
  }

  .status-dot.offline {
    background: #909399;
  }

  .status-dot.inuse {
    background: #1e88e5;
  }

  .status-dot.expired {
    background: #f44336;
  }

  .av-status {
    margin-top: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .av-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;

    i {
      font-size: 12px;
    }
  }

  .table-empty {
    padding: 60px 0;
    text-align: center;
  }

  .empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .empty-icon {
    font-size: 48px;
    color: #dcdfe6;
    margin-bottom: 12px;
  }

  .empty-text {
    font-size: 14px;
    color: #909399;
    margin: 0 0 4px;
  }

  .empty-subtext {
    font-size: 12px;
    color: #c0c4cc;
    margin: 0;
  }

  .pagination-wrapper {
    padding: 12px 24px;
    border-top: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .pagination-info {
    font-size: 13px;
    color: #606266;
  }

  .hardware-terminal-page ::v-deep .el-tree-node__content {
    height: 32px;
    padding: 0 8px;
  }

  .hardware-terminal-page ::v-deep .el-tree-node__content:hover {
    background-color: #f5f7fa;
  }

  .hardware-terminal-page ::v-deep .el-tree-node.is-current > .el-tree-node__content {
    background-color: #ecf5ff;
    color: #409eff;
  }
</style>
