<template>
  <el-dialog
    title="设备操作日志"
    :visible.sync="dialogVisible"
    width="900px"
    :close-on-click-modal="false"
    custom-class="device-log-dialog"
    @close="handleClose"
  >
    <template slot="title">
      <div class="log-dialog-header">
        <div>
          <div class="log-dialog-title">
            <i class="el-icon-s-data"></i>
            设备操作日志
          </div>
          <div class="log-dialog-subtitle" v-if="device">{{ device.name }} - {{ device.sn }}</div>
        </div>
      </div>
    </template>

    <div class="log-device-info" v-if="device">
      <div class="info-row">
        <div class="info-item">
          <span class="info-label">设备型号</span>
          <span class="info-value">{{ device.model }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">所属部门</span>
          <span class="info-value">{{ device.department }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">激活时间</span>
          <span class="info-value">{{ device.activationDate }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">到期时间</span>
          <span class="info-value">{{ device.expiryDate }}</span>
        </div>
      </div>
    </div>

    <div class="log-table-container">
      <el-table :data="deviceLogs" style="width: 100%" stripe size="small">
        <el-table-column label="时间" width="170">
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

    <div slot="footer" class="log-dialog-footer">
      <div class="log-summary">共 {{ deviceLogs.length }} 条操作记录</div>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'DeviceLogDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    device: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      deviceLogs: [
        { id: 1, time: '2026-04-03 14:25:30', action: '设备上线', operator: '系统', status: 'success', details: '设备自动连接成功' },
        { id: 2, time: '2026-04-03 09:15:20', action: '课程绑定', operator: '张老师', status: 'success', details: '绑定课程：数学基础课' },
        { id: 3, time: '2026-04-02 16:45:10', action: '设备离线', operator: '系统', status: 'warning', details: '设备断开连接' },
        { id: 4, time: '2026-04-02 08:30:05', action: '设备上线', operator: '系统', status: 'success', details: '设备自动连接成功' },
        { id: 5, time: '2026-04-01 15:20:00', action: '设备维护', operator: '李维', status: 'info', details: '例行检查，更新系统固件' },
        { id: 6, time: '2026-04-01 10:10:30', action: '课程解绑', operator: '王老师', status: 'success', details: '解绑课程：物理实验' },
        { id: 7, time: '2026-03-31 14:00:15', action: '设备异常', operator: '系统', status: 'error', details: '温度过高报警，已自动关机' },
        { id: 8, time: '2026-03-31 08:45:00', action: '设备配置', operator: '管理员', status: 'info', details: '更新设备参数配置' },
      ],
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      },
    },
  },
  methods: {
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
    handleClose() {
      this.dialogVisible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.log-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.log-dialog-title {
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
}

.log-dialog-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
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
  font-family: 'Courier New', monospace;
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
</style>

<style>
.device-log-dialog .el-dialog__header {
  background: linear-gradient(135deg, #4f7cff 0%, #3b6bf5 100%);
  padding: 16px 20px;
  border-top-right-radius: 15px;
  border-top-left-radius: 15px;
}
.device-log-dialog .el-dialog__title {
  color: #fff;
}
.device-log-dialog .el-dialog__headerbtn .el-dialog__close {
  color: #fff;
  font-size: 18px;
}
</style>
