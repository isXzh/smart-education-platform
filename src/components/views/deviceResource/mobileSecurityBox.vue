<template>
  <div class="msb-page">
    <!-- 面包屑 -->
    <div class="msb-breadcrumb">
      <span class="bc-link">首页</span>
      <span class="bc-sep">/</span>
      <span class="bc-link">设备管理</span>
      <span class="bc-sep">/</span>
      <span class="bc-current">移动保障箱</span>
    </div>

    <!-- 顶部状态卡片 -->
    <div class="status-cards">
      <div class="status-card">
        <div class="card-body">
          <div class="card-info">
            <div class="card-label">设备总数</div>
            <div class="card-value">{{ counts.total }}</div>
            <div class="card-trend flat">
              <i class="el-icon-minus"></i>
              <span>较昨日 +0</span>
            </div>
          </div>
          <div class="card-icon blue">
            <i class="el-icon-monitor"></i>
          </div>
        </div>
      </div>
      <div class="status-card">
        <div class="card-body">
          <div class="card-info">
            <div class="card-label">在线设备</div>
            <div class="card-value">{{ counts.online }}</div>
            <div class="card-trend up">
              <i class="el-icon-top"></i>
              <span>{{ onlineRate }}% 在线率</span>
            </div>
          </div>
          <div class="card-icon green">
            <i class="el-icon-connection"></i>
          </div>
        </div>
      </div>
      <div class="status-card">
        <div class="card-body">
          <div class="card-info">
            <div class="card-label">使用中</div>
            <div class="card-value">{{ counts.inUse }}</div>
            <div class="card-trend down">
              <i class="el-icon-bottom"></i>
              <span>{{ inUseRate }}% 占用率</span>
            </div>
          </div>
          <div class="card-icon blue">
            <i class="el-icon-data-line"></i>
          </div>
        </div>
      </div>
      <div class="status-card" :class="{ highlight: counts.expired >= 1 }">
        <div class="card-body">
          <div class="card-info">
            <div class="card-label">已过期</div>
            <div class="card-value" :class="{ red: counts.expired >= 1 }">{{ counts.expired }}</div>
            <div class="card-trend red">
              <span>需关注</span>
            </div>
          </div>
          <div class="card-icon red">
            <i class="el-icon-warning-outline"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 主表格容器 -->
    <div class="main-card">
      <div class="card-header">
        <div class="card-title-row">
          <div class="card-title">移动保障箱</div>
          <button class="map-entry-btn" v-if="false" @click="openDeviceMap">
            <i class="el-icon-location-outline"></i>
            设备分布图
          </button>
        </div>
        <div class="tab-switch">
          <button :class="['tab-btn', { active: activeTab === 'ledger' }]" @click="handleTabChange('ledger')">台账</button>
          <button :class="['tab-btn', { active: activeTab === 'region' }]" @click="handleTabChange('region')">区域管理</button>
        </div>
        <div v-if="activeTab === 'ledger'" class="card-toolbar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索设备名称/所属学校/SIP号码..."
            size="small"
            class="search-input"
            clearable
            @input="handleSearchDebounce"
          >
            <i slot="prefix" class="el-icon-search el-input__icon"></i>
          </el-input>
          <el-select
            v-model="statusFilter"
            placeholder="状态筛选"
            size="small"
            class="status-select"
            clearable
            @change="handleStatusChange"
          >
            <el-option label="全部状态" :value="null"></el-option>
            <el-option label="未上线" :value="0"></el-option>
            <el-option label="在线" :value="1"></el-option>
            <el-option label="使用中" :value="2"></el-option>
            <el-option label="维修中" :value="3"></el-option>
            <el-option label="已过期" :value="4"></el-option>
          </el-select>
          <el-button size="small" @click="handleExportExcel">
            <i class="el-icon-download"></i>
            导出Excel
          </el-button>
        </div>
        <div v-else class="region-toolbar">
          <div class="region-filter-group">
            <el-input
              v-model="regionSearchKeyword"
              placeholder="搜索设备名称或学校..."
              size="small"
              class="search-input"
              clearable
              @input="handleRegionSearchDebounce"
            >
              <i slot="prefix" class="el-icon-search el-input__icon"></i>
            </el-input>
            <el-select
              v-model="regionStatusFilter"
              placeholder="全部状态"
              size="small"
              class="status-select"
              clearable
              @change="handleRegionStatusChange"
            >
              <el-option label="全部状态" :value="null"></el-option>
              <el-option label="未上线" :value="0"></el-option>
              <el-option label="在线" :value="1"></el-option>
              <el-option label="使用中" :value="2"></el-option>
              <el-option label="维修中" :value="3"></el-option>
              <el-option label="已过期" :value="4"></el-option>
            </el-select>
            <el-button
              v-if="regionSearchKeyword || regionStatusFilter !== null"
              type="text"
              size="small"
              class="clear-filter-btn"
              @click="resetRegionFilters"
            >
              <i class="el-icon-close"></i>
              清除
            </el-button>
          </div>
          <div class="region-summary">
            共 <span>{{ regionTotal }}</span> 台设备， 在线
            <span class="online">{{ regionOnlineCount }}</span> 台， 使用中
            <span class="in-use">{{ regionInUseCount }}</span> 台
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'ledger'">
        <div class="table-wrapper" v-loading="loading">
          <el-table
            :data="deviceList"
            style="width: 100%"
            :header-cell-style="headerCellStyle"
            @selection-change="handleSelectionChange"
            stripe
          >
            <el-table-column type="selection" width="50" align="center"></el-table-column>
            <el-table-column label="序号" width="70" align="left">
              <template slot-scope="scope">
                {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
              </template>
            </el-table-column>
            <el-table-column prop="deviceName" label="设备名称" min-width="140">
              <template slot-scope="scope">
                <span class="device-name">{{ scope.row.deviceName || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="所属学校" min-width="200">
              <template slot-scope="scope">
                <span class="dept-text">{{ scope.row.deptNamePath || scope.row.deptName || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="number" label="SIP 号码" min-width="180">
              <template slot-scope="scope">
                <span class="sip-code">{{ scope.row.number || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="110">
              <template slot-scope="scope">
                <span class="status-tag" :style="getStatusStyle(scope.row.confirmStatus)">
                  <span class="status-dot" :style="{ background: getStatusDot(scope.row.confirmStatus) }"></span>
                  {{ getStatusLabel(scope.row.confirmStatus) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="最后在线" width="160">
              <template slot-scope="scope">
                <span class="last-online">{{ formatLastOnline(scope.row.lastHeartbeatAt) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="right">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="openDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-wrapper">
          <div class="pagination-info">共 {{ total }} 条</div>
          <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handleCurrentChange"
          ></el-pagination>
        </div>
      </div>
      <div v-else class="region-management">
        <div class="region-table-wrapper" v-loading="regionLoading">
          <table class="region-table">
            <thead>
              <tr>
                <th>设备名称</th>
                <th>当前所在学校</th>
                <th>上一个学校</th>
                <th>调度备注</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="regionList.length === 0">
                <td colspan="5" class="region-empty">暂无匹配的设备</td>
              </tr>
              <tr
                v-for="item in regionList"
                :key="item.id"
                :class="['region-row', { borrowed: item.borrowStatus === 1 }]"
              >
                <td>
                  <div class="region-device-name-row">
                    <span class="region-device-name">{{ item.deviceName || '-' }}</span>
                    <span v-if="item.borrowStatus === 1" class="borrowed-tag">借调中</span>
                  </div>
                  <div class="region-sn">{{ item.number || '-' }}</div>
                </td>
                <td>
                  <el-cascader
                    v-if="editingLocationId === item.id"
                    :ref="'regionDeptCascader' + item.id"
                    v-model="editingDeptCode"
                    :options="deptOptions"
                    :props="regionCascaderProps"
                    placeholder="请选择学校"
                    size="mini"
                    class="region-cascader"
                    clearable
                    filterable
                    @change="handleRegionDeptChange"
                  ></el-cascader>
                  <button v-else class="current-school-btn" title="点击调度至其他学校" @click="startEditRegionLocation(item)">
                    <i class="el-icon-location-outline"></i>
                    {{ item.borrowDeptNamePath || item.borrowDeptName || '-' }}
                  </button>
                </td>
                <td class="previous-school">{{ item.previousSchoolNamePath || item.previousSchoolName || '-' }}</td>
                <td>
                  <el-input
                    v-if="editingRemarkId === item.id"
                    :ref="'regionRemarkInput' + item.id"
                    v-model="editingRemarkValue"
                    size="mini"
                    class="region-remark-input"
                    @keyup.enter.native="saveRegionRemark(item)"
                    @keyup.esc.native="cancelRegionRemark"
                    @blur="saveRegionRemark(item)"
                  ></el-input>
                  <button
                    v-else
                    class="region-remark-btn"
                    :title="item.dispatchRemark || '点击编辑调度备注'"
                    @click="startEditRegionRemark(item)"
                  >
                    <span v-if="item.dispatchRemark">{{ item.dispatchRemark }}</span>
                    <span v-else class="remark-placeholder">点击编辑调度备注</span>
                  </button>
                </td>
                <td>
                  <span class="status-tag" :style="getStatusStyle(item.confirmStatus)">
                    <span class="status-dot" :style="{ background: getStatusDot(item.confirmStatus) }"></span>
                    {{ getStatusLabel(item.confirmStatus) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination-wrapper">
          <div class="pagination-info">共 {{ regionTotal }} 条</div>
          <el-pagination
            background
            layout="prev, pager, next"
            :total="regionTotal"
            :page-size="regionPageSize"
            :current-page="regionCurrentPage"
            @current-change="handleRegionCurrentChange"
          ></el-pagination>
        </div>
      </div>
    </div>

    <device-map-dialog :visible.sync="deviceMapVisible" @device-detail="handleMapDeviceDetail" />

    <!-- 详情抽屉 -->
    <el-drawer
      :visible.sync="detailVisible"
      :with-header="false"
      direction="rtl"
      size="480px"
      custom-class="msb-detail-drawer"
      append-to-body
    >
      <div class="detail-wrapper" v-if="detailData" v-loading="detailLoading">
        <div class="detail-header">
          <div>
            <div class="detail-title">设备详情</div>
            <div class="detail-subtitle">{{ detailData.deviceName }} · {{ detailData.number || '-' }}</div>
          </div>
          <button class="close-btn" @click="detailVisible = false">
            <i class="el-icon-close"></i>
          </button>
        </div>

        <div class="detail-body">
          <!-- 基本信息 -->
          <section class="detail-section">
            <div class="section-title">基本信息</div>
            <div class="info-grid two">
              <div class="info-cell">
                <div class="info-label">设备名称</div>
                <div class="info-value">{{ detailData.deviceName || '-' }}</div>
              </div>
              <div class="info-cell">
                <div class="info-label">SIP 号码</div>
                <div class="info-value">{{ detailData.number || '-' }}</div>
              </div>
            </div>
          </section>

          <!-- 所属组织 -->
          <section class="detail-section">
            <div class="section-title">所属组织</div>
            <div class="org-text">
              {{ detailData.deptNamePath || detailData.deptName || '-' }}
            </div>
          </section>

          <!-- 设备状态 -->
          <section class="detail-section">
            <div class="section-title">设备状态</div>
            <div class="status-row">
              <span class="status-tag" :style="getStatusStyle(detailData.confirmStatus)">
                <span class="status-dot" :style="{ background: getStatusDot(detailData.confirmStatus) }"></span>
                {{ getStatusLabel(detailData.confirmStatus) }}
              </span>
              <span class="status-desc">{{ getStatusDesc(detailData.confirmStatus) }}</span>
            </div>
          </section>

          <!-- 时间信息 -->
          <section class="detail-section">
            <div class="section-title">时间信息</div>
            <div class="info-grid three">
              <div class="info-cell">
                <div class="info-label">激活时间</div>
                <div class="info-value">{{ formatDate(detailData.activeTime) }}</div>
              </div>
              <div class="info-cell">
                <div class="info-label">到期时间</div>
                <div class="info-value" :class="{ red: detailData.confirmStatus === 4 }">
                  {{ formatDate(detailData.expireDate) }}
                </div>
              </div>
              <div class="info-cell">
                <div class="info-label">最后在线</div>
                <div class="info-value">{{ formatLastOnline(detailData.lastHeartbeatAt) }}</div>
              </div>
            </div>
          </section>

          <hr class="detail-divider" />

          <!-- 近 7 天使用记录 -->
          <section class="detail-section">
            <div class="usage-header">
              <div class="section-title">近 7 天使用记录</div>
              <div class="usage-summary">
                使用 <span class="used-days">{{ usedDays }}</span> / 7 天
              </div>
            </div>
            <div class="usage-chart">
              <div class="chart-bars">
                <div v-for="(d, i) in weeklyUsage" :key="i" class="chart-bar-col">
                  <div class="chart-bar-wrap">
                    <div
                      class="chart-bar"
                      :class="{ used: d.hours > 0 }"
                      :style="{ height: d.hours > 0 ? '100%' : '6px' }"
                    ></div>
                  </div>
                </div>
              </div>
              <div class="chart-labels">
                <div v-for="(d, i) in weeklyUsage" :key="i" class="chart-label-col">
                  <div class="chart-status" :class="{ used: d.hours > 0 }">
                    {{ d.hours > 0 ? '已使用' : '未使用' }}
                  </div>
                  <div class="chart-date">{{ formatShortDate(d.date) }}</div>
                </div>
              </div>
            </div>
          </section>

          <!-- 最近排课记录 -->
          <section class="detail-section">
            <div class="section-title">最近排课记录</div>
            <div class="recent-table-wrap">
              <table class="recent-table">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>课程名称</th>
                    <th>角色</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!recentSchedules || recentSchedules.length === 0">
                    <td colspan="3" class="empty-cell">暂无排课记录</td>
                  </tr>
                  <tr v-for="(s, i) in recentSchedules" :key="i">
                    <td class="td-date">{{ formatDate(s.lessonDate) }}</td>
                    <td class="td-name">{{ s.courseName }}</td>
                    <td>
                      <span class="role-tag" :class="s.teachType === 1 ? 'main' : 'assist'">
                        {{ s.teachTypeName || (s.teachType === 1 ? '主讲' : '辅讲') }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div class="detail-footer">
          <el-button
            v-if="detailData.confirmStatus === 3"
            class="mark-btn normal"
            @click="handleToggleRepair(detailData, false)"
          >
            <i class="el-icon-circle-check"></i>
            标记正常
          </el-button>
          <el-button v-else class="mark-btn repair" @click="handleToggleRepair(detailData, true)">
            <i class="el-icon-set-up"></i>
            标记维修
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
  import device from '@/api/device';
  import DeviceMapDialog from './dialog/DeviceMapDialog.vue';
  import { buildDeviceFromMapItem } from './data/deviceMapData';

  const STATUS_LABEL = {
    0: '未上线',
    1: '在线',
    2: '使用中',
    3: '维修中',
    4: '已过期',
  };

  const STATUS_COLOR = {
    0: { color: '#8C8C8C', bg: '#F5F5F5', dot: '#8C8C8C' },
    1: { color: '#52C41A', bg: '#F6FFED', dot: '#52C41A' },
    2: { color: '#1890FF', bg: '#E6F4FF', dot: '#1890FF' },
    3: { color: '#FA8C16', bg: '#FFF7E6', dot: '#FA8C16' },
    4: { color: '#FF4D4F', bg: '#FFF1F0', dot: '#FF4D4F' },
  };

  const STATUS_DESC = {
    0: '设备未上线',
    1: '设备心跳正常，当前无排课占用',
    2: '设备在线且当前时段有排课占用',
    3: '管理员手动标记为维修',
    4: '设备授权已到期',
  };

  export default {
    name: 'MobileSecurityBox',
    components: { DeviceMapDialog },
    // 初始化移动保障箱页面的响应式数据
    data() {
      return {
        loading: false,
        activeTab: 'ledger',
        searchKeyword: '',
        statusFilter: null,
        currentPage: 1,
        pageSize: 10,
        total: 0,
        deviceList: [],
        selectedDevices: [],
        searchTimer: null,
        regionLoading: false,
        regionSearchKeyword: '',
        regionStatusFilter: null,
        regionCurrentPage: 1,
        regionPageSize: 10,
        regionTotal: 0,
        regionList: [],
        regionSearchTimer: null,
        deptOptions: [],
        regionCascaderProps: {
          value: 'deptCode',
          label: 'deptName',
          children: 'childDepts',
          checkStrictly: true,
          emitPath: false,
        },
        editingLocationId: null,
        editingDeptCode: '',
        pendingDeptNode: null,
        editingRemarkId: null,
        editingRemarkValue: '',
        savingRegionLocation: false,
        savingRegionRemark: false,
        detailVisible: false,
        detailLoading: false,
        detailData: null,
        recentSchedules: [],
        dailyUsages: [],
        deviceMapVisible: false,
      };
    },
    computed: {
      // 统计当前台账列表的设备总数、在线数、使用中数量和过期数量
      counts() {
        const allDevices = this.deviceList;
        const total = this.total;
        const online = allDevices.filter(d => d.confirmStatus === 1 || d.confirmStatus === 2).length;
        const inUse = allDevices.filter(d => d.confirmStatus === 2).length;
        const expired = allDevices.filter(d => d.confirmStatus === 4).length;
        return { total, online, inUse, expired };
      },
      // 计算当前台账设备的在线率
      onlineRate() {
        if (!this.counts.total) return '0.0';
        return ((this.counts.online / this.counts.total) * 100).toFixed(1);
      },
      // 计算当前台账设备的使用率
      inUseRate() {
        if (!this.counts.total) return '0.0';
        return ((this.counts.inUse / this.counts.total) * 100).toFixed(1);
      },
      // 生成设备近七天使用时长数据
      weeklyUsage() {
        const today = new Date();
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = this.toDateString(d);
          const item = this.dailyUsages.find(u => (u.date || '').startsWith(dateStr));
          days.push({ date: dateStr, hours: item ? Number(item.hours) || 0 : 0 });
        }
        return days;
      },
      // 统计近七天内有使用记录的天数
      usedDays() {
        return this.weeklyUsage.filter(d => d.hours > 0).length;
      },
      // 统计区域管理列表中的在线设备数量
      regionOnlineCount() {
        return this.regionList.filter(d => d.confirmStatus === 1 || d.confirmStatus === 2).length;
      },
      // 统计区域管理列表中的使用中设备数量
      regionInUseCount() {
        return this.regionList.filter(d => d.confirmStatus === 2).length;
      },
    },
    // 页面挂载后加载移动保障箱设备台账列表
    mounted() {
      this.loadDeviceList();
    },
    // 组件销毁前清理搜索定时器和全局事件监听
    beforeDestroy() {
      if (this.searchTimer) clearTimeout(this.searchTimer);
      if (this.regionSearchTimer) clearTimeout(this.regionSearchTimer);
      document.removeEventListener('mousedown', this.handleRegionLocationOutsideClick, true);
    },
    methods: {
      // 设置设备台账表格表头样式
      headerCellStyle() {
        return {
          background: '#FAFAFA',
          color: '#4E5969',
          fontWeight: '500',
          fontSize: '12px',
        };
      },
      // 加载移动保障箱设备台账分页列表
      async loadDeviceList() {
        try {
          this.loading = true;
          const params = {
            pageNum: this.currentPage,
            pageSize: this.pageSize,
          };
          if (this.searchKeyword) params.keyword = this.searchKeyword;
          if (this.statusFilter !== null && this.statusFilter !== '') {
            params.status = this.statusFilter;
          }
          const res = await device.page(params);
          if (res && res.success && res.data) {
            this.deviceList = res.data.list || [];
            this.total = res.data.total || 0;
          } else {
            this.deviceList = [];
            this.total = 0;
          }
        } catch (error) {
          console.error('加载设备列表失败:', error);
          this.$message.error('加载设备列表失败');
        } finally {
          this.loading = false;
        }
      },
      // 切换台账和区域管理页签并初始化对应数据
      handleTabChange(tab) {
        if (this.activeTab === tab) return;
        if (this.editingLocationId) {
          document.removeEventListener('mousedown', this.handleRegionLocationOutsideClick, true);
          this.editingLocationId = null;
          this.editingDeptCode = '';
          this.pendingDeptNode = null;
        }
        this.activeTab = tab;
        if (tab === 'region') {
          if (this.regionList.length === 0) this.loadRegionList();
          if (this.deptOptions.length === 0) this.loadDeptOptions();
        }
      },
      // 加载移动保障箱区域管理分页列表
      async loadRegionList() {
        try {
          this.regionLoading = true;
          const params = {
            pageNum: this.regionCurrentPage,
            pageSize: this.regionPageSize,
          };
          if (this.regionSearchKeyword) params.keyword = this.regionSearchKeyword;
          if (this.regionStatusFilter !== null && this.regionStatusFilter !== '') {
            params.confirmStatus = this.regionStatusFilter;
          }
          const res = await device.pageRegion(params);
          if (res && res.success && res.data) {
            this.regionList = res.data.list || [];
            this.regionTotal = res.data.total || 0;
          } else {
            this.regionList = [];
            this.regionTotal = 0;
          }
        } catch (error) {
          console.error('加载区域管理列表失败:', error);
          this.$message.error('加载区域管理列表失败');
        } finally {
          this.regionLoading = false;
        }
      },
      // 加载组织目录树作为区域调度学校选项
      async loadDeptOptions() {
        try {
          const res = await device.deptTree();
          if (res && res.success && res.data) {
            this.deptOptions = [this.normalizeDeptNode(res.data, '')];
          }
        } catch (error) {
          console.error('加载组织目录失败:', error);
          this.$message.error('加载组织目录失败');
        }
      },
      // 递归标准化组织节点并补充完整部门路径
      normalizeDeptNode(node, parentPath) {
        const deptNamePath = node.deptNamePath || (parentPath ? `${parentPath}/${node.deptName || ''}` : node.deptName || '');
        return {
          ...node,
          deptNamePath,
          childDepts: (node.childDepts || []).map(child => this.normalizeDeptNode(child, deptNamePath)),
        };
      },
      // 区域管理搜索输入防抖并刷新列表
      handleRegionSearchDebounce() {
        if (this.regionSearchTimer) clearTimeout(this.regionSearchTimer);
        this.regionSearchTimer = setTimeout(() => {
          this.regionCurrentPage = 1;
          this.loadRegionList();
        }, 300);
      },
      // 区域管理状态筛选变化后刷新列表
      handleRegionStatusChange() {
        this.regionCurrentPage = 1;
        this.loadRegionList();
      },
      // 重置区域管理搜索和状态筛选条件
      resetRegionFilters() {
        this.regionSearchKeyword = '';
        this.regionStatusFilter = null;
        this.regionCurrentPage = 1;
        this.loadRegionList();
      },
      // 切换区域管理分页页码并刷新列表
      handleRegionCurrentChange(page) {
        this.regionCurrentPage = page;
        this.loadRegionList();
      },
      // 开始编辑设备当前所在学校并展开学校选择器
      async startEditRegionLocation(item) {
        document.removeEventListener('mousedown', this.handleRegionLocationOutsideClick, true);
        this.editingLocationId = item.id;
        this.editingDeptCode = item.borrowDeptCode || '';
        this.pendingDeptNode = null;
        if (this.deptOptions.length === 0) await this.loadDeptOptions();
        this.$nextTick(() => {
          const cascader = this.$refs[`regionDeptCascader${item.id}`];
          const target = Array.isArray(cascader) ? cascader[0] : cascader;
          if (target && target.toggleDropDownVisible) target.toggleDropDownVisible(true);
          setTimeout(() => {
            document.addEventListener('mousedown', this.handleRegionLocationOutsideClick, true);
          }, 0);
        });
      },
      // 记录区域调度时选择的目标学校节点
      handleRegionDeptChange(value) {
        const deptCode = Array.isArray(value) ? value[value.length - 1] : value;
        this.editingDeptCode = deptCode || '';
        this.pendingDeptNode = this.findDeptNode(this.deptOptions, deptCode);
      },
      // 处理区域学校选择器外部点击并触发保存
      handleRegionLocationOutsideClick(event) {
        if (!this.editingLocationId) return;
        const cascader = this.$refs[`regionDeptCascader${this.editingLocationId}`];
        const target = Array.isArray(cascader) ? cascader[0] : cascader;
        const inputEl = target && target.$el;
        const dropdownEl = document.querySelector('.el-cascader__dropdown');
        if ((inputEl && inputEl.contains(event.target)) || (dropdownEl && dropdownEl.contains(event.target))) return;
        const item = this.regionList.find(row => row.id === this.editingLocationId);
        this.closeRegionCascader(target);
        document.removeEventListener('mousedown', this.handleRegionLocationOutsideClick, true);
        if (item) this.saveRegionLocation(item);
      },
      // 关闭区域调度学校级联选择器
      closeRegionCascader(cascader) {
        if (!cascader) return;
        if (cascader.dropDownVisible !== undefined) cascader.dropDownVisible = false;
        if (cascader.toggleDropDownVisible) cascader.toggleDropDownVisible(false);
      },
      // 保存设备借调后的目标学校信息
      async saveRegionLocation(item) {
        if (this.editingLocationId !== item.id || this.savingRegionLocation) return;
        const deptNode = this.pendingDeptNode || this.findDeptNode(this.deptOptions, this.editingDeptCode);
        if (!deptNode) {
          document.removeEventListener('mousedown', this.handleRegionLocationOutsideClick, true);
          this.editingLocationId = null;
          this.editingDeptCode = '';
          this.pendingDeptNode = null;
          return;
        }
        if (deptNode.deptCode === item.borrowDeptCode) {
          document.removeEventListener('mousedown', this.handleRegionLocationOutsideClick, true);
          this.editingLocationId = null;
          this.editingDeptCode = '';
          this.pendingDeptNode = null;
          return;
        }
        this.savingRegionLocation = true;
        try {
          const res = await device.borrowDevice({
            id: item.id,
            borrowDeptCode: deptNode.deptCode,
            borrowDeptName: deptNode.deptName,
            borrowDeptNamePath: deptNode.deptNamePath,
          });
          if (res && res.success) {
            this.$message.success('设备借调成功');
            item.borrowStatus = 1;
            item.previousSchoolCode = item.borrowDeptCode;
            item.previousSchoolName = item.borrowDeptName;
            item.previousSchoolNamePath = item.borrowDeptNamePath;
            item.borrowDeptCode = deptNode.deptCode;
            item.borrowDeptName = deptNode.deptName;
            item.borrowDeptNamePath = deptNode.deptNamePath;
            this.editingLocationId = null;
            this.editingDeptCode = '';
            this.pendingDeptNode = null;
            document.removeEventListener('mousedown', this.handleRegionLocationOutsideClick, true);
            await this.loadRegionList();
          } else {
            this.$message.error(res && res.message ? res.message : '设备借调失败');
          }
        } catch (error) {
          console.error('设备借调失败:', error);
          this.$message.error('设备借调失败');
        } finally {
          this.savingRegionLocation = false;
        }
      },
      // 根据部门编码在组织树中递归查找部门节点
      findDeptNode(nodes, deptCode) {
        if (!deptCode) return null;
        for (const node of nodes || []) {
          if (node.deptCode === deptCode) return node;
          const child = this.findDeptNode(node.childDepts || [], deptCode);
          if (child) return child;
        }
        return null;
      },
      // 开始编辑设备调度备注并聚焦输入框
      startEditRegionRemark(item) {
        this.editingRemarkId = item.id;
        this.editingRemarkValue = item.dispatchRemark || '';
        this.$nextTick(() => {
          const input = this.$refs[`regionRemarkInput${item.id}`];
          const target = Array.isArray(input) ? input[0] : input;
          if (target && target.focus) target.focus();
        });
      },
      // 取消设备调度备注编辑状态
      cancelRegionRemark() {
        this.editingRemarkId = null;
        this.editingRemarkValue = '';
      },
      // 保存设备调度备注修改
      async saveRegionRemark(item) {
        if (this.editingRemarkId !== item.id || this.savingRegionRemark) return;
        const dispatchRemark = (this.editingRemarkValue || '').trim();
        if (dispatchRemark === (item.dispatchRemark || '')) {
          this.cancelRegionRemark();
          return;
        }
        this.savingRegionRemark = true;
        try {
          const res = await device.updateRegionRemark({
            id: item.id,
            dispatchRemark,
          });
          if (res && res.success) {
            this.$message.success('调度备注已更新');
            item.dispatchRemark = dispatchRemark;
            this.cancelRegionRemark();
          } else {
            this.$message.error(res && res.message ? res.message : '更新调度备注失败');
          }
        } catch (error) {
          console.error('更新调度备注失败:', error);
          this.$message.error('更新调度备注失败');
        } finally {
          this.savingRegionRemark = false;
        }
      },
      // 设备台账搜索输入防抖并刷新列表
      handleSearchDebounce() {
        if (this.searchTimer) clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => {
          this.currentPage = 1;
          this.loadDeviceList();
        }, 300);
      },
      // 设备台账状态筛选变化后刷新列表
      handleStatusChange() {
        this.currentPage = 1;
        this.loadDeviceList();
      },
      // 切换设备台账分页页码并刷新列表
      handleCurrentChange(page) {
        this.currentPage = page;
        this.loadDeviceList();
      },
      // 更新设备台账表格的已选设备集合
      handleSelectionChange(selection) {
        this.selectedDevices = selection;
      },
      // 根据设备状态值获取状态名称
      getStatusLabel(status) {
        return STATUS_LABEL[status] || '-';
      },
      // 根据设备状态值获取状态标签样式
      getStatusStyle(status) {
        const s = STATUS_COLOR[status];
        if (!s) return {};
        return { color: s.color, background: s.bg };
      },
      // 根据设备状态值获取状态圆点颜色
      getStatusDot(status) {
        const s = STATUS_COLOR[status];
        return s ? s.dot : '#8C8C8C';
      },
      // 根据设备状态值获取状态说明文案
      getStatusDesc(status) {
        return STATUS_DESC[status] || '';
      },
      // 将日期时间格式化为年月日字符串
      formatDate(value) {
        if (!value) return '-';
        const d = new Date(value);
        if (isNaN(d.getTime())) return value;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      },
      // 将日期时间格式化为月日字符串
      formatShortDate(value) {
        if (!value) return '';
        const d = new Date(value);
        if (isNaN(d.getTime())) return value;
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${m}-${day}`;
      },
      // 将日期对象转换为年月日字符串
      toDateString(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      },
      // 将最后在线时间格式化为相对时间
      formatLastOnline(value) {
        if (!value) return '-';
        const d = new Date(value);
        if (isNaN(d.getTime())) return '-';
        const now = new Date();
        const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
        if (diff < 60) return `${diff} 秒前`;
        if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
        if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} 天前`;
        return this.formatDate(value);
      },
      // 打开设备详情抽屉并加载设备详情数据
      async openDetail(row) {
        this.detailVisible = true;
        this.detailData = row;
        this.recentSchedules = [];
        this.dailyUsages = [];
        try {
          this.detailLoading = true;
          const res = await device.getById(row.id);
          if (res && res.success && res.data) {
            this.detailData = res.data;
            this.recentSchedules = res.data.recentSchedules || [];
            this.dailyUsages = res.data.dailyUsages || [];
          }
        } catch (error) {
          console.error('加载设备详情失败:', error);
          this.$message.error('加载设备详情失败');
        } finally {
          this.detailLoading = false;
        }
      },
      // 切换设备维修或正常状态
      async handleToggleRepair(row, toRepair) {
        const confirmStatus = toRepair ? 3 : 1;
        const actionText = toRepair ? '标记维修' : '标记正常';
        try {
          await this.$confirm(`确定要将设备「${row.deviceName}」${actionText}吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          });
        } catch {
          return;
        }
        try {
          const res = await device.repairStatus(confirmStatus, [row.id]);
          if (res && res.success) {
            this.$message.success(`${actionText}成功`);
            this.detailData = { ...this.detailData, confirmStatus };
            this.loadDeviceList();
          } else {
            this.$message.error(res && res.message ? res.message : `${actionText}失败`);
          }
        } catch (error) {
          console.error(`${actionText}失败:`, error);
          this.$message.error(`${actionText}失败`);
        }
      },
      // 打开设备分布地图弹窗
      openDeviceMap() {
        this.deviceMapVisible = true;
      },
      // 处理地图弹窗中的设备详情查看事件
      handleMapDeviceDetail({ region, device: mapDevice }) {
        this.openMapDeviceDetail(region, mapDevice);
      },
      // 根据地图设备数据打开设备详情抽屉
      openMapDeviceDetail(region, mapDevice) {
        const detail = buildDeviceFromMapItem(region, mapDevice);
        this.deviceMapVisible = false;
        this.detailVisible = true;
        this.detailLoading = false;
        this.detailData = detail;
        this.recentSchedules = [
          { lessonDate: '2026-06-17', courseName: '高等数学（第一节）', teachType: 1, teachTypeName: '主讲' },
          { lessonDate: '2026-06-16', courseName: '大学英语（第二节）', teachType: 2, teachTypeName: '辅讲' },
          { lessonDate: '2026-06-15', courseName: '数据结构与算法（第三节）', teachType: 1, teachTypeName: '主讲' },
        ];
        this.dailyUsages = this.weeklyUsage.map((d, index) => ({ date: d.date, hours: index === 2 ? 0 : 1 }));
      },
      // 确认导出移动保障箱设备 Excel
      handleExportExcel() {
        this.$confirm('确认导出设备Excel?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(() => {
            this.exportExcel();
          })
          .catch(() => {});
      },
      // 导出当前移动保障箱设备数据为 Excel 文件
      async exportExcel() {
        try {
          let ids = [];
          if (this.selectedDevices.length > 0) {
            ids = this.selectedDevices.map(d => d.id);
          } else {
            ids = this.deviceList.map(d => d.id);
          }
          if (ids.length === 0) {
            this.$message.warning('当前没有可导出的设备');
            return;
          }
          const blob = await device.exportDevices(ids);
          if (!blob) {
            this.$message.error('导出失败');
            return;
          }
          const fileBlob = blob instanceof Blob ? blob : new Blob([blob]);
          const url = window.URL.createObjectURL(fileBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `移动保障箱设备_${this.toDateString(new Date())}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.$message.success('导出成功');
        } catch (error) {
          console.error('导出失败:', error);
          this.$message.error('导出失败');
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .msb-page {
    padding: 16px;
    background: #f0f2f5;
    min-height: 100%;
  }

  /* 面包屑 */
  .msb-breadcrumb {
    margin-bottom: 16px;
    font-size: 14px;
    display: flex;
    align-items: center;

    .bc-link {
      color: #1890ff;
      font-weight: 500;
    }
    .bc-current {
      color: #1d2129;
    }
    .bc-sep {
      margin: 0 8px;
      color: #c9cdd4;
    }
  }

  /* 状态卡片 */
  .status-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 16px;
  }

  .status-card {
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 12px;
    padding: 20px;
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    }

    &.highlight {
      border-color: #ff4d4f;
      box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.08);
    }

    .card-body {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }

    .card-info {
      flex: 1;
      min-width: 0;
    }

    .card-label {
      font-size: 14px;
      color: #4e5969;
      margin-bottom: 8px;
    }

    .card-value {
      font-size: 28px;
      font-weight: 700;
      line-height: 1;
      color: #1d2129;

      &.red {
        color: #ff4d4f;
      }
    }

    .card-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
      font-size: 12px;

      &.up {
        color: #52c41a;
      }
      &.down {
        color: #ff4d4f;
      }
      &.flat {
        color: #8c8c8c;
      }
      &.red {
        color: #ff4d4f;
      }
    }

    .card-icon {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;

      &.blue {
        background: #e6f4ff;
        color: #1890ff;
      }
      &.green {
        background: #f6ffed;
        color: #52c41a;
      }
      &.red {
        background: #fff1f0;
        color: #ff4d4f;
      }
      &.orange {
        background: #fff7e6;
        color: #fa8c16;
      }
    }
  }

  /* 主卡片 */
  .main-card {
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 12px;
    overflow: hidden;
  }

  .tab-switch {
    display: inline-flex;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    background: #fafafa;
    padding: 2px;
    margin-bottom: 12px;
  }

  .tab-btn {
    height: 28px;
    padding: 0 12px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #4e5969;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: #1d2129;
    }

    &.active {
      background: #fff;
      color: #1890ff;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    }
  }

  .region-summary {
    color: #86909c;
    font-size: 12px;

    span {
      color: #1d2129;
      font-weight: 500;
    }

    .online {
      color: #52c41a;
    }

    .in-use {
      color: #1890ff;
    }
  }

  .clear-filter-btn {
    color: #4e5969;
    font-size: 12px;
  }

  .card-header {
    padding: 16px;
    border-bottom: 1px solid #e4e7ed;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #1d2129;
      margin-bottom: 12px;
    }

    .card-toolbar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .region-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .region-filter-group {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .search-input {
      width: 240px;
    }
    .status-select {
      width: 144px;
    }
  }

  .table-wrapper {
    padding: 0;
  }

  .region-management {
    background: #fff;
  }

  .region-table-wrapper {
    border-top: 1px solid #f0f0f0;
    overflow-x: auto;
  }

  .region-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;

    thead tr {
      background: #fafafa;
      color: #4e5969;
    }

    th {
      padding: 10px 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
    }

    td {
      padding: 10px 12px;
      border-top: 1px solid #f2f3f5;
      vertical-align: middle;
    }
  }

  .region-row {
    background: #fff;
    transition: background 0.2s;

    &:hover {
      background: #fafafc;
    }

    &.borrowed {
      background: #fff7e6;

      &:hover {
        background: #fff4df;
      }
    }
  }

  .region-empty {
    padding: 32px 0 !important;
    text-align: center;
    color: #86909c;
  }

  .region-device-name-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .region-device-name {
    color: #1d2129;
    font-weight: 500;
  }

  .borrowed-tag {
    display: inline-flex;
    align-items: center;
    height: 18px;
    padding: 0 4px;
    border: 1px solid #ffd591;
    border-radius: 4px;
    background: #fff7e6;
    color: #fa8c16;
    font-size: 10px;
    font-weight: 500;
  }

  .region-sn {
    margin-top: 2px;
    color: #86909c;
    font-family: 'Courier New', monospace;
    font-size: 11px;
  }

  .current-school-btn {
    display: inline-flex;
    align-items: center;
    max-width: 280px;
    gap: 4px;
    padding: 0;
    border: none;
    background: transparent;
    color: #1d2129;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s;

    i {
      color: #1890ff;
      font-size: 13px;
    }

    &:hover {
      color: #1890ff;
    }
  }

  .region-cascader {
    width: 240px;
  }

  .previous-school {
    color: #86909c;
  }

  .region-remark-input {
    width: 260px;
  }

  .region-remark-btn {
    max-width: 280px;
    padding: 0;
    border: none;
    background: transparent;
    color: #4e5969;
    font-size: 13px;
    text-align: left;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.2s;

    &:hover {
      color: #1890ff;
    }
  }

  .remark-placeholder {
    color: #c9cdd4;
  }

  .device-name {
    color: #1d2129;
    font-weight: 500;
  }
  .dept-text {
    color: #4e5969;
    font-size: 13px;
  }
  .sip-code {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: #4e5969;
  }
  .last-online {
    color: #4e5969;
    font-size: 13px;
  }

  /* 状态标签 */
  .status-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  /* 分页 */
  .pagination-wrapper {
    padding: 12px 16px;
    border-top: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .pagination-info {
    font-size: 13px;
    color: #86909c;
  }

  /* 详情抽屉 */
  .detail-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #fff;
  }

  .detail-header {
    padding: 16px 24px;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .detail-title {
      font-size: 18px;
      font-weight: 600;
      color: #1d2129;
    }
    .detail-subtitle {
      font-size: 12px;
      color: #86909c;
      margin-top: 2px;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #86909c;

      &:hover {
        background: #f5f7fa;
      }
    }
  }

  .detail-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
  }

  .detail-section {
    margin-bottom: 20px;
  }

  .section-title {
    font-size: 14px;
    font-weight: 500;
    color: #1d2129;
    margin-bottom: 12px;
  }

  .info-grid {
    display: grid;
    gap: 12px;

    &.two {
      grid-template-columns: repeat(2, 1fr);
    }
    &.three {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .info-cell {
    background: #fafafc;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    padding: 8px 12px;

    .info-label {
      font-size: 12px;
      color: #86909c;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 14px;
      color: #1d2129;
      word-break: break-all;

      &.red {
        color: #ff4d4f;
        font-weight: 500;
      }
    }
  }

  .org-text {
    font-size: 14px;
    color: #4e5969;
  }

  .status-row {
    display: flex;
    align-items: center;
    gap: 12px;

    .status-desc {
      font-size: 12px;
      color: #86909c;
    }
  }

  .detail-divider {
    border: none;
    border-top: 1px solid #e4e7ed;
    margin: 20px 0;
  }

  /* 使用记录 */
  .usage-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .section-title {
      margin: 0;
    }
    .usage-summary {
      font-size: 12px;
      color: #86909c;

      .used-days {
        color: #52c41a;
        font-weight: 500;
      }
    }
  }

  .usage-chart {
    background: #fafafc;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    padding: 16px;

    .chart-bars {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
    }

    .chart-bar-col {
      display: flex;
      justify-content: center;
    }

    .chart-bar-wrap {
      width: 100%;
      height: 80px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .chart-bar {
      width: 100%;
      max-width: 28px;
      background: #e4e7ed;
      border-radius: 4px 4px 0 0;
      transition: all 0.3s;

      &.used {
        background: linear-gradient(to top, #1890ff, #69c0ff);
      }
    }

    .chart-labels {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
      margin-top: 8px;
    }

    .chart-label-col {
      text-align: center;
    }

    .chart-status {
      font-size: 10px;
      font-weight: 500;
      color: #c9cdd4;

      &.used {
        color: #1890ff;
      }
    }

    .chart-date {
      font-size: 10px;
      color: #86909c;
      margin-top: 2px;
    }
  }

  /* 最近排课表 */
  .recent-table-wrap {
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    overflow: hidden;
  }
  .recent-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;

    thead {
      background: #fafafa;
      color: #4e5969;

      th {
        padding: 8px 12px;
        text-align: left;
        font-weight: 500;
        font-size: 12px;
      }
    }

    tbody {
      tr {
        border-top: 1px solid #f0f0f0;
      }
      td {
        padding: 8px 12px;
      }
      .td-date {
        color: #4e5969;
      }
      .td-name {
        color: #1d2129;
      }
      .empty-cell {
        text-align: center;
        color: #c0c4cc;
        padding: 24px 0;
      }
    }
  }

  .role-tag {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 12px;

    &.main {
      background: #e6f4ff;
      color: #1890ff;
    }
    &.assist {
      background: #f6ffed;
      color: #52c41a;
    }
  }

  /* 底部按钮 */
  .detail-footer {
    padding: 12px 24px;
    border-top: 1px solid #e4e7ed;
    background: #fafafa;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }

  .mark-btn {
    height: 36px;
    padding: 0 16px;
    font-size: 14px;

    &.normal {
      border-color: #52c41a;
      color: #52c41a;
      background: #fff;

      &:hover {
        background: #f6ffed;
      }
    }
    &.repair {
      border-color: #fa8c16;
      color: #fa8c16;
      background: #fff;

      &:hover {
        background: #fff7e6;
      }
    }
  }
  .card-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;

    .card-title {
      margin-bottom: 0;
    }
  }

  .map-entry-btn {
    height: 30px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid #1890ff;
    background: #e6f4ff;
    color: #1890ff;
    border-radius: 6px;
    padding: 0 12px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: #fff;
      background: #1890ff;
    }
  }
</style>

<style lang="scss">
  .msb-detail-drawer {
    .el-drawer__body {
      padding: 0 !important;
      overflow: hidden;
    }
  }
</style>
