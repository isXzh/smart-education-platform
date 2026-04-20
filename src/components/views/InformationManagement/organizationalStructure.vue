<template>
  <div class="organization-page common-container">
    <!-- 页面标题和面包屑 -->
    <div class="page-header">
      <div class="breadcrumb">
        <span class="breadcrumb-item">基础信息管理</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">组织架构</span>
      </div>
      <el-button type="primary" class="add-org-btn" @click="handleAddOrg">
        <i class="el-icon-plus"></i>
        添加组织
      </el-button>
    </div>

    <div class="main-content">
      <!-- 左侧组织树 -->
      <div class="left-panel">
        <!-- 搜索和操作 -->
        <div class="tree-header">
          <el-input
            v-model="searchText"
            placeholder="搜索组织..."
            prefix-icon="el-icon-search"
            class="search-input"
            clearable
          />
          <el-button circle size="small" class="refresh-btn" @click="refreshTree">
            <i class="el-icon-refresh"></i>
          </el-button>
        </div>

        <!-- 负责人筛选 -->
        <div class="filter-section">
          <el-dropdown trigger="click" @command="handleFilterChange">
            <span class="filter-trigger">
              {{ currentFilter }}
              <i class="el-icon-arrow-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="全部负责人">全部负责人</el-dropdown-item>
              <el-dropdown-item command="张主任">张主任</el-dropdown-item>
              <el-dropdown-item command="李校长">李校长</el-dropdown-item>
              <el-dropdown-item command="王主任">王主任</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>

        <!-- 组织树 -->
        <div class="tree-content">
          <el-tree
            ref="orgTree"
            :data="filteredOrgData"
            :default-expand-all="true"
            :props="defaultProps"
            node-key="id"
            :expand-on-click-node="false"
            :default-expanded-keys="expandedKeys"
            @node-click="handleNodeClick"
            @node-contextmenu="handleContextMenu"
            highlight-current
            :current-node-key="currentKey"
            v-loading="loading"
            element-loading-text="加载中..."
          >
            <template #default="{ node, data }">
              <div
                class="tree-node"
                :class="{
                  'is-current': currentOrg && currentOrg.id === data.id,
                }"
              >
                <div class="node-icon" :class="getIconBgClass(data.orgType)">
                  <i :class="getNodeIcon(data.orgType)"></i>
                </div>
                <span class="node-label">{{ data.orgName }}</span>
                <span v-if="data.children && data.children.length" class="node-count">{{ data.children.length }}</span>

                <!-- 更多操作按钮 -->
                <el-dropdown
                  trigger="click"
                  @command="cmd => handleNodeCommand(cmd, data, $event)"
                  @visible-change="show => handleDropdownVisible(show, data.id)"
                >
                  <span class="more-btn" :class="{ 'is-active': activeDropdown === data.id }" @click.stop>
                    <i class="el-icon-more"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown" class="node-dropdown-menu">
                    <el-dropdown-item command="addSub">
                      <i class="el-icon-user"></i>
                      添加下级组织
                    </el-dropdown-item>
                    <el-dropdown-item command="edit">
                      <i class="el-icon-edit"></i>
                      编辑
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" class="delete-item">
                      <i class="el-icon-delete"></i>
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </template>
          </el-tree>
        </div>
      </div>

      <!-- 右侧详情面板 -->
      <div class="right-panel">
        <template v-if="currentOrg">
          <!-- 组织信息卡片 -->
          <div class="info-card">
            <div class="card-header">
              <div class="org-icon-large" :class="getIconBgClass(currentOrg.orgType)">
                <i :class="getNodeIcon(currentOrg.orgType)"></i>
              </div>
              <div class="org-title">
                <div class="org-name">
                  {{ currentOrg.orgName }}
                  <el-tag v-if="currentOrg.type" size="small" class="type-tag" :type="getTagType(currentOrg.orgType)">
                    {{ getOrgTypeName(currentOrg.orgType) }}
                  </el-tag>
                </div>
                <div class="org-desc">
                  {{ currentOrg.description || getDefaultDesc(currentOrg.orgType) }}
                </div>
              </div>
              <div class="header-actions">
                <el-button size="small" class="edit-btn" @click="handleEditOrg(currentOrg)">
                  <i class="el-icon-edit"></i>
                  编辑
                </el-button>
                <el-button type="primary" size="small" class="add-sub-btn" @click="handleAddSubOrg(currentOrg)">
                  <i class="el-icon-user"></i>
                  添加下级
                </el-button>
              </div>
            </div>

            <div class="card-body">
              <div class="info-row">
                <div class="info-item">
                  <i class="el-icon-user"></i>
                  <span class="label">负责人：</span>
                  <span class="value">{{ currentOrg.leader || '系统管理员' }}</span>
                </div>
                <div v-if="currentOrg.address" class="info-item">
                  <i class="el-icon-location"></i>
                  <span class="label">地址：</span>
                  <span class="value">{{ currentOrg.address }}</span>
                </div>
                <div class="info-item">
                  <i class="el-icon-date"></i>
                  <span class="label">创建时间：</span>
                  <span class="value">{{ currentOrg.createdAt }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 统计卡片 -->
          <!-- <div class="stats-row">
            <div class="stat-card">
              <div class="stat-label">学生数量</div>
              <div class="stat-value blue">
                {{ currentOrg.studentCount || 0 }}
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-label">教师数量</div>
              <div class="stat-value green">
                {{ currentOrg.teacherCount || 0 }}
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-label">下级组织</div>
              <div class="stat-value orange">
                {{ currentOrg.children.length || 0 }}
              </div>
            </div>
          </div> -->

          <!-- 下级组织列表 -->
          <div class="sub-org-section">
            <div class="section-header">
              <h3 class="section-title">下级组织列表</h3>
            </div>
            <div v-if="tableList && tableList.length" class="sub-org-table">
              <el-table :data="tableList" style="width: 100%">
                <el-table-column label="组织名称" min-width="200">
                  <template #default="{ row }">
                    <div class="table-org-name">
                      <div class="table-icon" :class="getIconBgClass(row.orgType)">
                        <i :class="getNodeIcon(row.orgType)"></i>
                      </div>
                      <span>{{ row.orgName }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="类型" width="100">
                  <template #default="{ row }">
                    <el-tag size="small" :type="getTagType(row.orgType)">
                      {{ getOrgTypeName(row.orgType) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="leader" label="负责人" width="120" />
                <el-table-column prop="createdAt" label="创建时间" width="250" />
                <el-table-column label="操作" width="200" fixed="right">
                  <template #default="{ row }">
                    <div class="table-actions">
                      <el-button type="text" size="small" @click="handleViewOrg(row)">
                        <i class="el-icon-view"></i>
                      </el-button>
                      <el-button type="text" size="small" @click="handleEditOrg(row)">
                        <i class="el-icon-edit"></i>
                      </el-button>
                      <el-button type="text" size="small" class="delete-btn" @click="handleDeleteOrg(row)">
                        <i class="el-icon-delete"></i>
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div v-else class="empty-sub-org">
              <div class="empty-icon">
                <i class="el-icon-s-custom"></i>
              </div>
              <div class="empty-text">暂无下级组织</div>
              <el-button type="primary" size="small" @click="handleAddSubOrg(currentOrg)"> 添加下级组织 </el-button>
            </div>
          </div>
        </template>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <i class="el-icon-s-check"></i>
          </div>
          <div class="empty-text">请选择一个组织</div>
          <div class="empty-desc">在左侧选择组织以查看详情</div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑组织弹窗 -->
    <organization-dialog
      :visible.sync="orgDialogVisible"
      :title="orgDialogTitle"
      :is-sub-org-mode="isSubOrgMode"
      :parent-org="selectedParentOrg"
      :currentOrg="currentOrg"
      :edit-data="editOrgData"
      @confirm="handleOrgConfirm"
    />
  </div>
</template>

<script>
  import OrganizationDialog from '../dialog/OrganizationDialog.vue';
  import orgStructureApi from '@/api/orgStructure.js';

  export default {
    name: 'OrganizationalStructure',
    components: {
      OrganizationDialog,
    },
    data() {
      return {
        searchText: '',
        tableList: [],
        currentFilter: '全部负责人',
        currentOrg: null,
        expandedKeys: [],
        activeDropdown: null,
        orgDialogVisible: false,
        orgDialogTitle: '添加组织',
        isSubOrgMode: false,
        selectedParentOrg: {},
        editOrgData: null,
        currentKey: '',
        // 组织数据
        orgData: [],

        defaultProps: {
          children: 'children',
          label: 'orgName',
        },
        loading: false,
      };
    },

    computed: {
      filteredOrgData() {
        if (!this.searchText) return this.orgData;
        return this.filterTree(this.orgData, this.searchText);
      },
    },

    mounted() {
      this.loadOrgTree();
    },

    methods: {
      // 加载组织树
      async loadOrgTree() {
        try {
          this.loading = true;
          const res = await orgStructureApi.tree();
          if (res.code === 200) {
            this.orgData = res.data || [];
          }
        } catch (error) {
          console.error('加载组织树失败:', error);
          this.$message.error('加载组织树失败');
        } finally {
          this.loading = false;
        }
      },

      // 加载下级组织列表
      async loadChildren() {
        try {
          const res = await orgStructureApi.getChildrenList(this.currentOrg.id);
          if (res.code === 200) {
            return res.data || [];
          }
          return [];
        } catch (error) {
          console.error('加载下级组织失败:', error);
          this.$message.error('加载下级组织失败');
          return [];
        }
      },
      // 获取节点图标
      getNodeIcon(type) {
        const icons = {
          1: 'el-icon-s-platform',
          2: 'el-icon-office-building',
          3: 'el-icon-school',
          4: 'el-icon-s-grid',
          5: 'el-icon-user-solid',
          6: 'el-icon-s-cooperation',
        };
        return icons[type] || 'el-icon-s-cooperation';
      },

      // 获取图标背景色类
      getIconBgClass(type) {
        const classes = {
          1: 'platform-bg',
          2: 'area-bg',
          3: 'school-bg',
          4: 'grade-bg',
          5: 'class-bg',
          6: 'department-bg',
        };
        return classes[type] || 'default-bg';
      },

      // 获取组织类型名称
      getOrgTypeName(type) {
        const names = {
          1: '平台',
          2: '区域',
          3: '学校',
          4: '年级',
          5: '班级',
          6: '部门',
        };
        return names[type] || '组织';
      },

      // 获取标签类型
      getTagType(type) {
        const types = {
          1: 'primary',
          2: 'info',
          3: 'success',
          4: 'warning',
          5: 'danger',
          6: '',
        };
        return types[type] || '';
      },

      // 获取默认描述
      getDefaultDesc(type) {
        const descs = {
          1: '教育云平台根组织',
          2: '管辖区域',
          3: '重点学校',
          4: '年级信息',
          5: '班级信息',
          6: '部门信息',
        };
        return descs[type] || '暂无描述';
      },

      // 处理节点点击
      async handleNodeClick(data) {
        this.currentOrg = data;
        // 加载下级组织列表
        this.tableList = await this.loadChildren();
        // this.$set(data, "children", children);
      },

      // 处理右键菜单
      handleContextMenu(event, data) {
        // 可以在这里添加右键菜单逻辑
        console.log('右键菜单', data);
      },

      // 处理下拉菜单命令
      handleNodeCommand(command, data, event) {
        event && event.stopPropagation();
        switch (command) {
          case 'addSub':
            this.handleAddSubOrg(data);
            break;
          case 'edit':
            this.handleEditOrg(data);
            break;
          case 'delete':
            this.handleDeleteOrg(data);
            break;
        }
      },

      // 处理下拉菜单显示状态
      handleDropdownVisible(show, nodeId) {
        this.activeDropdown = show ? nodeId : null;
      },

      // 处理筛选变化
      handleFilterChange(filter) {
        this.currentFilter = filter;
      },

      // 刷新树
      async refreshTree() {
        await this.loadOrgTree();
        this.$message.success('已刷新组织列表');
      },

      // 处理添加组织
      handleAddOrg() {
        if (!this.currentOrg) {
          this.$message.warning('请先选择一个组织作为父级');
          return;
        }
        this.isSubOrgMode = true;
        this.orgDialogTitle = '添加组织';
        this.editOrgData = null;
        this.orgDialogVisible = true;
      },

      // 处理添加下级组织
      handleAddSubOrg(data) {
        this.isSubOrgMode = true;
        this.orgDialogTitle = `添加下级组织 - ${data.orgName}`;
        this.selectedParentOrg = { ...data };
        this.editOrgData = null;
        this.orgDialogVisible = true;
      },

      // 处理编辑组织
      async handleEditOrg(data) {
        this.isSubOrgMode = true;
        this.orgDialogTitle = '编辑组织';
        this.editOrgData = await this.getById(data.id);
        this.orgDialogVisible = true;
      },

      // 处理删除组织
      async handleDeleteOrg(data) {
        try {
          await this.$confirm(`确认删除组织 "${data.orgName}" 吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          });

          const res = await orgStructureApi.delete(data.id);
          if (res.code === 200) {
            this.$message.success('删除成功');
            await this.loadOrgTree();
            this.tableList = await this.loadChildren();
            // 如果删除的是当前选中的组织，清空右侧详情
            // if (this.currentOrg && this.currentOrg.id === data.id) {
            //   this.currentOrg = null;
            // }
          } else {
            this.$message.error(res.message || '删除失败');
          }
        } catch (error) {
          if (error !== 'cancel') {
            console.error('删除组织失败:', error);
            this.$message.error('删除组织失败');
          }
        }
      },
      // 获取组织详情
      async getById(id) {
        try {
          const res = await orgStructureApi.getById(id);
          if (res.code === 200) {
            return res.data || {};
          }
        } catch (error) {
          console.error('获取组织详情失败:', error);
          return {};
        }
      },
      // 处理查看组织
      handleViewOrg(row) {
        this.currentOrg = row;
        this.currentKey = row.id;
        this.$refs.orgTree.setCurrentKey(row.id);
      },

      // 处理弹窗确认
      async handleOrgConfirm(data) {
        try {
          let res;
          if (this.editOrgData) {
            // 编辑模式
            res = await orgStructureApi.update(this.editOrgData.id, data);
          } else {
            // 新增模式
            res = await orgStructureApi.add(data);
          }

          if (res.code === 200) {
            this.$message.success(this.editOrgData ? '编辑成功' : '添加成功');
            await this.loadOrgTree();
            // 如果是添加下级，展开父节点并选中新添加的组织
            if (this.isSubOrgMode && this.selectedParentOrg.id) {
              this.expandedKeys.push(this.selectedParentOrg.id.toString());
            }
            this.tableList = await this.loadChildren();
          } else {
            this.$message.error(res.message || '操作失败');
          }
        } catch (error) {
          console.error('保存组织失败:', error);
          this.$message.error('保存组织失败');
        }
      },

      // 过滤树
      filterTree(data, keyword) {
        return data.filter(item => {
          if (item.orgName.includes(keyword)) {
            return true;
          }
          if (item.children && item.children.length) {
            item.children = this.filterTree(item.children, keyword);
            return item.children.length > 0;
          }
          return false;
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .organization-page {
    min-height: 100%;
    background: #f3f4f6;
    padding: 16px 24px;
  }

  // 页面头部
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .breadcrumb {
      font-size: 14px;
      color: #6b7280;

      .breadcrumb-item {
        &.active {
          color: #374151;
          font-weight: 500;
        }
      }

      .breadcrumb-separator {
        margin: 0 8px;
        color: #d1d5db;
      }
    }

    // .add-org-btn {
    //   background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
    //   border: none;
    //   padding: 8px 16px;
    //   border-radius: 6px;
    //   font-size: 14px;

    //   &:hover {
    //     background: linear-gradient(135deg, #4338ca 0%, #2563eb 100%);
    //   }

    //   i {
    //     margin-right: 6px;
    //   }
    // }
  }

  // 主内容区
  .main-content {
    display: flex;
    gap: 16px;
    height: calc(100vh - 140px);
  }

  // 左侧面板
  .left-panel {
    width: 380px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  // 树头部
  .tree-header {
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    gap: 8px;

    .search-input {
      flex: 1;

      ::v-deep .el-input__inner {
        border-radius: 8px;
        border-color: #e5e7eb;
        background: #f9fafb;

        &:focus {
          border-color: #4f46e5;
          background: #fff;
        }
      }
    }

    .refresh-btn {
      border-color: #e5e7eb;
      color: #6b7280;

      &:hover {
        border-color: #d1d5db;
        color: #374151;
      }
    }
  }

  // 筛选区
  .filter-section {
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;

    .filter-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: #f9fafb;
      border-radius: 8px;
      font-size: 14px;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #f3f4f6;
      }

      i {
        font-size: 12px;
        color: #9ca3af;
      }
    }
  }

  // 树内容
  .tree-content {
    flex: 1;
    overflow-y: auto;
    padding: 8px;

    ::v-deep .el-tree {
      background: transparent;

      .el-tree-node__content {
        height: auto;
        padding: 4px 0;
        border-radius: 8px;
        transition: all 0.2s;

        &:hover {
          background: #f3f4f6;
        }
      }

      .el-tree-node.is-current > .el-tree-node__content {
        background: #eff6ff;
      }

      .el-tree-node__expand-icon {
        color: #6b7280;
        font-size: 14px;
        padding: 6px;

        &.is-leaf {
          color: transparent;
        }
      }
    }
  }

  // 树节点
  .tree-node {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 8px;
    width: 100%;
    cursor: pointer;

    &.is-current {
      background: transparent;
    }

    .node-icon {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #fff;
      flex-shrink: 0;

      &.platform-bg {
        background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
      }
      &.area-bg {
        background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
      }
      &.school-bg {
        background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
      }
      &.grade-bg {
        background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
      }
      &.class-bg {
        background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
      }
      &.department-bg {
        background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
      }
      &.default-bg {
        background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
      }
    }

    .node-label {
      flex: 1;
      font-size: 14px;
      color: #374151;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .node-count {
      font-size: 12px;
      color: #9ca3af;
      background: #f3f4f6;
      padding: 2px 8px;
      border-radius: 10px;
    }

    .more-btn {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      color: #9ca3af;
      opacity: 0;
      transition: all 0.2s;

      &:hover,
      &.is-active {
        background: #e5e7eb;
        color: #6b7280;
      }
    }

    &:hover .more-btn {
      opacity: 1;
    }
  }

  // 右侧面板
  .right-panel {
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
  }

  // 信息卡片
  .info-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    margin-bottom: 16px;

    .card-header {
      background: linear-gradient(135deg, #f0f7ff 0%, #e0e7ff 100%);
      padding: 20px 24px;
      display: flex;
      align-items: flex-start;
      gap: 16px;

      .org-icon-large {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        color: #fff;
        flex-shrink: 0;

        &.platform-bg {
          background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
        }
        &.area-bg {
          background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
        }
        &.school-bg {
          background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
        }
        &.grade-bg {
          background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
        }
        &.class-bg {
          background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
        }
      }

      .org-title {
        flex: 1;
        min-width: 0;

        .org-name {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 10px;

          .type-tag {
            font-size: 12px;
            padding: 2px 10px;
            border-radius: 4px;
            font-weight: normal;
          }
        }

        .org-desc {
          font-size: 14px;
          color: #6b7280;
        }
      }

      .header-actions {
        display: flex;
        gap: 8px;

        .edit-btn {
          border-color: #d1d5db;
          color: #374151;

          &:hover {
            border-color: #9ca3af;
          }
        }

        // .add-sub-btn {
        //   background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
        //   border: none;

        //   &:hover {
        //     background: linear-gradient(135deg, #4338ca 0%, #2563eb 100%);
        //   }
        // }
      }
    }

    .card-body {
      padding: 20px 24px;

      .info-row {
        display: flex;
        flex-wrap: wrap;
        gap: 20px 40px;

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;

          i {
            color: #9ca3af;
            font-size: 16px;
          }

          .label {
            color: #6b7280;
          }

          .value {
            color: #111827;
            font-weight: 500;
          }
        }
      }
    }
  }

  // 统计行
  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 16px;
  }

  .stat-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    padding: 20px;

    .stat-label {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 600;

      &.blue {
        color: #3b82f6;
      }
      &.green {
        color: #10b981;
      }
      &.orange {
        color: #f59e0b;
      }
    }
  }
  .el-table__row {
    cursor: move;
  }
  // 下级组织区域
  .sub-org-section {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    overflow: hidden;

    .section-header {
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #111827;
        margin: 0;
      }
    }
  }

  // 表格样式
  .sub-org-table {
    padding: 0 20px 20px;

    ::v-deep .el-table {
      border-radius: 8px;
      overflow: hidden;

      th {
        background: #f9fafb;
        color: #374151;
        font-weight: 500;
        font-size: 13px;
        padding: 12px 16px;
      }

      td {
        padding: 12px 16px;
        color: #4b5563;
      }

      .el-table__row:hover {
        background: #f9fafb;
      }
    }
  }

  .table-org-name {
    display: flex;
    align-items: center;
    gap: 10px;

    .table-icon {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #fff;

      &.platform-bg {
        background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
      }
      &.area-bg {
        background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
      }
      &.school-bg {
        background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
      }
      &.grade-bg {
        background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
      }
      &.class-bg {
        background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
      }
    }
  }

  .table-actions {
    display: flex;
    gap: 8px;

    .el-button {
      padding: 4px 8px;
      font-size: 14px;

      i {
        font-size: 14px;
      }
    }

    .delete-btn {
      color: #ef4444;

      &:hover {
        color: #dc2626;
      }
    }
  }

  // 空状态
  .empty-sub-org {
    padding: 60px 20px;
    text-align: center;

    .empty-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 16px;
      background: #f3f4f6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 36px;
        color: #d1d5db;
      }
    }

    .empty-text {
      font-size: 16px;
      color: #374151;
      margin-bottom: 8px;
    }

    // .el-button {
    //   margin-top: 16px;
    //   background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
    //   border: none;

    //   &:hover {
    //     background: linear-gradient(135deg, #4338ca 0%, #2563eb 100%);
    //   }
    // }
  }

  // 右侧空状态
  .empty-state {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;

    .empty-icon {
      width: 100px;
      height: 100px;
      background: #f3f4f6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;

      i {
        font-size: 48px;
        color: #d1d5db;
      }
    }

    .empty-text {
      font-size: 18px;
      color: #374151;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .empty-desc {
      font-size: 14px;
      color: #9ca3af;
    }
  }

  // 节点下拉菜单
  .node-dropdown-menu {
    padding: 4px 0;

    .el-dropdown-menu__item {
      padding: 8px 16px;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;

      i {
        font-size: 14px;
        color: #6b7280;
      }

      &:hover {
        background: #f3f4f6;
      }

      &.delete-item {
        color: #ef4444;

        i {
          color: #ef4444;
        }

        &:hover {
          background: #fef2f2;
        }
      }
    }
  }

  // 滚动条样式
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
</style>
