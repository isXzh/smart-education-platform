<template>
  <div class="software-terminal-page">
    <div class="page-breadcrumb">
      <span class="breadcrumb-item primary">云会议管理</span>
      <span class="breadcrumb-sep">/</span>
      <span class="breadcrumb-item current">软件终端</span>
    </div>

    <div class="page-search-bar">
      <div class="search-right">
        <el-input
          v-model="globalSearch"
          placeholder="搜索名称/会议号..."
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
          <el-option label="停用" value="1"></el-option>
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
          <h3 class="content-title">软件终端列表</h3>
          <el-button type="primary" size="small" @click="handleAdd"> <i class="el-icon-plus"></i> 新增 </el-button>
        </div>

        <div class="table-container" v-loading="loading">
          <el-table
            :data="filteredTerminals"
            style="width: 100%"
            :header-cell-style="headerCellStyle"
            @selection-change="handleSelectionChange"
            stripe
          >
            <el-table-column type="selection" width="50"></el-table-column>
            <el-table-column prop="name" label="名称" min-width="140">
              <template slot-scope="scope">
                <span class="terminal-name">{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="department" label="部门" min-width="200">
              <template slot-scope="scope">
                <span class="dept-text">{{ scope.row.department }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="userAccount" label="账号" width="130">
              <template slot-scope="scope">
                <span class="meeting-number">{{ scope.row.userAccount }}</span>
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
            <el-table-column label="操作" width="80" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" size="mini" class="delete-btn" @click="handleDelete(scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="table-empty" v-if="filteredTerminals.length === 0 && !loading">
            <div class="empty-content">
              <i class="el-icon-office-building empty-icon"></i>
              <p class="empty-text">暂无数据</p>
            </div>
          </div>
        </div>

        <div class="table-footer">
          <span class="footer-count">共 {{ filteredTerminals.length }} 条记录</span>
          <span class="footer-selected" v-if="selectedTerminals.length > 0">
            已选择 {{ selectedTerminals.length }} 条
          </span>
        </div>
      </div>
    </div>

    <SoftwareTerminalDialog
      :visible.sync="formDialogVisible"
      :edit-data="editingTerminal"
      :org-tree="orgData"
      :selected-dept="selectedNode"
      @confirm="handleFormConfirm"
    />
  </div>
</template>

<script>
  import device from '@/api/device';
  import SoftwareTerminalDialog from './dialog/SoftwareTerminalDialog.vue';

  export default {
    name: 'SoftwareTerminal',
    components: {
      SoftwareTerminalDialog,
    },
    data() {
      return {
        loading: false,
        globalSearch: '',
        statusFilter: '',
        orgFilter: '',
        selectedNode: null,
        selectedTerminals: [],
        orgData: [],
        defaultProps: {
          children: 'childDepts',
          label: 'deptName',
        },
        terminalData: [],
        total: 0,
        currentPage: 1,
        pageSize: 10,
        formDialogVisible: false,
        editingTerminal: null,
        searchTimer: null,
      };
    },
    computed: {
      filteredTerminals() {
        let result = [...this.terminalData];
        if (this.globalSearch) {
          const query = this.globalSearch.toLowerCase();
          result = result.filter(
            t => t.name.toLowerCase().includes(query) || (t.userAccount && t.userAccount.toLowerCase().includes(query))
          );
        }
        if (this.statusFilter !== '') {
          result = result.filter(t => String(t.status) === String(this.statusFilter));
        }
        return result;
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
                this.loadTerminalList();
              }
            });
          }
        } catch (error) {
          console.error('加载组织架构失败:', error);
        }
      },
      async loadTerminalList() {
        try {
          this.loading = true;
          const params = {
            pageNum: this.currentPage,
            pageSize: this.pageSize,
          };
          if (this.selectedNode) {
            params.deptCode = this.selectedNode.deptCode;
          }
          const res = await device.pageMembers(params);
          if (res.success && res.data) {
            this.terminalData = (res.data.list || []).map(item => this.mapTerminalData(item));
            this.total = res.data.total || 0;
          }
        } catch (error) {
          console.error('加载终端列表失败:', error);
        } finally {
          this.loading = false;
        }
      },
      mapTerminalData(apiData) {
        return {
          id: apiData.id,
          name: apiData.name || '',
          userAccount: apiData.userAccount || '',
          department: apiData.deptNamePath || '',
          deptCode: apiData.deptCode || '',
          status: apiData.status,
        };
      },
      filterNode(value, data) {
        if (!value) return true;
        return data.deptName.indexOf(value) !== -1;
      },
      handleNodeClick(data) {
        this.selectedNode = data;
        this.currentPage = 1;
        this.loadTerminalList();
      },
      handleSearchDebounce() {
        if (this.searchTimer) clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => {}, 300);
      },
      handleFilterChange() {},
      handleSelectionChange(selection) {
        this.selectedTerminals = selection;
      },
      handleAdd() {
        this.editingTerminal = null;
        this.formDialogVisible = true;
      },
      handleDelete(row) {
        this.$confirm(`确定要删除终端"${row.name}"吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(async () => {
            try {
              await device.deleteMembers([row.id]);
              this.$message.success('删除成功');
              this.loadTerminalList();
            } catch (error) {
              console.error('删除失败:', error);
              this.$message.error('删除失败');
            }
          })
          .catch(() => {});
      },
      async handleFormConfirm(formData) {
        try {
          const params = {
            name: formData.name,
            account: formData.account,
            pwd: formData.password,
          };
          if (formData.deptCode) {
            params.deptCode = formData.deptCode;
          }
          if (formData.remark) {
            params.desc = formData.remark;
          }
          await device.addMembers(params);
          this.$message.success('新增成功');
          this.loadTerminalList();
        } catch (error) {
          console.error('新增失败:', error);
          this.$message.error('新增失败');
        }
      },
      getStatusBadgeClass(status) {
        return String(status) === '0' ? 'status-badge online' : 'status-badge disabled';
      },
      getStatusDotClass(status) {
        return String(status) === '0' ? 'status-dot online' : 'status-dot disabled';
      },
      getStatusLabel(status) {
        return String(status) === '0' ? '正常' : '停用';
      },
    },
  };
</script>

<style lang="scss" scoped>
  .software-terminal-page {
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
    width: 264px;
  }

  .status-select {
    width: 132px;
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

  .table-container {
    flex: 1;
    overflow: auto;
    padding: 0;
  }

  .terminal-name {
    font-weight: 500;
    color: #303133;
  }

  .dept-text {
    font-size: 13px;
    color: #606266;
  }

  .meeting-number {
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: #606266;
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

  .status-badge.disabled {
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

  .status-dot.disabled {
    background: #f44336;
  }

  .delete-btn {
    color: #f56c6c;

    &:hover {
      color: #f78989;
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
    margin: 0;
  }

  .table-footer {
    padding: 8px 24px;
    border-top: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #606266;
  }

  .footer-selected {
    color: #409eff;
    margin-left: 16px;
  }

  .software-terminal-page ::v-deep .el-tree-node__content {
    height: 32px;
    padding: 0 8px;
  }

  .software-terminal-page ::v-deep .el-tree-node__content:hover {
    background-color: #f5f7fa;
  }

  .software-terminal-page ::v-deep .el-tree-node.is-current > .el-tree-node__content {
    background-color: #ecf5ff;
    color: #409eff;
  }
</style>
