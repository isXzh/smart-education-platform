<template>
  <div class="device-management-page">
    <!-- 左侧组织树 -->
    <div class="left-sidebar">
      <div class="sidebar-header">
        <h3 class="sidebar-title">
          <i class="el-icon-s-custom"></i>
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
          node-key="id"
          default-expand-all
          @node-click="handleNodeClick"
        >
          <template slot-scope="{ node, data }">
            <span class="custom-tree-node">
              <span class="node-label">
                <i :class="getOrgIcon(data.type)" class="node-icon"></i>
                {{ node.label }}
              </span>
            </span>
          </template>
        </el-tree>
      </div>
    </div>

    <!-- 右侧设备表格 -->
    <div class="right-content">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-bar">
        <span class="breadcrumb-item active">设备资源管理</span>
      </div>

      <!-- 操作栏 -->
      <div class="toolbar">
        <!-- <div class="toolbar-left">
          <el-button type="primary" size="small" @click="openAddDeviceDialog">
            <i class="el-icon-plus"></i> 添加设备
          </el-button>
          <el-button size="small" @click="importDevice">
            <i class="el-icon-upload2"></i> 导入
          </el-button>
          <el-button size="small" @click="exportDevice">
            <i class="el-icon-download"></i> 导出
          </el-button>
          <el-button
            class="delete-device"
            size="small"
            @click="batchDelete"
            :disabled="!selectedDevices.length"
          >
            <i class="el-icon-delete"></i> 删除
          </el-button>
        </div> -->

        <div class="toolbar-right">
          <el-input v-model="filters.search" placeholder="搜索设备名称/SN码..." size="small" class="search-input">
            <i slot="prefix" class="el-icon-search"></i>
          </el-input>
          <el-select v-model="filters.status" placeholder="全部状态" size="small" class="status-select">
            <el-option label="全部状态" value=""></el-option>
            <el-option label="在线" value="online"></el-option>
            <el-option label="离线" value="offline"></el-option>
            <el-option label="使用中" value="inuse"></el-option>
            <el-option label="已过期" value="expired"></el-option>
          </el-select>
        </div>
      </div>

      <!-- 设备表格 -->
      <div class="table-container">
        <el-table
          :data="paginatedDevices"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          v-loading="loading"
          stripe
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="name" label="名称" min-width="140"></el-table-column>
          <el-table-column prop="department" label="部门" min-width="200">
            <template slot-scope="scope">
              <span class="department-text">{{ scope.row.department }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="model" label="设备型号" width="120"></el-table-column>
          <el-table-column prop="sn" label="SN码" width="120">
            <template slot-scope="scope">
              <span class="sn-code">{{ scope.row.sn }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="90">
            <template slot-scope="scope">
              <span :class="getStatusBadgeClass(scope.row.status)">
                <span class="status-dot"></span>
                {{ getStatusLabel(scope.row.status) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="expiryDate" label="到期时间" width="110"></el-table-column>
          <el-table-column prop="activationDate" label="激活时间" width="110"></el-table-column>
          <el-table-column label="操作" width="140" fixed="right">
            <template slot-scope="scope">
              <div class="operation-btns">
                <el-button size="mini" type="text" @click="handleEdit(scope.row)" title="编辑">
                  <i class="el-icon-edit"></i>
                </el-button>
                <el-button size="mini" type="text" @click="handleViewLog(scope.row)" title="查看日志">
                  <i class="el-icon-document"></i>
                </el-button>
                <el-button size="mini" type="text" class="delete-btn" @click="handleDelete(scope.row)" title="删除">
                  <i class="el-icon-delete"></i>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <div class="pagination-info">
            共 {{ filteredDevices.length }} 台设备，当前第 {{ currentPage }} / {{ totalPages }} 页
          </div>
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            layout="prev, pager, next"
            :total="filteredDevices.length"
          ></el-pagination>
        </div>
      </div>
    </div>

    <!-- 添加/编辑设备弹窗 -->
    <el-dialog
      :title="deviceDialog.title"
      :visible.sync="deviceDialog.visible"
      width="600px"
      :close-on-click-modal="false"
      custom-class="device-dialog"
    >
      <el-form ref="deviceForm" :model="deviceForm" :rules="deviceRules" label-width="100px" size="small">
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="deviceForm.name" placeholder="请输入设备名称，如：移动课堂箱-A01"></el-input>
        </el-form-item>

        <el-form-item label="所属部门" prop="departmentId">
          <el-cascader
            v-model="deviceForm.departmentId"
            :options="orgCascaderOptions"
            :props="{ checkStrictly: true, value: 'id', label: 'label' }"
            placeholder="请选择部门"
            style="width: 100%"
          ></el-cascader>
        </el-form-item>

        <el-form-item label="设备型号" prop="model">
          <el-select v-model="deviceForm.model" placeholder="请选择设备型号" style="width: 100%">
            <el-option label="MCB-2024-PRO" value="MCB-2024-PRO"></el-option>
            <el-option label="MCB-2024-STD" value="MCB-2024-STD"></el-option>
            <el-option label="MCB-2024-LITE" value="MCB-2024-LITE"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="SN码" prop="sn">
          <el-input v-model="deviceForm.sn" placeholder="请输入设备SN码，如：SN202401001"></el-input>
        </el-form-item>

        <el-form-item label="设备状态" prop="status">
          <el-select v-model="deviceForm.status" placeholder="请选择设备状态" style="width: 100%">
            <el-option label="在线" value="online">
              <span class="status-option"> <span class="status-dot online"></span>在线 </span>
            </el-option>
            <el-option label="离线" value="offline">
              <span class="status-option"> <span class="status-dot offline"></span>离线 </span>
            </el-option>
            <el-option label="使用中" value="inuse">
              <span class="status-option"> <span class="status-dot inuse"></span>使用中 </span>
            </el-option>
            <el-option label="已过期" value="expired">
              <span class="status-option"> <span class="status-dot expired"></span>已过期 </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="激活时间" prop="activationDate">
          <el-date-picker
            v-model="deviceForm.activationDate"
            type="date"
            placeholder="选择日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>

        <el-form-item label="到期时间" prop="expiryDate">
          <el-date-picker
            v-model="deviceForm.expiryDate"
            type="date"
            placeholder="选择日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="deviceDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveDevice">添加</el-button>
      </div>
    </el-dialog>

    <!-- 设备操作日志弹窗 -->
    <el-dialog
      title="设备操作日志"
      :visible.sync="logDialog.visible"
      width="900px"
      :close-on-click-modal="false"
      custom-class="log-dialog"
    >
      <!-- 设备信息卡片 -->
      <div class="log-device-info" v-if="logDialog.device">
        <div class="info-row">
          <div class="info-item">
            <span class="info-label">设备型号</span>
            <span class="info-value">{{ logDialog.device.model }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">所属部门</span>
            <span class="info-value">{{ logDialog.device.department }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">激活时间</span>
            <span class="info-value">{{ logDialog.device.activationDate }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">到期时间</span>
            <span class="info-value">{{ logDialog.device.expiryDate }}</span>
          </div>
        </div>
      </div>

      <!-- 日志表格 -->
      <div class="log-table-container">
        <el-table :data="deviceLogs" style="width: 100%" stripe>
          <el-table-column label="时间" width="160">
            <template slot-scope="scope">
              <div class="log-time">
                <i class="el-icon-time"></i>
                {{ scope.row.time }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="action" label="操作类型" width="100">
            <template slot-scope="scope">
              <span class="action-type">{{ scope.row.action }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="operator" label="操作人" width="100">
            <template slot-scope="scope">
              <div class="operator">
                <i class="el-icon-user"></i>
                {{ scope.row.operator }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template slot-scope="scope">
              <span :class="getLogStatusClass(scope.row.status)">
                {{ getLogStatusLabel(scope.row.status) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="details" label="详情" min-width="200">
            <template slot-scope="scope">
              <span class="log-details">{{ scope.row.details }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 底部 -->
      <div slot="footer" class="log-dialog-footer">
        <div class="log-summary">共 {{ deviceLogs.length }} 条操作记录</div>
        <el-button type="primary" @click="logDialog.visible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'DeviceManagement',
    data() {
      return {
        loading: false,
        selectedDevices: [],
        filters: {
          search: '',
          status: '',
        },
        currentPage: 1,
        pageSize: 10,
        orgFilter: '',
        selectedNode: null,
        deviceDialog: {
          visible: false,
          title: '添加设备',
        },
        logDialog: {
          visible: false,
          device: null,
        },
        // 组织数据
        orgData: [
          {
            id: '1',
            label: '兴图新科教育集团',
            type: 'group',
            children: [
              {
                id: '1-1',
                label: '第一实验小学',
                type: 'school',
                children: [
                  {
                    id: '1-1-1',
                    label: '小学部',
                    type: 'department',
                    children: [
                      {
                        id: '1-1-1-1',
                        label: '一年级',
                        type: 'grade',
                        children: [
                          {
                            id: '1-1-1-1-1',
                            label: '101教室',
                            type: 'classroom',
                          },
                          {
                            id: '1-1-1-1-2',
                            label: '102教室',
                            type: 'classroom',
                          },
                        ],
                      },
                      {
                        id: '1-1-1-2',
                        label: '二年级',
                        type: 'grade',
                        children: [
                          {
                            id: '1-1-1-2-1',
                            label: '201教室',
                            type: 'classroom',
                          },
                          {
                            id: '1-1-1-2-2',
                            label: '202教室',
                            type: 'classroom',
                          },
                        ],
                      },
                      {
                        id: '1-1-1-3',
                        label: '三年级',
                        type: 'grade',
                        children: [
                          {
                            id: '1-1-1-3-1',
                            label: '301教室',
                            type: 'classroom',
                          },
                          {
                            id: '1-1-1-3-2',
                            label: '302教室',
                            type: 'classroom',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id: '1-2',
                label: '第二实验中学',
                type: 'school',
                children: [
                  {
                    id: '1-2-1',
                    label: '初中部',
                    type: 'department',
                    children: [
                      {
                        id: '1-2-1-1',
                        label: '初一年级',
                        type: 'grade',
                        children: [
                          {
                            id: '1-2-1-1-1',
                            label: '初一(1)班',
                            type: 'classroom',
                          },
                          {
                            id: '1-2-1-1-2',
                            label: '初一(2)班',
                            type: 'classroom',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        defaultProps: {
          children: 'children',
          label: 'label',
        },
        // 设备数据
        deviceData: [
          {
            id: 1,
            name: '移动课堂箱-A01',
            department: '第一实验小学/小学部/三年级/301教室',
            departmentId: '1-1-1-3-1',
            model: 'MCB-2024-PRO',
            sn: 'SN202401001',
            status: 'online',
            expiryDate: '2025-12-31',
            activationDate: '2024-01-15',
          },
          {
            id: 2,
            name: '移动课堂箱-A02',
            department: '第一实验小学/小学部/三年级/301教室',
            departmentId: '1-1-1-3-1',
            model: 'MCB-2024-PRO',
            sn: 'SN202401002',
            status: 'inuse',
            expiryDate: '2025-12-31',
            activationDate: '2024-01-15',
          },
          {
            id: 3,
            name: '移动课堂箱-B01',
            department: '第一实验小学/小学部/二年级/201教室',
            departmentId: '1-1-1-2-1',
            model: 'MCB-2024-STD',
            sn: 'SN202401003',
            status: 'offline',
            expiryDate: '2025-06-30',
            activationDate: '2024-02-01',
          },
          {
            id: 4,
            name: '移动课堂箱-C01',
            department: '第二实验中学/初中部/初一年级/初一(1)班',
            departmentId: '1-2-1-1-1',
            model: 'MCB-2024-PRO',
            sn: 'SN202401004',
            status: 'online',
            expiryDate: '2026-03-15',
            activationDate: '2024-01-20',
          },
          {
            id: 5,
            name: '移动课堂箱-D01',
            department: '第一实验小学/小学部/一年级/101教室',
            departmentId: '1-1-1-1-1',
            model: 'MCB-2024-LITE',
            sn: 'SN202401005',
            status: 'expired',
            expiryDate: '2024-12-31',
            activationDate: '2023-12-01',
          },
        ],
        // 设备日志
        deviceLogs: [
          {
            id: 1,
            time: '2026-04-03 14:25:30',
            action: '设备上线',
            operator: '系统',
            status: 'success',
            details: '设备自动连接成功',
          },
          {
            id: 2,
            time: '2026-04-03 09:15:20',
            action: '课程绑定',
            operator: '张老师',
            status: 'success',
            details: '绑定课程：数学基础课',
          },
          {
            id: 3,
            time: '2026-04-02 16:45:10',
            action: '设备离线',
            operator: '系统',
            status: 'warning',
            details: '设备断开连接',
          },
          {
            id: 4,
            time: '2026-04-02 08:30:05',
            action: '设备上线',
            operator: '系统',
            status: 'success',
            details: '设备自动连接成功',
          },
          {
            id: 5,
            time: '2026-04-01 15:20:00',
            action: '设备维护',
            operator: '李维',
            status: 'info',
            details: '例行检查，更新系统固件',
          },
          {
            id: 6,
            time: '2026-04-01 10:10:30',
            action: '课程解绑',
            operator: '王老师',
            status: 'success',
            details: '解绑课程：物理实验',
          },
          {
            id: 7,
            time: '2026-03-31 14:00:15',
            action: '设备异常',
            operator: '系统',
            status: 'error',
            details: '温度过高报警，已自动关机',
          },
          {
            id: 8,
            time: '2026-03-31 08:45:00',
            action: '设备配置',
            operator: '管理员',
            status: 'info',
            details: '更新设备参数配置',
          },
        ],
        // 表单
        deviceForm: {
          id: '',
          name: '',
          departmentId: '',
          model: '',
          sn: '',
          status: 'offline',
          expiryDate: '',
          activationDate: '',
        },
        deviceRules: {
          name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
          departmentId: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
          model: [{ required: true, message: '请选择设备型号', trigger: 'change' }],
          sn: [{ required: true, message: '请输入SN码', trigger: 'blur' }],
          activationDate: [{ required: true, message: '请选择激活时间', trigger: 'change' }],
          expiryDate: [{ required: true, message: '请选择到期时间', trigger: 'change' }],
        },
      };
    },
    computed: {
      // 过滤后的设备列表
      filteredDevices() {
        let result = [...this.deviceData];

        // 根据选中的组织节点过滤
        if (this.selectedNode) {
          result = result.filter(device => device.departmentId.startsWith(this.selectedNode.id));
        }

        // 根据搜索词过滤
        if (this.filters.search) {
          const query = this.filters.search.toLowerCase();
          result = result.filter(
            device => device.name.toLowerCase().includes(query) || device.sn.toLowerCase().includes(query)
          );
        }

        // 根据状态过滤
        if (this.filters.status) {
          result = result.filter(device => device.status === this.filters.status);
        }

        return result;
      },
      // 分页后的设备
      paginatedDevices() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.filteredDevices.slice(start, end);
      },
      // 总页数
      totalPages() {
        return Math.ceil(this.filteredDevices.length / this.pageSize);
      },
      // 组织级联选择器选项
      orgCascaderOptions() {
        return this.orgData;
      },
    },
    watch: {
      orgFilter(val) {
        this.$refs.orgTree.filter(val);
      },
    },
    methods: {
      filterNode(value, data) {
        if (!value) return true;
        return data.label.indexOf(value) !== -1;
      },
      getOrgIcon(type) {
        const icons = {
          group: 'el-icon-folder-opened',
          school: 'el-icon-folder-opened',
          department: 'el-icon-folder-opened',
          grade: 'el-icon-folder-opened',
          classroom: 'el-icon-office-building',
        };
        return icons[type] || 'el-icon-folder';
      },
      handleNodeClick(data) {
        this.selectedNode = data;
        this.currentPage = 1;
      },
      getStatusBadgeClass(status) {
        const classes = {
          online: 'status-badge online',
          offline: 'status-badge offline',
          inuse: 'status-badge inuse',
          expired: 'status-badge expired',
        };
        return classes[status] || 'status-badge';
      },
      getStatusLabel(status) {
        const labels = {
          online: '在线',
          offline: '离线',
          inuse: '使用中',
          expired: '已过期',
        };
        return labels[status] || status;
      },
      getLogStatusClass(status) {
        const classes = {
          success: 'log-status success',
          warning: 'log-status warning',
          error: 'log-status error',
          info: 'log-status info',
        };
        return classes[status] || 'log-status';
      },
      getLogStatusLabel(status) {
        const labels = {
          success: '成功',
          warning: '警告',
          error: '错误',
          info: '信息',
        };
        return labels[status] || status;
      },
      handleSelectionChange(selection) {
        this.selectedDevices = selection.map(item => item.id);
      },
      handleSizeChange(size) {
        this.pageSize = size;
        this.currentPage = 1;
      },
      handleCurrentChange(current) {
        this.currentPage = current;
      },
      // 打开添加设备弹窗
      openAddDeviceDialog() {
        this.deviceDialog.title = '添加设备';
        this.deviceDialog.visible = true;
        this.deviceForm = {
          id: '',
          name: '',
          departmentId: '',
          model: '',
          sn: '',
          status: 'offline',
          expiryDate: '',
          activationDate: new Date().toISOString().split('T')[0],
        };
      },
      // 编辑设备
      handleEdit(row) {
        this.deviceDialog.title = '编辑设备';
        this.deviceDialog.visible = true;
        this.deviceForm = {
          id: row.id,
          name: row.name,
          departmentId: row.departmentId,
          model: row.model,
          sn: row.sn,
          status: row.status,
          expiryDate: row.expiryDate,
          activationDate: row.activationDate,
        };
      },
      // 查看日志
      handleViewLog(row) {
        this.logDialog.device = row;
        this.logDialog.visible = true;
      },
      // 删除设备
      handleDelete(row) {
        this.$confirm(`确定要删除设备 "${row.name}" 吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          const index = this.deviceData.findIndex(item => item.id === row.id);
          if (index > -1) {
            this.deviceData.splice(index, 1);
            this.$message.success('删除成功');
          }
        });
      },
      // 批量删除
      batchDelete() {
        if (this.selectedDevices.length === 0) {
          this.$message.warning('请先选择要删除的设备');
          return;
        }
        this.$confirm(`确定要删除选中的 ${this.selectedDevices.length} 台设备吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.selectedDevices.forEach(id => {
            const index = this.deviceData.findIndex(item => item.id === id);
            if (index > -1) {
              this.deviceData.splice(index, 1);
            }
          });
          this.selectedDevices = [];
          this.$message.success('删除成功');
        });
      },
      // 保存设备
      saveDevice() {
        this.$refs.deviceForm.validate(valid => {
          if (valid) {
            if (this.deviceForm.id) {
              // 编辑
              const index = this.deviceData.findIndex(item => item.id === this.deviceForm.id);
              if (index > -1) {
                this.deviceData.splice(index, 1, { ...this.deviceForm });
              }
            } else {
              // 新增
              const newDevice = {
                ...this.deviceForm,
                id: this.deviceData.length + 1,
                department: this.getDepartmentPath(this.deviceForm.departmentId),
              };
              this.deviceData.push(newDevice);
            }
            this.deviceDialog.visible = false;
            this.$message.success('保存成功');
          }
        });
      },
      // 获取部门路径
      getDepartmentPath(departmentId) {
        const findPath = (nodes, targetId, path = []) => {
          for (const node of nodes) {
            const currentPath = [...path, node.label];
            if (node.id === targetId) {
              return currentPath;
            }
            if (node.children) {
              const found = findPath(node.children, targetId, currentPath);
              if (found) return found;
            }
          }
          return null;
        };

        const path = findPath(this.orgData, departmentId);
        return path ? path.join('/') : '';
      },
      // 导入设备
      importDevice() {
        this.$message.info('导入功能开发中');
      },
      // 导出设备
      exportDevice() {
        this.$message.info('导出功能开发中');
      },
    },
  };
</script>

<style scoped>
  .device-management-page {
    display: flex;
    height: 100%;
    background: #f5f7fa;
  }

  /* 左侧边栏 */
  .left-sidebar {
    width: 260px;
    background: #fff;
    border-right: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;
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
  .expanded .node-icon {
    margin-right: 6px;
    color: #409eff;
    font-size: 14px;
  }
  .node-icon {
    margin-right: 6px;
    color: #409eff;
    font-size: 17px;
    font-weight: 500;
  }

  /* 右侧内容 */
  .right-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* 面包屑 */
  .breadcrumb-bar {
    padding: 12px 16px;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;
  }

  .breadcrumb-item {
    font-size: 14px;
    color: #606266;
  }

  .breadcrumb-item.active {
    color: #409eff;
    font-weight: 500;
  }

  /* 工具栏 */
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;
  }

  .toolbar-left {
    display: flex;
    gap: 8px;
    .el-button {
      font-size: 14px;
    }
  }

  .toolbar-right {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .search-input {
    width: 220px;
  }

  .status-select {
    width: 120px;
  }

  /* 表格容器 */
  .table-container {
    flex: 1;
    padding: 16px;
    overflow: auto;
  }

  .department-text {
    font-size: 13px;
    color: #606266;
  }

  .sn-code {
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: #606266;
  }

  /* 状态标签 */
  .status-badge {
    display: block;
    text-align: center;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .status-badge.online {
    background: #f0f9eb;
    color: #67c23a;
  }

  .status-badge.offline {
    background: #f5f7fa;
    color: #909399;
  }

  .status-badge.inuse {
    background: #ecf5ff;
    color: #409eff;
  }

  .status-badge.expired {
    background: #fef0f0;
    color: #f56c6c;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .status-dot.online {
    background: #67c23a;
  }

  .status-dot.offline {
    background: #909399;
  }

  .status-dot.inuse {
    background: #409eff;
  }

  .status-dot.expired {
    background: #f56c6c;
  }

  /* 操作按钮 */
  .operation-btns {
    display: flex;
    gap: 4px;
    justify-content: flex-end;
  }

  .operation-btns .el-button {
    padding: 4px 8px;
  }

  .operation-btns .delete-btn {
    color: #f56c6c;
  }

  .operation-btns .delete-btn:hover {
    color: #f78989;
  }

  /* 分页 */
  .pagination-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0 0;
    border-top: 1px solid #e4e7ed;
    margin-top: 16px;
  }

  .pagination-info {
    font-size: 13px;
    color: #606266;
  }

  /* 弹窗样式 */
  .device-dialog >>> .el-dialog__header {
    background: linear-gradient(135deg, #4f7cff 0%, #3b6bf5 100%);
    padding: 16px 20px;
  }

  .device-dialog >>> .el-dialog__title {
    color: #fff;
    font-size: 16px;
    font-weight: 500;
  }

  .device-dialog >>> .el-dialog__headerbtn .el-dialog__close {
    color: #fff;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  /* 日志弹窗样式 */
  .log-dialog >>> .el-dialog__header {
    background: linear-gradient(135deg, #4f7cff 0%, #3b6bf5 100%);
    padding: 16px 20px;
  }

  .log-dialog >>> .el-dialog__title {
    color: #fff;
    font-size: 16px;
    font-weight: 500;
  }

  .log-device-info {
    background: #f5f7fa;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .info-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .info-label {
    font-size: 12px;
    color: #909399;
  }

  .info-value {
    font-size: 13px;
    color: #303133;
    font-weight: 500;
  }
  .delete-device {
    color: red;
    border: 1px solid red;
  }
  .log-table-container {
    max-height: 400px;
    overflow-y: auto;
  }

  .log-time {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #606266;
    font-size: 13px;
  }

  .log-time i {
    color: #909399;
  }

  .action-type {
    font-size: 13px;
    color: #303133;
    font-weight: 500;
  }

  .operator {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #606266;
    font-size: 13px;
  }

  .operator i {
    color: #909399;
    font-size: 12px;
  }

  .log-status {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .log-status.success {
    background: #f0f9eb;
    color: #67c23a;
  }

  .log-status.warning {
    background: #fdf6ec;
    color: #e6a23c;
  }

  .log-status.error {
    background: #fef0f0;
    color: #f56c6c;
  }

  .log-status.info {
    background: #f4f4f5;
    color: #909399;
  }

  .log-details {
    font-size: 13px;
    color: #606266;
  }

  .log-dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .log-summary {
    font-size: 13px;
    color: #606266;
  }

  /* 状态选择器中的圆点 */
  .status-option {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* 树形菜单样式 */
  .device-management-page >>> .el-tree-node__content {
    height: 32px;
    padding: 0 8px;
  }

  .device-management-page >>> .el-tree-node__content:hover {
    background-color: #f5f7fa;
  }

  .device-management-page >>> .el-tree-node.is-current > .el-tree-node__content {
    background-color: #ecf5ff;
    color: #409eff;
  }
</style>
