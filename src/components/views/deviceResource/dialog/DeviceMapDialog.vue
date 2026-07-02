<template>
  <el-dialog
    :visible.sync="innerVisible"
    :append-to-body="true"
    :close-on-click-modal="true"
    :show-close="false"
    :modal="true"
    custom-class="device-map-dialog"
    width="min(1400px, 96vw)"
    top="4vh"
    @closed="handleClosed"
    @opened="handleOpened"
  >
    <div class="device-map-panel">
      <div class="device-map-header">
        <div class="device-map-title-wrap">
          <button v-if="currentRegion" class="map-back-btn" @click="handleBack">
            <i class="el-icon-arrow-left"></i>
            返回全国
          </button>
          <span class="device-map-title">{{ currentRegion ? currentRegion + ' · 设备分布图' : '设备分布图' }}</span>
          <span class="device-map-count">共 {{ currentRegion ? currentRegionTotal : overviewStats.total }} 条数据</span>
        </div>
        <button class="device-map-close" @click="handleClose">
          <i class="el-icon-close"></i>
        </button>
      </div>

      <div class="device-map-overview">
        <template v-if="currentRegion">
          <div class="overview-name">{{ currentRegion }}</div>
          <div class="overview-divider"></div>
          <div class="overview-text">
            {{ currentRegionTotal }} 台设备 · 在线 {{ currentRegionStats.online }} · 离线 {{ currentRegionStats.offline }} · 异常 {{ currentRegionStats.abnormal }} · 在线率 {{ currentRegionStats.onlineRate }}%
          </div>
        </template>
        <template v-else>
          <span>总设备数 <strong>{{ overviewStats.total }}</strong></span>
          <span class="overview-divider"></span>
          <span>在线 <strong class="green">{{ overviewStats.online }}</strong></span>
          <span class="overview-divider"></span>
          <span>离线 <strong class="gray">{{ overviewStats.offline }}</strong></span>
          <span class="overview-divider"></span>
          <span>异常 <strong class="orange">{{ overviewStats.abnormal }}</strong></span>
          <span class="overview-divider"></span>
          <span>在线率 <strong class="blue">{{ overviewStats.onlineRate }}%</strong></span>
        </template>
      </div>

      <div class="device-map-toolbar">
        <span class="view-label">视图模式</span>
        <div class="view-switch">
          <button :class="{ active: viewMode === 'region' }" @click="setViewMode('region')">区域填充</button>
          <button :class="{ active: viewMode === 'scatter' }" @click="setViewMode('scatter')">散点图</button>
        </div>
        <span class="toolbar-tip">支持拖拽、滚轮缩放；双击有数据省份可放大下钻</span>
      </div>

      <div class="device-map-body">
        <div class="device-map-main">
          <div ref="chartRef" class="device-map-canvas"></div>
          <div v-if="mapLoading" class="map-loading">地图加载中...</div>
        </div>

        <div v-if="selectedMapItem" class="map-detail-panel">
          <template v-if="selectedMapItem.level === 'school'">
            <div class="panel-section">
              <div class="panel-title">{{ selectedMapItem.detail.name }}</div>
              <div class="panel-subtitle">{{ selectedMapItem.value }} 台设备 · 在线率 {{ selectedSchoolStats.onlineRate }}%</div>
            </div>
            <div class="panel-stats">
              <div v-for="key in statusKeys" :key="key" class="panel-stat" :style="getStatusBgStyle(key)">
                <div class="panel-stat-value" :style="{ color: getStatusMeta(key).color }">{{ selectedSchoolStats[key] }}</div>
                <div class="panel-stat-label" :style="{ color: getStatusMeta(key).color }">{{ getStatusMeta(key).label }}</div>
              </div>
            </div>
            <div class="panel-section">
              <div class="panel-small-title">设备明细</div>
              <div class="device-chip-box">
                <button
                  v-for="d in selectedMapItem.detail.devices"
                  :key="d.id"
                  class="device-map-chip"
                  :style="getStatusChipStyle(d.status)"
                  @click="handleDeviceClick(selectedMapItem.region, d)"
                >
                  {{ d.name }}
                </button>
              </div>
            </div>
            <div class="panel-actions">
              <el-button
                v-if="selectedMapItem.detail.devices.length"
                type="primary"
                size="small"
                @click="handleDeviceClick(selectedMapItem.region, selectedMapItem.detail.devices[0])"
              >查看设备详情</el-button>
              <el-button size="small" @click="handleClose">返回台账</el-button>
            </div>
          </template>
          <template v-else>
            <div class="panel-section">
              <div class="panel-title">{{ selectedMapItem.detail.province }}</div>
              <div class="panel-subtitle">
                {{ selectedMapItem.detail.schools.length }} 所学校 · {{ selectedMapItem.value }} 台设备 · 在线率 {{ selectedRegionStats.onlineRate }}%
              </div>
            </div>
            <div class="panel-stats">
              <div v-for="key in statusKeys" :key="key" class="panel-stat" :style="getStatusBgStyle(key)">
                <div class="panel-stat-value" :style="{ color: getStatusMeta(key).color }">{{ selectedRegionStats[key] }}</div>
                <div class="panel-stat-label" :style="{ color: getStatusMeta(key).color }">{{ getStatusMeta(key).label }}</div>
              </div>
            </div>
            <div class="panel-section school-list-section">
              <div class="panel-small-title">学校明细</div>
              <div v-for="school in selectedMapItem.detail.schools" :key="school.name" class="school-device-card">
                <div class="school-card-name">{{ school.name }}</div>
                <div class="school-card-chips">
                  <span
                    v-for="d in school.devices"
                    :key="d.id"
                    class="device-map-chip static"
                    :style="getStatusChipStyle(d.status)"
                  >{{ d.name }}</span>
                </div>
              </div>
            </div>
            <div class="panel-actions">
              <el-button
                v-if="selectedRegionFirstDevice"
                type="primary"
                size="small"
                @click="handleDeviceClick(selectedMapItem.detail.province, selectedRegionFirstDevice)"
              >查看设备详情</el-button>
              <el-button size="small" @click="handleClose">返回台账</el-button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
  import 'echarts/lib/chart/map';
  import 'echarts/lib/chart/effectScatter';
  import 'echarts/lib/chart/scatter';
  import 'echarts/lib/component/geo';
  import 'echarts/lib/component/tooltip';
  import 'echarts/lib/component/visualMap';
  import echarts from 'echarts/lib/echarts';
  import {
    DEVICE_MAP_DATA,
    DEVICE_STATUS_META,
    DEVICE_STATUS_KEYS,
    getDeviceMapSchools,
    getDeviceOverviewStats,
    getDeviceRegionStats,
    countDeviceMapStats,
  } from '../data/deviceMapData';
  import { ensureChinaMap, computeRegionZoom, getRegionCenter } from '../data/chinaMap';

  export default {
    name: 'DeviceMapDialog',
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        innerVisible: false,
        mapLoading: false,
        viewMode: 'region',
        currentRegion: null,
        selectedMapItem: null,
        statusKeys: DEVICE_STATUS_KEYS,
        chartInstance: null,
        resizeHandler: null,
      };
    },
    computed: {
      overviewStats() {
        return getDeviceOverviewStats();
      },
      deviceMapData() {
        return DEVICE_MAP_DATA;
      },
      currentRegionSchools() {
        return this.currentRegion ? getDeviceMapSchools(this.currentRegion) : [];
      },
      currentRegionTotal() {
        const item = this.deviceMapData.find(d => d.name === this.currentRegion);
        return item ? item.value : 0;
      },
      currentRegionStats() {
        return this.currentRegion
          ? getDeviceRegionStats(this.currentRegion)
          : { total: 0, online: 0, offline: 0, abnormal: 0, onlineRate: '0.0' };
      },
      selectedRegionStats() {
        if (!this.selectedMapItem || this.selectedMapItem.level === 'school') {
          return { total: 0, online: 0, offline: 0, abnormal: 0, onlineRate: '0.0' };
        }
        return countDeviceMapStats(this.selectedMapItem.detail.schools.reduce((list, school) => list.concat(school.devices), []));
      },
      selectedSchoolStats() {
        if (!this.selectedMapItem || this.selectedMapItem.level !== 'school') {
          return { total: 0, online: 0, offline: 0, abnormal: 0, onlineRate: '0.0' };
        }
        return countDeviceMapStats(this.selectedMapItem.detail.devices);
      },
      selectedRegionFirstDevice() {
        if (!this.selectedMapItem || this.selectedMapItem.level === 'school') return null;
        const school = this.selectedMapItem.detail.schools[0];
        return school && school.devices.length ? school.devices[0] : null;
      },
    },
    watch: {
      visible: {
        immediate: true,
        handler(val) {
          this.innerVisible = val;
        },
      },
      innerVisible(val) {
        if (val !== this.visible) {
          this.$emit('update:visible', val);
        }
      },
    },
    beforeDestroy() {
      this.disposeChart();
    },
    methods: {
      async handleOpened() {
        this.mapLoading = true;
        this.currentRegion = null;
        this.selectedMapItem = null;
        this.viewMode = 'region';
        try {
          await ensureChinaMap();
          this.$nextTick(() => {
            this.initChart();
            this.renderChart();
          });
        } catch (err) {
          console.error('地图数据加载失败:', err);
          this.$message && this.$message.error('地图数据加载失败');
        } finally {
          this.mapLoading = false;
        }
      },
      handleClose() {
        this.innerVisible = false;
      },
      handleClosed() {
        this.disposeChart();
        this.currentRegion = null;
        this.selectedMapItem = null;
        this.viewMode = 'region';
        this.$emit('update:visible', false);
      },
      handleBack() {
        this.currentRegion = null;
        this.selectedMapItem = null;
        this.renderChart();
      },
      setViewMode(mode) {
        if (this.viewMode === mode) return;
        this.viewMode = mode;
        this.selectedMapItem = null;
        this.renderChart();
      },
      initChart() {
        const el = this.$refs.chartRef;
        if (!el) return;
        if (this.chartInstance) {
          this.chartInstance.dispose();
        }
        this.chartInstance = echarts.init(el);
        this.chartInstance.on('click', this.onChartClick);
        this.chartInstance.on('dblclick', this.onChartDblClick);
        this.resizeHandler = () => {
          if (this.chartInstance) this.chartInstance.resize();
        };
        window.addEventListener('resize', this.resizeHandler);
      },
      disposeChart() {
        if (this.resizeHandler) {
          window.removeEventListener('resize', this.resizeHandler);
          this.resizeHandler = null;
        }
        if (this.chartInstance) {
          this.chartInstance.dispose();
          this.chartInstance = null;
        }
      },
      renderChart() {
        if (!this.chartInstance) return;
        const option = this.buildOption();
        this.chartInstance.setOption(option, true);
      },
      onChartClick(params) {
        if (!params) return;
        if (this.currentRegion) {
          if (params.seriesType === 'effectScatter' || params.seriesType === 'scatter') {
            const school = params.data && params.data.__school;
            if (school) this.selectedMapItem = school;
          }
          return;
        }
        if (params.seriesType === 'effectScatter' || params.seriesType === 'scatter') {
          const region = params.data && params.data.__region;
          if (region) {
            this.selectedMapItem = { ...region, level: 'region' };
          }
          return;
        }
        if (params.componentType === 'geo' || params.seriesType === 'map') {
          const region = this.deviceMapData.find(d => d.name === params.name);
          if (region) {
            this.selectedMapItem = { ...region, level: 'region' };
          }
        }
      },
      onChartDblClick(params) {
        if (!params) return;
        if (this.currentRegion) return;
        let regionName = null;
        if (params.componentType === 'geo' || params.seriesType === 'map') {
          regionName = params.name;
        } else if (params.data && params.data.__region) {
          regionName = params.data.__region.name;
        }
        if (!regionName) return;
        const region = this.deviceMapData.find(d => d.name === regionName);
        if (!region || !region.value) return;
        this.currentRegion = regionName;
        this.selectedMapItem = null;
        this.renderChart();
      },
      handleDeviceClick(region, mapDevice) {
        this.$emit('device-detail', { region, device: mapDevice });
        this.innerVisible = false;
      },
      getStatusMeta(key) {
        return DEVICE_STATUS_META[key] || DEVICE_STATUS_META.offline;
      },
      getStatusBgStyle(key) {
        return { background: this.getStatusMeta(key).bg };
      },
      getStatusChipStyle(key) {
        const meta = this.getStatusMeta(key);
        return { color: meta.color, background: `${meta.color}14` };
      },
      buildTooltip() {
        return {
          trigger: 'item',
          backgroundColor: 'rgba(255,255,255,0.96)',
          borderColor: '#E5E7EB',
          borderWidth: 1,
          padding: [10, 14],
          textStyle: { color: '#1D2129', fontSize: 12 },
          formatter: params => {
            const data = params.data || {};
            if (data.__school) {
              const stats = countDeviceMapStats(data.__school.detail.devices);
              return (
                `<div style="font-weight:600;margin-bottom:2px">${data.__school.detail.name}</div>` +
                `<div style="font-size:12px">设备数：${data.__school.value}</div>` +
                `<div style="font-size:12px;color:#4E5969">在线 ${stats.online} / 离线 ${stats.offline} / 异常 ${stats.abnormal}</div>`
              );
            }
            if (data.__region) {
              const stats = countDeviceMapStats(data.__region.detail.schools.reduce((l, s) => l.concat(s.devices), []));
              return (
                `<div style="font-weight:600;margin-bottom:2px">${data.__region.name}</div>` +
                `<div style="font-size:12px">总设备数：${data.__region.value}</div>` +
                `<div style="font-size:12px;color:#4E5969">在线 ${stats.online} / 离线 ${stats.offline} / 异常 ${stats.abnormal} · 在线率 ${stats.onlineRate}%</div>`
              );
            }
            const region = this.deviceMapData.find(d => d.name === params.name);
            if (region) {
              const stats = countDeviceMapStats(region.detail.schools.reduce((l, s) => l.concat(s.devices), []));
              return (
                `<div style="font-weight:600;margin-bottom:2px">${region.name}</div>` +
                `<div style="font-size:12px">总设备数：${region.value}</div>` +
                `<div style="font-size:12px;color:#4E5969">在线 ${stats.online} / 离线 ${stats.offline} / 异常 ${stats.abnormal}</div>`
              );
            }
            return params.name || '';
          },
        };
      },
      buildOption() {
        const isDrilldown = !!this.currentRegion;
        const maxValue = Math.max(1, ...this.deviceMapData.map(d => d.value));

        if (isDrilldown) {
          const info = computeRegionZoom(this.currentRegion);
          const geoBase = {
            map: 'china',
            roam: true,
            zoom: info.zoom || 4,
            center: info.center || undefined,
            scaleLimit: { min: 1, max: 12 },
            label: { show: false },
            itemStyle: {
              areaColor: 'rgba(230,247,255,0.35)',
              borderColor: '#E6F4FF',
              borderWidth: 0.5,
            },
            emphasis: { disabled: true },
            regions: [
              {
                name: this.currentRegion,
                itemStyle: {
                  areaColor: '#69C0FF',
                  borderColor: '#1890FF',
                  borderWidth: 2,
                  shadowColor: 'rgba(24,144,255,0.5)',
                  shadowBlur: 20,
                  shadowOffsetY: 8,
                },
                label: { show: true, color: '#fff', fontWeight: 'bold', fontSize: 14 },
                emphasis: {
                  itemStyle: { areaColor: '#40A9FF' },
                  label: { show: true, color: '#fff' },
                },
              },
            ],
          };
          const schoolSeries = {
            type: 'effectScatter',
            coordinateSystem: 'geo',
            symbolSize: val => Math.max(8, Math.min(20, Math.sqrt((val && val[2]) || 0) * 4)),
            rippleEffect: { brushType: 'stroke', scale: 2.5 },
            itemStyle: {
              color: '#1890FF',
              shadowBlur: 8,
              shadowColor: 'rgba(24,144,255,0.5)',
            },
            emphasis: { scale: 1.4, itemStyle: { color: '#3165D2' } },
            label: { show: false },
            data: this.currentRegionSchools.map(school => ({
              name: school.name,
              value: [school.lng, school.lat, school.value],
              __school: school,
            })),
            zlevel: 2,
          };
          return {
            backgroundColor: 'transparent',
            tooltip: this.buildTooltip(),
            geo: geoBase,
            series: [schoolSeries],
          };
        }

        if (this.viewMode === 'scatter') {
          const geoBase = {
            map: 'china',
            roam: true,
            zoom: 1.2,
            scaleLimit: { min: 1, max: 10 },
            label: { show: false },
            itemStyle: {
              areaColor: '#E6F7FF',
              borderColor: '#ffffff',
              borderWidth: 1,
              shadowColor: 'rgba(24,144,255,0.2)',
              shadowBlur: 10,
              shadowOffsetY: 5,
            },
            emphasis: {
              label: { show: false },
              itemStyle: { areaColor: '#BAE7FF' },
            },
          };
          const scatterSeries = {
            type: 'effectScatter',
            coordinateSystem: 'geo',
            symbolSize: val => Math.max(8, Math.min(20, Math.sqrt((val && val[2]) || 0) * 4)),
            rippleEffect: { brushType: 'stroke', scale: 2.5 },
            itemStyle: {
              color: '#1890FF',
              shadowBlur: 8,
              shadowColor: 'rgba(24,144,255,0.5)',
            },
            emphasis: { scale: 1.4, itemStyle: { color: '#3165D2' } },
            label: { show: false },
            data: this.deviceMapData
              .map(item => {
                const center = getRegionCenter(item.name);
                if (!center) return null;
                return {
                  name: item.name,
                  value: [center[0], center[1], item.value],
                  __region: item,
                };
              })
              .filter(Boolean),
            zlevel: 2,
          };
          return {
            backgroundColor: 'transparent',
            tooltip: this.buildTooltip(),
            geo: geoBase,
            series: [scatterSeries],
          };
        }

        const mapSeries = {
          type: 'map',
          map: 'china',
          roam: true,
          zoom: 1.2,
          scaleLimit: { min: 1, max: 10 },
          selectedMode: false,
          label: { show: false },
          itemStyle: {
            areaColor: '#E6F7FF',
            borderColor: '#ffffff',
            borderWidth: 1,
          },
          emphasis: {
            label: { show: true, color: '#fff', fontWeight: 'bold' },
            itemStyle: { areaColor: '#69C0FF', borderColor: '#1890FF' },
          },
          data: this.deviceMapData.map(item => ({ name: item.name, value: item.value })),
        };
        const visualMap = {
          min: 0,
          max: maxValue,
          left: 16,
          bottom: 24,
          text: ['高', '低'],
          calculable: true,
          inRange: { color: ['#E6F7FF', '#69C0FF', '#1890FF', '#0958D9'] },
          textStyle: { color: '#4E5969' },
        };
        return {
          backgroundColor: 'transparent',
          tooltip: this.buildTooltip(),
          visualMap,
          series: [mapSeries],
        };
      },
    },
  };
