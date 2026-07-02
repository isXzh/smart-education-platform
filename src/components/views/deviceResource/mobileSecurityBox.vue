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
        <div class="card-toolbar">
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
      </div>

      <!-- 表格 -->
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

      <!-- 分页 -->
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
    data() {
      return {
        loading: false,
        searchKeyword: '',
        statusFilter: null,
        currentPage: 1,
        pageSize: 10,
        total: 0,
        deviceList: [],
        selectedDevices: [],
        searchTimer: null,
        detailVisible: false,
        detailLoading: false,
        detailData: null,
        recentSchedules: [],
        dailyUsages: [],
        deviceMapVisible: false,
      };
    },
    computed: {
      counts() {
        const allDevices = this.deviceList;
        const total = this.total;
        const online = allDevices.filter(d => d.confirmStatus === 1 || d.confirmStatus === 2).length;
        const inUse = allDevices.filter(d => d.confirmStatus === 2).length;
        const expired = allDevices.filter(d => d.confirmStatus === 4).length;
        return { total, online, inUse, expired };
      },
      onlineRate() {
        if (!this.counts.total) return '0.0';
        return ((this.counts.online / this.counts.total) * 100).toFixed(1);
      },
      inUseRate() {
        if (!this.counts.total) return '0.0';
        return ((this.counts.inUse / this.counts.total) * 100).toFixed(1);
      },
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
      usedDays() {
        return this.weeklyUsage.filter(d => d.hours > 0).length;
      },
    },
    mounted() {
      this.loadDeviceList();
    },
    beforeDestroy() {
      if (this.searchTimer) clearTimeout(this.searchTimer);
    },
    methods: {
      headerCellStyle() {
        return {
          background: '#FAFAFA',
          color: '#4E5969',
          fontWeight: '500',
          fontSize: '12px',
        };
      },
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
      handleSearchDebounce() {
        if (this.searchTimer) clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => {
          this.currentPage = 1;
          this.loadDeviceList();
        }, 300);
      },
      handleStatusChange() {
        this.currentPage = 1;
        this.loadDeviceList();
      },
      handleCurrentChange(page) {
        this.currentPage = page;
        this.loadDeviceList();
      },
      handleSelectionChange(selection) {
        this.selectedDevices = selection;
      },
      getStatusLabel(status) {
        return STATUS_LABEL[status] || '-';
      },
      getStatusStyle(status) {
        const s = STATUS_COLOR[status];
        if (!s) return {};
        return { color: s.color, background: s.bg };
      },
      getStatusDot(status) {
        const s = STATUS_COLOR[status];
        return s ? s.dot : '#8C8C8C';
      },
      getStatusDesc(status) {
        return STATUS_DESC[status] || '';
      },
      formatDate(value) {
        if (!value) return '-';
        const d = new Date(value);
        if (isNaN(d.getTime())) return value;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      },
      formatShortDate(value) {
        if (!value) return '';
        const d = new Date(value);
        if (isNaN(d.getTime())) return value;
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${m}-${day}`;
      },
      toDateString(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      },
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
      openDeviceMap() {
        this.deviceMapVisible = true;
      },
      handleMapDeviceDetail({ region, device: mapDevice }) {
        this.openMapDeviceDetail(region, mapDevice);
      },
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
