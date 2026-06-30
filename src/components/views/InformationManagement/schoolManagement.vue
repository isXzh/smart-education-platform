<template>
  <div class="school-management-page">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-nav">
      <span class="breadcrumb-parent">基础信息管理</span>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-current">学校管理</span>
    </div>

    <!-- 主内容区域 - 左右布局 -->
    <div class="main-content-wrapper">
      <!-- 左侧：组织架构 -->
      <div class="left-panel">
        <div class="panel-header">
          <h3 class="panel-title">组织架构</h3>
          <el-dropdown trigger="click" @command="handleOrgTreeCommand">
            <span class="header-more-btn">
              <i class="el-icon-more"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="add"> <i class="el-icon-plus"></i> 添加节点 </el-dropdown-item>
              <el-dropdown-item command="refresh"> <i class="el-icon-refresh"></i> 刷新 </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="panel-body">
          <div class="org-tree">
            <el-tree
              ref="orgTree"
              :data="orgTree"
              :props="treeProps"
              node-key="id"
              highlight-current
              default-expand-all
              @node-click="handleSelectOrg"
            >
              <span slot-scope="{ node, data }" class="custom-tree-node">
                <span class="node-name">{{ data.orgName }}</span>
                <span class="node-actions">
                  <el-tooltip v-if="data.orgType !== 1" content="编辑" placement="top">
                    <span class="action-btn edit-btn" @click.stop="handleEditOrgNode(data)">
                      <i class="el-icon-edit"></i>
                    </span>
                  </el-tooltip>
                  <el-tooltip content="添加下级" placement="top">
                    <span class="action-btn add-btn" @click.stop="handleAddSubOrgNode(data)">
                      <i class="el-icon-plus"></i>
                    </span>
                  </el-tooltip>
                  <el-tooltip v-if="data.orgType !== 1" content="删除" placement="top">
                    <span class="action-btn delete-btn" @click.stop="handleDeleteOrgNode(data)">
                      <i class="el-icon-delete"></i>
                    </span>
                  </el-tooltip>
                </span>
              </span>
            </el-tree>
          </div>
        </div>
      </div>

      <!-- 右侧：学校列表 -->
      <div class="right-panel">
        <!-- 顶部操作与筛选栏 -->
        <div class="toolbar-section">
          <div class="toolbar-left">
            <el-button type="primary" class="btn-primary" @click="handleAdd">
              <i class="el-icon-plus"></i>
              新增学校
            </el-button>
            <el-button class="btn-outline" @click="handleImport">
              <i class="el-icon-upload2"></i>
              批量导入
            </el-button>
            <el-button class="btn-outline" :disabled="selectedIds.length === 0" @click="handleBatchEnable">
              <i class="el-icon-circle-check"></i>
              批量启用
            </el-button>
            <el-button class="btn-outline" :disabled="selectedIds.length === 0" @click="handleBatchDisable">
              <i class="el-icon-circle-close"></i>
              批量禁用
            </el-button>
            <el-button class="btn-danger-outline" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
              <i class="el-icon-delete"></i>
              批量删除
            </el-button>
          </div>
          <div class="toolbar-right">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索学校名称/代码"
              prefix-icon="el-icon-search"
              class="search-input"
              clearable
              @input="handleSearch"
            />
            <el-cascader
              v-model="organizationFilter"
              :options="orgCascaderOptions"
              :props="cascaderProps"
              placeholder="全部组织"
              clearable
              class="filter-cascader"
              @change="handleFilterChange"
            />
            <el-select
              v-model="typeFilter"
              placeholder="全部类型"
              class="filter-select"
              clearable
              @change="handleFilterChange"
            >
              <el-option label="全部类型" value="" />
              <el-option v-for="item in schoolTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-select
              v-model="statusFilter"
              placeholder="全部状态"
              class="filter-select"
              clearable
              @change="handleFilterChange"
            >
              <el-option label="全部状态" value="" />
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
            <el-button class="btn-outline" @click="handleResetFilters"> 重置 </el-button>
          </div>
        </div>

        <!-- 数据表格 -->
        <div class="table-section">
          <el-table
            :data="tableData"
            style="width: 100%"
            :header-cell-style="headerCellStyle"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column prop="schoolCode" label="学校代码" min-width="120">
              <template #default="{ row }">
                <span class="text-primary font-medium">{{ row.schoolCode }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="schoolName" label="学校名称" min-width="150">
              <template #default="{ row }">
                <span class="text-primary font-medium">{{ row.schoolName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="orgName" label="所属组织" min-width="130">
              <template #default="{ row }">
                <span class="text-secondary">{{ row.orgName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="schoolTypeName" label="学校类型" min-width="110">
              <template #default="{ row }">
                <el-tag size="small" effect="plain" class="type-tag">{{ row.schoolTypeName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="contactPerson" label="联系人" min-width="100">
              <template #default="{ row }">
                <span class="text-primary">{{ row.contactPerson }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="contactPhone" label="联系电话" min-width="120">
              <template #default="{ row }">
                <span class="text-secondary">{{ row.contactPhone }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="address" label="所在地址" min-width="150" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="text-secondary">{{ row.address }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" min-width="120">
              <template #default="{ row }">
                <span class="text-secondary">{{ row.createdAt.split('T').join(' ') }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-switch
                  v-model="row.status"
                  :active-value="1"
                  :inactive-value="0"
                  active-color="#1677FF"
                  inactive-color="#D1D5DB"
                  @change="handleToggleStatus(row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right" align="center">
              <template #default="{ row }">
                <div class="operation-btns">
                  <el-button type="text" class="op-btn" @click="handleViewDetail(row)">
                    <i class="el-icon-view"></i>
                  </el-button>
                  <el-button type="text" class="op-btn" @click="handleEdit(row)">
                    <i class="el-icon-edit"></i>
                  </el-button>
                  <!-- <el-button type="text" class="op-btn" @click="handleToggleStatus(row)">
                    <i :class="row.status ? 'el-icon-circle-close' : 'el-icon-circle-check'"></i>
                  </el-button> -->
                  <el-button type="text" class="op-btn op-btn-danger" @click="handleDelete(row)">
                    <i class="el-icon-delete"></i>
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 空状态 -->
          <div v-if="tableData.length === 0 && !loading" class="empty-state">
            <i class="el-icon-reading empty-icon"></i>
            <p class="empty-text">暂无数据</p>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="total > 0" class="pagination-section">
          <span class="total-text">共 {{ total }} 条数据</span>
          <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="total"
            layout="prev, pager, next, sizes"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 新增/编辑学校弹窗 -->
    <SchoolFormDialog
      :visible.sync="formDialogVisible"
      :school="editingSchool"
      :org-tree-data="orgTree"
      :default-org-id="selectedOrgId"
      @save="handleSaveForm"
      @close="handleFormClose"
    />

    <!-- 学校详情弹窗 -->
    <SchoolDetailDialog :visible.sync="detailDialogVisible" :school="viewingSchool" @close="handleDetailClose" />

    <!-- 批量导入弹窗 -->
    <SchoolImportDialog :visible.sync="importDialogVisible" @close="handleImportClose" />

    <!-- 组织树节点弹窗 -->
    <OrgNodeDialog
      :visible.sync="orgNodeDialogVisible"
      :mode="orgNodeDialogMode"
      :parent-node="selectedOrgNode"
      :current-node="currentOrgNode"
      :edit-data="editOrgNodeData"
      @confirm="handleOrgNodeConfirm"
    />
  </div>
</template>

<script>
  import schoolApi from '@/api/school';
  import orgStructureApi from '@/api/orgStructure';
  import SchoolFormDialog from './dialog/SchoolFormDialog.vue';
  import SchoolDetailDialog from './dialog/SchoolDetailDialog.vue';
  import SchoolImportDialog from './dialog/SchoolImportDialog.vue';
  import OrgNodeDialog from './dialog/OrgNodeDialog.vue';

  export default {
    name: 'SchoolManagement',
    components: {
      SchoolFormDialog,
      SchoolDetailDialog,
      SchoolImportDialog,
      OrgNodeDialog,
    },
    data() {
      return {
        orgTree: [],
        treeProps: {
          children: 'children',
          label: 'orgName',
        },
        cascaderProps: {
          value: 'id',
          label: 'orgName',
          children: 'children',
          checkStrictly: true,
          emitPath: false,
        },
        selectedOrgId: '',
        tableData: [],
        total: 0,
        loading: false,
        searchKeyword: '',
        organizationFilter: '',
        typeFilter: '',
        statusFilter: '',
        selectedIds: [],
        currentPage: 1,
        pageSize: 10,
        formDialogVisible: false,
        detailDialogVisible: false,
        importDialogVisible: false,
        editingSchool: null,
        viewingSchool: null,
        schoolTypeOptions: [
          { value: 1, label: '小学' },
          { value: 2, label: '初中' },
          { value: 3, label: '高中' },
          { value: 4, label: '九年一贯制' },
          { value: 5, label: '完全中学' },
        ],
        headerCellStyle: {
          background: '#FAFAFC',
          color: '#6B7785',
          fontWeight: 500,
          fontSize: '12px',
          height: '44px',
        },
        orgNodeDialogVisible: false,
        orgNodeDialogMode: 'add',
        selectedOrgNode: {},
        currentOrgNode: {},
        editOrgNodeData: null,
      };
    },
    computed: {
      orgCascaderOptions() {
        return this.orgTree;
      },
    },
    created() {
      this.loadOrgTree();
      // this.loadSchools();
    },
    methods: {
      async loadOrgTree() {
        try {
          const res = await orgStructureApi.tree();
          if (res.code === 200 && res.data) {
            this.orgTree = res.data;
          }
        } catch (error) {
          console.error('加载组织架构失败:', error);
        }
      },
      async loadSchools() {
        this.loading = true;
        try {
          const params = {
            pageNum: this.currentPage,
            pageSize: this.pageSize,
          };
          if (this.searchKeyword) {
            params.keyword = this.searchKeyword;
          }
          if (this.organizationFilter) {
            params.orgId = this.organizationFilter;
          }
          if (this.typeFilter) {
            params.schoolType = this.typeFilter;
          }
          if (this.statusFilter !== '') {
            params.status = this.statusFilter;
          }
          if (this.selectedOrgId) {
            params.orgId = this.selectedOrgId;
          }
          const res = await schoolApi.page(params);
          if (res.code === 200 && res.data) {
            this.tableData = res.data.list || [];
            this.total = res.data.total || 0;
          }
        } catch (error) {
          console.error('加载学校数据失败:', error);
        } finally {
          this.loading = false;
        }
      },
      handleSelectOrg(data) {
        this.selectedOrgId = data.id;
        this.currentPage = 1;
        this.loadSchools();
      },
      handleSearch() {
        this.currentPage = 1;
        this.loadSchools();
      },
      handleFilterChange() {
        this.currentPage = 1;
        this.selectedOrgId = '';
        this.loadSchools();
      },
      handleResetFilters() {
        this.searchKeyword = '';
        this.organizationFilter = '';
        this.typeFilter = '';
        this.statusFilter = '';
        this.selectedOrgId = '';
        this.currentPage = 1;
        this.loadSchools();
      },
      handleSelectionChange(selection) {
        this.selectedIds = selection.map(item => item.id);
      },
      handleAdd() {
        this.editingSchool = null;
        this.formDialogVisible = true;
      },
      handleEdit(school) {
        this.editingSchool = school;
        this.formDialogVisible = true;
      },
      handleViewDetail(school) {
        this.viewingSchool = school;
        this.detailDialogVisible = true;
      },
      handleDelete(school) {
        this.$confirm(`删除后将无法恢复，是否确认删除【${school.schoolName}】？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(async () => {
            try {
              const res = await schoolApi.delete([school.id]);
              if (res.code === 200) {
                this.$message.success('删除成功');
                this.loadSchools();
              } else {
                this.$message.error(res.message || '删除失败');
              }
            } catch (error) {
              this.$message.error('删除失败');
            }
          })
          .catch(() => {});
      },
      handleBatchEnable() {
        if (this.selectedIds.length === 0) {
          this.$message.warning('请至少选择一条数据');
          return;
        }
        this.$confirm(`确定要启用选中的${this.selectedIds.length}条数据吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(async () => {
            try {
              const res = await schoolApi.batchEnable(this.selectedIds);
              if (res.code === 200) {
                this.$message.success(`已成功启用${this.selectedIds.length}条数据`);
                this.loadSchools();
              } else {
                this.$message.error(res.message || '操作失败');
              }
            } catch (error) {
              this.$message.error('操作失败');
            }
            this.selectedIds = [];
          })
          .catch(() => {});
      },
      handleBatchDisable() {
        if (this.selectedIds.length === 0) {
          this.$message.warning('请至少选择一条数据');
          return;
        }
        this.$confirm(`确定要禁用选中的${this.selectedIds.length}条数据吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(async () => {
            try {
              const res = await schoolApi.batchDisable(this.selectedIds);
              if (res.code === 200) {
                this.$message.success(`已成功禁用${this.selectedIds.length}条数据`);
                this.loadSchools();
              } else {
                this.$message.error(res.message || '操作失败');
              }
            } catch (error) {
              this.$message.error('操作失败');
            }
            this.selectedIds = [];
          })
          .catch(() => {});
      },
      handleBatchDelete() {
        if (this.selectedIds.length === 0) {
          this.$message.warning('请至少选择一条数据');
          return;
        }
        this.$confirm(`删除后将无法恢复，是否确认删除选中的${this.selectedIds.length}条数据？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(async () => {
            try {
              const res = await schoolApi.delete(this.selectedIds);
              if (res.code === 200) {
                this.$message.success('删除成功');
                this.loadSchools();
              } else {
                this.$message.error(res.message || '删除失败');
              }
            } catch (error) {
              this.$message.error('删除失败');
            }
            this.selectedIds = [];
          })
          .catch(() => {});
      },
      async handleToggleStatus(school) {
        console.log('cccccccc', school);

        const api = school.status === 0 ? schoolApi.batchDisable : schoolApi.batchEnable;
        try {
          const res = await api([school.id]);
          if (res.code === 200) {
            this.$message.success('状态已更新');
            this.loadSchools();
          } else {
            this.$message.error(res.message || '操作失败');
          }
        } catch (error) {
          this.$message.error('操作失败');
        }
      },
      async handleSaveForm(formData) {
        try {
          if (this.editingSchool) {
            const res = await schoolApi.update(this.editingSchool.id, formData);
            if (res.code === 200) {
              this.$message.success('编辑成功');
              this.loadSchools();
            } else {
              this.$message.error(res.message || '编辑失败');
            }
          } else {
            const res = await schoolApi.add(formData);
            if (res.code === 200) {
              this.$message.success('新增成功');
              this.loadSchools();
            } else {
              this.$message.error(res.message || '新增失败');
            }
          }
        } catch (error) {
          this.$message.error(this.editingSchool ? '编辑失败' : '新增失败');
        }
        this.formDialogVisible = false;
        this.editingSchool = null;
      },
      handleFormClose() {
        this.editingSchool = null;
      },
      handleDetailClose() {
        this.viewingSchool = null;
      },
      handleImport() {
        this.importDialogVisible = true;
      },
      handleImportClose() {
        this.loadSchools();
      },
      handleSizeChange(size) {
        this.pageSize = size;
        this.currentPage = 1;
        this.loadSchools();
      },
      handleCurrentChange(page) {
        this.currentPage = page;
        this.loadSchools();
      },
      handleOrgTreeCommand(command) {
        switch (command) {
          case 'add':
            this.handleAddOrgNode();
            break;
          case 'refresh':
            this.loadOrgTree();
            this.$message.success('组织架构已刷新');
            break;
        }
      },
      handleAddOrgNode() {
        if (!this.selectedOrgId) {
          this.$message.warning('请先选择一个节点');
          return;
        }
        const currentNode = this.$refs.orgTree.getNode(this.selectedOrgId);
        if (!currentNode || !currentNode.data) {
          this.$message.warning('未找到选中的节点');
          return;
        }
        this.orgNodeDialogMode = 'add';
        this.currentOrgNode = { ...currentNode.data };
        this.selectedOrgNode = {};
        this.editOrgNodeData = null;
        this.orgNodeDialogVisible = true;
      },
      handleAddSubOrgNode(node) {
        this.orgNodeDialogMode = 'addSub';
        this.selectedOrgNode = { ...node };
        this.currentOrgNode = {};
        this.editOrgNodeData = null;
        this.orgNodeDialogVisible = true;
      },
      handleEditOrgNode(node) {
        this.orgNodeDialogMode = 'edit';
        this.selectedOrgNode = {};
        this.currentOrgNode = {};
        this.editOrgNodeData = { ...node };
        this.orgNodeDialogVisible = true;
      },
      handleDeleteOrgNode(node) {
        this.$confirm(`确认删除节点 "${node.orgName}" 吗？删除后其下级节点也会被删除。`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(async () => {
            try {
              const res = await orgStructureApi.delete(node.id);
              if (res.code === 200) {
                this.$message.success('删除成功');
                if (this.selectedOrgId === node.id) {
                  this.selectedOrgId = '';
                }
                this.loadOrgTree();
                this.loadSchools();
              } else {
                this.$message.error(res.message || '删除失败');
              }
            } catch (error) {
              this.$message.error('删除失败');
            }
          })
          .catch(() => {});
      },
      async handleOrgNodeConfirm(data, mode) {
        try {
          if (mode === 'edit') {
            const res = await orgStructureApi.update(data.id, {
              orgName: data.name,
              parentId: data.parentId,
            });
            if (res.code === 200) {
              this.$message.success('编辑成功');
              this.loadOrgTree();
            } else {
              this.$message.error(res.message || '编辑失败');
            }
          } else {
            const parentId = mode === 'addSub' ? data.parentId : this.currentOrgNode ? this.currentOrgNode.id : 0;
            const res = await orgStructureApi.add({
              parentId: parentId,
              orgName: data.name,
            });
            if (res.code === 200) {
              this.$message.success('添加成功');
              this.loadOrgTree();
            } else {
              this.$message.error(res.message || '添加失败');
            }
          }
        } catch (error) {
          this.$message.error(mode === 'edit' ? '编辑失败' : '添加失败');
        }
        this.orgNodeDialogVisible = false;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .school-management-page {
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;

    .breadcrumb-nav {
      margin-bottom: 16px;
      font-size: 14px;

      .breadcrumb-parent {
        color: #1677ff;
        font-weight: 500;
      }

      .breadcrumb-separator {
        margin: 0 8px;
        color: #c0c4cc;
      }

      .breadcrumb-current {
        color: #606266;
      }
    }

    .main-content-wrapper {
      flex: 1;
      display: flex;
      gap: 16px;
      overflow: hidden;
    }

    .left-panel {
      width: 256px;
      background: #fff;
      border-radius: 8px;
      border: 1px solid #ebeef5;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;

      .panel-header {
        padding: 16px;
        border-bottom: 1px solid #ebeef5;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .panel-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin: 0;
        }

        .header-more-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          cursor: pointer;
          color: #909399;
          transition: all 0.2s;

          &:hover {
            background: #f5f7fa;
            color: #606266;
          }

          i {
            font-size: 16px;
          }
        }
      }

      .panel-body {
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;
      }
    }

    .org-tree {
      ::v-deep .el-tree {
        background: transparent;

        .el-tree-node__content {
          height: 36px;
          &:hover {
            background: #f5f7fa;
          }
        }

        .el-tree-node.is-current > .el-tree-node__content {
          background: #ecf5ff;
          color: #1677ff;
        }
      }

      .custom-tree-node {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        font-size: 14px;

        .node-name {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .node-actions {
          display: none;
          align-items: center;
          gap: 2px;
          margin-left: 4px;

          .action-btn {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 12px;

            &.edit-btn {
              color: #1677ff;
              &:hover {
                background: #e6f7ff;
              }
            }
            &.add-btn {
              color: #52c41a;
              &:hover {
                background: #f6ffed;
              }
            }
            &.delete-btn {
              color: #ff4d4f;
              &:hover {
                background: #fff1f0;
              }
            }
          }
        }

        &:hover .node-actions {
          display: flex;
        }
      }
    }

    .right-panel {
      flex: 1;
      background: #fff;
      border-radius: 8px;
      border: 1px solid #ebeef5;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .toolbar-section {
        padding: 16px 20px;
        border-bottom: 1px solid #ebecf0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;

        .toolbar-left {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
      }

      .table-section {
        flex: 1;
        overflow: auto;
        padding: 0 20px;
      }

      .pagination-section {
        padding: 12px 20px;
        border-top: 1px solid #ebecf0;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 16px;

        .total-text {
          font-size: 14px;
          color: #606266;
        }
      }
    }

    .btn-primary {
      background: #1677ff;
      border-color: #1677ff;
      color: #fff;

      &:hover,
      &:focus {
        background: #0958d9;
        border-color: #0958d9;
      }
    }

    .btn-outline {
      border-color: #d9d9d9;
      color: #606266;

      &:hover,
      &:focus {
        border-color: #1677ff;
        color: #1677ff;
      }

      &.is-disabled {
        color: #c0c4cc;
        border-color: #ebeef5;
      }
    }

    .btn-danger-outline {
      border-color: #ff4d4f;
      color: #ff4d4f;

      &:hover,
      &:focus {
        background: #fff1f0;
        border-color: #ff4d4f;
        color: #ff4d4f;
      }

      &.is-disabled {
        color: #c0c4cc;
        border-color: #ebeef5;
      }
    }

    .search-input {
      width: 180px;
    }

    .filter-select {
      width: 120px;
    }

    .filter-cascader {
      width: 180px;
    }

    .text-primary {
      color: #1f2a44;
    }

    .text-secondary {
      color: #6b7785;
    }

    .font-medium {
      font-weight: 500;
    }

    .type-tag {
      color: #1677ff;
      border-color: #1677ff;
    }

    .operation-btns {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;

      .op-btn {
        padding: 4px 6px;
        color: #6b7785;

        &:hover {
          color: #1677ff;
        }

        &.op-btn-danger:hover {
          color: #ff4d4f;
        }
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 0;

      .empty-icon {
        font-size: 64px;
        color: #dcdfe6;
        margin-bottom: 16px;
      }

      .empty-text {
        font-size: 14px;
        color: #909399;
      }
    }
  }
</style>