</script>

<style lang="scss">
  .device-map-dialog {
    border-radius: 12px !important;
    overflow: hidden;

    .el-dialog__header {
      display: none;
    }

    .el-dialog__body {
      padding: 0;
    }
  }
</style>

<style lang="scss" scoped>
  .device-map-panel {
    display: flex;
    flex-direction: column;
    height: 88vh;
    background: #fff;
  }

  .device-map-header {
    height: 57px;
    padding: 12px 20px;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }

  .device-map-title-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .map-back-btn {
    height: 28px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    background: #fafafa;
    color: #4e5969;
    padding: 0 8px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;

    &:hover {
      color: #1890ff;
      border-color: #1890ff;
    }
  }

  .device-map-title {
    font-size: 16px;
    font-weight: 600;
    color: #1d2129;
  }

  .device-map-count {
    color: #86909c;
    font-size: 12px;
  }

  .device-map-close {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: 6px;
    color: #86909c;
    cursor: pointer;

    &:hover {
      background: #f5f7fa;
    }
  }

  .device-map-overview {
    min-height: 41px;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 20px;
    background: #fafafc;
    border-bottom: 1px solid #f0f0f0;
    color: #4e5969;
    font-size: 12px;
    flex-shrink: 0;

    strong {
      color: #1d2129;
      font-weight: 600;

      &.green { color: #52c41a; }
      &.gray { color: #8c8c8c; }
      &.orange { color: #fa8c16; }
      &.blue { color: #1890ff; }
    }
  }

  .overview-name {
    color: #1d2129;
    font-size: 14px;
    font-weight: 600;
  }

  .overview-divider {
    width: 1px;
    height: 16px;
    background: #e4e7ed;
    display: inline-block;
    flex-shrink: 0;
  }

  .device-map-toolbar {
    height: 41px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 20px;
    border-bottom: 1px solid #f0f0f0;
    flex-shrink: 0;
  }

  .toolbar-tip {
    margin-left: auto;
    color: #86909c;
    font-size: 12px;
  }

  .view-label {
    color: #86909c;
    font-size: 12px;
  }

  .view-switch {
    display: inline-flex;
    border: 1px solid #e4e7ed;
    background: #fafafa;
    padding: 2px;
    border-radius: 8px;

    button {
      border: none;
      background: transparent;
      border-radius: 6px;
      padding: 4px 12px;
      color: #4e5969;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &.active {
        background: #fff;
        color: #1890ff;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
      }
    }
  }

  .device-map-body {
    flex: 1;
    min-height: 0;
    display: flex;
    position: relative;
    overflow: hidden;
  }

  .device-map-main {
    flex: 1;
    min-width: 0;
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at 50% 45%, rgba(230, 247, 255, 0.92) 0%, rgba(248, 251, 255, 0.72) 38%, rgba(255, 255, 255, 0.95) 78%),
      linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  }

  .device-map-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .map-loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #86909c;
    font-size: 14px;
    background: rgba(255, 255, 255, 0.6);
    z-index: 4;
  }

  .map-detail-panel {
    width: 320px;
    flex-shrink: 0;
    border-left: 1px solid #e4e7ed;
    background: #fff;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.04);
    padding: 16px;
    overflow-y: auto;
  }

  .panel-section {
    margin-bottom: 16px;
  }

  .panel-title {
    font-size: 14px;
    color: #1d2129;
    font-weight: 600;
  }

  .panel-subtitle {
    margin-top: 4px;
    color: #86909c;
    font-size: 12px;
  }

  .panel-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 16px;
  }

  .panel-stat {
    border-radius: 8px;
    padding: 8px;
    text-align: center;
  }

  .panel-stat-value {
    font-size: 18px;
    line-height: 1.2;
    font-weight: 700;
  }

  .panel-stat-label {
    font-size: 10px;
    margin-top: 2px;
  }

  .panel-small-title {
    font-size: 12px;
    color: #1d2129;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .device-chip-box {
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    background: #fafafa;
    padding: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .device-map-chip {
    border: none;
    border-radius: 4px;
    padding: 2px 6px;
    line-height: 16px;
    font-size: 10px;
    font-weight: 500;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }

    &.static {
      cursor: default;
      display: inline-block;
    }
  }

  .school-list-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .school-device-card {
    border: 1px solid #f0f0f0;
    background: #fafafa;
    border-radius: 8px;
    padding: 12px;
  }

  .school-card-name {
    font-size: 14px;
    color: #1d2129;
    font-weight: 500;
  }

  .school-card-chips {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .panel-actions {
    padding-top: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  @media (max-width: 900px) {
    .device-map-panel {
      height: 92vh;
    }

    .device-map-body {
      flex-direction: column;
    }

    .map-detail-panel {
      width: 100%;
      max-height: 45%;
      border-left: none;
      border-top: 1px solid #e4e7ed;
    }

    .device-map-overview {
      flex-wrap: wrap;
      gap: 8px;
    }
  }
</style>
