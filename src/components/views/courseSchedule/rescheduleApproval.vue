<template>
  <div class="reschedule-approval">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <span class="breadcrumb-link">课程排课</span>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-current">调课审批</span>
    </div>

    <!-- 白色卡片容器 -->
    <div class="card-container">
      <!-- 顶部操作栏 -->
      <div class="top-section">
        <div class="title-bar">
          <div class="title-left">
            <i class="el-icon-date title-icon"></i>
            <h2 class="title-text">调课审批</h2>
            <span class="title-count">共 {{ total }} 条待审批</span>
          </div>
        </div>

        <!-- 筛选栏 -->
        <div class="filter-bar">
          <div class="filter-item">
            <label class="filter-label">申请开始日期</label>
            <el-date-picker
              v-model="queryForm.applyStartDate"
              type="date"
              placeholder="开始日期"
              value-format="yyyy-MM-dd"
              class="filter-date"
            ></el-date-picker>
          </div>
          <div class="filter-item">
            <label class="filter-label">申请结束日期</label>
            <el-date-picker
              v-model="queryForm.applyEndDate"
              type="date"
              placeholder="结束日期"
              value-format="yyyy-MM-dd"
              class="filter-date"
            ></el-date-picker>
          </div>
          <div class="filter-item">
            <label class="filter-label">教师姓名</label>
            <div class="search-input-wrapper">
              <i class="el-icon-search search-icon"></i>
              <input
                v-model="queryForm.applyTeacherName"
                type="text"
                placeholder="请输入教师姓名"
                class="search-input"
                @keyup.enter="handleQuery"
              />
            </div>
          </div>
          <div class="filter-actions">
            <el-button class="btn-primary" @click="handleQuery">
              <i class="el-icon-search"></i>
              查询
            </el-button>
            <el-button class="btn-outline" @click="handleReset">
              <i class="el-icon-refresh-left"></i>
              重置
            </el-button>
          </div>
        </div>
      </div>

      <!-- 列表 -->
      <div v-loading="loading">
        <div v-if="!loading && tableData.length === 0" class="empty-state">暂无待审批的调课申请</div>
        <div v-else class="table-wrapper">
          <table class="approval-table">
            <thead>
              <tr>
                <th>申请人</th>
                <th>原课程</th>
                <th>期望调整</th>
                <th>申请时间</th>
                <th>原因</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(app, idx) in tableData" :key="app.adjustmentId" :class="{ 'border-row': idx !== 0 }">
                <td class="cell-top">
                  <div class="cell-primary">{{ app.applyTeacherName }}</div>
                  <div class="cell-sub">{{ app.applyTeacherPhone || '-' }}</div>
                </td>
                <td class="cell-top">
                  <div class="cell-primary">{{ app.courseName }}</div>
                  <div class="cell-sub">{{ app.originalDate }} · {{ app.originalPeriodInfo }}</div>
                </td>
                <td class="cell-top">
                  <div class="cell-primary nowrap">{{ app.adjustDate }} · {{ app.adjustPeriodInfo }}</div>
                  <div class="cell-sub nowrap">
                    {{ app.adjustLocation || '-' }} · {{ app.adjustTeacherName || '-' }}
                  </div>
                </td>
                <td class="cell-top cell-time">{{ `${app.applyTime.split('T').join(' ')}` }}</td>
                <td class="cell-top cell-reason">
                  <div class="line-clamp-2" :title="app.adjustReason">{{ app.adjustReason || '—' }}</div>
                </td>
                <td class="cell-top">
                  <div class="action-btns">
                    <button class="btn-detail" @click="handleViewDetail(app)">
                      <i class="el-icon-view"></i>
                      查看详情
                    </button>
                    <button class="btn-approve" @click="handleApproveClick(app)">
                      <i class="el-icon-check"></i>
                      通过
                    </button>
                    <button class="btn-reject" @click="handleRejectClick(app)">
                      <i class="el-icon-close"></i>
                      驳回
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div v-if="total > 0" class="pagination-container">
          <el-pagination
            background
            :current-page="queryForm.pageNum"
            :page-size="queryForm.pageSize"
            :page-sizes="[10, 20, 50]"
            layout="total, prev, pager, next, jumper"
            :total="total"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
    </div>

    <!-- 详情抽屉 -->
    <div v-if="detailVisible" class="drawer-overlay">
      <div class="drawer-mask" @click="closeDetail"></div>
      <div class="drawer-panel">
        <div class="drawer-header">
          <div>
            <h3 class="drawer-title">调课申请详情</h3>
            <div class="drawer-subtitle">申请单号：{{ detailApp.applicationNo }}</div>
          </div>
          <button class="drawer-close" @click="closeDetail">
            <i class="el-icon-close"></i>
          </button>
        </div>

        <div class="drawer-content">
          <!-- 申请人 -->
          <div class="detail-block">
            <div class="detail-label">申请人</div>
            <div class="detail-value">
              {{ detailApp.applyTeacherName }}
              <span class="detail-sub">{{ detailApp.applyTeacherPhone || '-' }}</span>
            </div>
          </div>

          <!-- 原课程详情 -->
          <section class="detail-section">
            <div class="section-title">
              <i class="el-icon-notebook-2 section-icon"></i>
              <span>原课程详情</span>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">课程名称</div>
                <div class="info-value">{{ detailApp.courseName }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">教师</div>
                <div class="info-value">
                  <i class="el-icon-user info-i"></i>
                  <span>{{ detailApp.applyTeacherName }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">日期</div>
                <div class="info-value">
                  <i class="el-icon-date info-i"></i>
                  <span>{{ detailApp.originalDate }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">节次</div>
                <div class="info-value">
                  <i class="el-icon-time info-i"></i>
                  <span>{{ detailApp.originalPeriodInfo }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">地点</div>
                <div class="info-value">
                  <i class="el-icon-location-outline info-i"></i>
                  <span>{{ detailApp.originalLocation || '-' }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- 期望调整详情 -->
          <section class="detail-section">
            <div class="section-title">
              <span>期望调整详情</span>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">日期</div>
                <div class="info-value">
                  <i class="el-icon-date info-i"></i>
                  <span>{{ detailApp.adjustDate }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">节次</div>
                <div class="info-value">
                  <i class="el-icon-time info-i"></i>
                  <span>{{ detailApp.adjustPeriodInfo }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">地点</div>
                <div class="info-value">
                  <i class="el-icon-location-outline info-i"></i>
                  <span>{{ detailApp.adjustLocation || '-' }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">主讲教师</div>
                <div class="info-value">
                  <i class="el-icon-user info-i"></i>
                  <span>{{ detailApp.adjustTeacherName || '-' }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- 调课原因 -->
          <section class="detail-section">
            <div class="section-title">
              <span>调课原因</span>
            </div>
            <div class="reason-box">
              {{ detailApp.adjustReason || '（申请人未填写）' }}
            </div>
          </section>
        </div>

        <div class="drawer-footer">
          <button class="btn-reject-large" @click="handleRejectClick(detailApp)">
            <i class="el-icon-close"></i>
            驳回
          </button>
          <button class="btn-approve-large" @click="handleApproveClick(detailApp)">
            <i class="el-icon-check"></i>
            通过
          </button>
        </div>
      </div>
    </div>

    <!-- 通过二次确认 -->
    <div v-if="confirmVisible" class="modal-overlay">
      <div class="modal-mask" @click="closeConfirm"></div>
      <div class="modal-card confirm-card">
        <div class="modal-row">
          <div class="modal-icon-wrap success-icon-wrap">
            <i class="el-icon-check"></i>
          </div>
          <div class="modal-body">
            <h3 class="modal-title">确认调课吗？</h3>
            <p class="modal-desc">调课后原排课将更新为期望内容。该操作不可撤销，请确认。</p>
            <div class="modal-info">
              <div>
                申请人：<span class="modal-info-value">{{ confirmApp.applyTeacherName }}</span>
              </div>
              <div>
                原课程：<span class="modal-info-value"
                  >{{ confirmApp.courseName }} · {{ confirmApp.originalDate }} {{ confirmApp.originalPeriodInfo }}</span
                >
              </div>
              <div>
                调整后：<span class="modal-info-value"
                  >{{ confirmApp.adjustDate }} {{ confirmApp.adjustPeriodInfo }} ·
                  {{ confirmApp.adjustLocation || '-' }} · {{ confirmApp.adjustTeacherName || '-' }}</span
                >
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <el-button class="btn-outline" @click="closeConfirm">取消</el-button>
          <el-button class="btn-success" :loading="approving" @click="confirmApprove">确认通过</el-button>
        </div>
      </div>
    </div>

    <!-- 驳回弹窗 -->
    <div v-if="rejectVisible" class="modal-overlay">
      <div class="modal-mask" @click="closeReject"></div>
      <div class="modal-card reject-card">
        <div class="modal-row">
          <div class="modal-icon-wrap danger-icon-wrap">
            <i class="el-icon-close"></i>
          </div>
          <div class="modal-body">
            <h3 class="modal-title">驳回调课申请</h3>
            <p class="modal-sub">申请人：{{ rejectApp.applyTeacherName }} · 课程：{{ rejectApp.courseName }}</p>
          </div>
        </div>
        <div class="reject-form">
          <label class="reject-label"> 驳回理由 <span class="required-star">*</span> </label>
          <el-input
            v-model="rejectReason"
            type="textarea"
            :rows="4"
            maxlength="200"
            show-word-limit
            placeholder="请填写驳回理由（将通知教师端）"
          ></el-input>
        </div>
        <div class="modal-footer">
          <el-button class="btn-outline" @click="closeReject">取消</el-button>
          <el-button class="btn-danger" :loading="rejecting" @click="confirmReject">确认驳回</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import approval from '@/api/approval.js';

  export default {
    name: 'RescheduleApproval',
    data() {
      return {
        loading: false,
        total: 0,
        queryForm: {
          applyTeacherName: '',
          applyStartDate: '',
          applyEndDate: '',
          pageNum: 1,
          pageSize: 10,
        },
        tableData: [],
        // 详情抽屉
        detailVisible: false,
        detailApp: {},
        // 通过确认
        confirmVisible: false,
        confirmApp: {},
        approving: false,
        // 驳回弹窗
        rejectVisible: false,
        rejectApp: {},
        rejectReason: '',
        rejecting: false,
      };
    },
    mounted() {
      this.loadData();
    },
    methods: {
      async loadData() {
        try {
          this.loading = true;
          const params = {
            applyTeacherName: this.queryForm.applyTeacherName || undefined,
            applyStartDate: this.queryForm.applyStartDate || undefined,
            applyEndDate: this.queryForm.applyEndDate || undefined,
            pageNum: this.queryForm.pageNum,
            pageSize: this.queryForm.pageSize,
          };
          const res = await approval.page(params);
          if (res && res.code === 200 && res.data) {
            this.tableData = res.data.list || [];
            this.total = res.data.total || 0;
          } else {
            this.tableData = [];
            this.total = 0;
          }
        } catch (error) {
          console.error('加载调课审批数据失败:', error);
          this.$message.error('加载调课审批数据失败');
          this.tableData = [];
          this.total = 0;
        } finally {
          this.loading = false;
        }
      },
      handleQuery() {
        this.queryForm.pageNum = 1;
        this.loadData();
      },
      handleReset() {
        this.queryForm = {
          applyTeacherName: '',
          applyStartDate: '',
          applyEndDate: '',
          pageNum: 1,
          pageSize: 10,
        };
        this.loadData();
      },
      handleCurrentChange(page) {
        this.queryForm.pageNum = page;
        this.loadData();
      },
      handleSizeChange(size) {
        this.queryForm.pageSize = size;
        this.queryForm.pageNum = 1;
        this.loadData();
      },
      // 详情
      handleViewDetail(app) {
        this.detailApp = { ...app };
        this.detailVisible = true;
      },
      closeDetail() {
        this.detailVisible = false;
        this.detailApp = {};
      },
      // 通过
      handleApproveClick(app) {
        this.confirmApp = { ...app };
        this.confirmVisible = true;
      },
      closeConfirm() {
        this.confirmVisible = false;
        this.confirmApp = {};
      },
      async confirmApprove() {
        if (!this.confirmApp.adjustmentId) {
          this.$message.error('调课申请ID缺失');
          return;
        }
        try {
          this.approving = true;
          const res = await approval.approve({
            adjustmentId: this.confirmApp.adjustmentId,
            approvalRemark: '',
          });
          if (res && res.code === 200) {
            this.$message.success(`已通过：${this.confirmApp.applyTeacherName} 的调课申请`);
            this.confirmVisible = false;
            this.detailVisible = false;
            this.confirmApp = {};
            this.loadData();
          } else {
            this.$message.error((res && res.message) || '审批失败');
          }
        } catch (error) {
          console.error('审批通过失败:', error);
          this.$message.error('审批失败');
        } finally {
          this.approving = false;
        }
      },
      // 驳回
      handleRejectClick(app) {
        this.rejectApp = { ...app };
        this.rejectReason = '';
        this.rejectVisible = true;
      },
      closeReject() {
        this.rejectVisible = false;
        this.rejectApp = {};
        this.rejectReason = '';
      },
      async confirmReject() {
        if (!this.rejectReason.trim()) {
          this.$message.warning('请填写驳回理由');
          return;
        }
        if (!this.rejectApp.adjustmentId) {
          this.$message.error('调课申请ID缺失');
          return;
        }
        try {
          this.rejecting = true;
          const res = await approval.reject({
            adjustmentId: this.rejectApp.adjustmentId,
            approvalRemark: this.rejectReason,
          });
          if (res && res.code === 200) {
            this.$message.success(`已驳回：${this.rejectApp.applyTeacherName} 的调课申请`);
            this.rejectVisible = false;
            this.detailVisible = false;
            this.rejectApp = {};
            this.rejectReason = '';
            this.loadData();
          } else {
            this.$message.error((res && res.message) || '驳回失败');
          }
        } catch (error) {
          console.error('驳回失败:', error);
          this.$message.error('驳回失败');
        } finally {
          this.rejecting = false;
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .reschedule-approval {
    padding: 16px;
    background: #f5f7fa;
    min-height: calc(100vh - 84px);
  }

  // 面包屑
  .breadcrumb {
    margin-bottom: 16px;
    font-size: 14px;
    color: #4e5969;
    display: flex;
    align-items: center;

    .breadcrumb-link {
      color: #3177ff;
      font-weight: 500;
    }

    .breadcrumb-separator {
      margin: 0 8px;
      color: #c9cdd4;
    }

    .breadcrumb-current {
      color: #1d2129;
    }
  }

  // 卡片容器
  .card-container {
    background: #fff;
    border: 1px solid #e5e6eb;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    overflow: hidden;
  }

  // 顶部标题区
  .top-section {
    padding: 24px;
    border-bottom: 1px solid #e5e6eb;
  }

  .title-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .title-left {
    display: flex;
    align-items: center;
    gap: 8px;

    .title-icon {
      font-size: 20px;
      color: #3177ff;
    }

    .title-text {
      font-size: 16px;
      font-weight: 600;
      color: #1d2129;
      margin: 0;
    }

    .title-count {
      margin-left: 8px;
      font-size: 12px;
      color: #86909c;
    }
  }

  // 筛选栏
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 16px;

    .filter-item {
      display: flex;
      flex-direction: column;
    }

    .filter-label {
      font-size: 12px;
      color: #4e5969;
      margin-bottom: 6px;
    }

    .filter-date {
      width: 180px;
      ::v-deep .el-input__inner {
        height: 36px;
        line-height: 36px;
        border-color: #e5e6eb;
        border-radius: 6px;
        font-size: 13px;
      }
    }

    .search-input-wrapper {
      position: relative;
      width: 224px;

      .search-icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: #c9cdd4;
        font-size: 14px;
      }

      .search-input {
        width: 100%;
        height: 36px;
        padding: 0 12px 0 32px;
        border: 1px solid #e5e6eb;
        border-radius: 6px;
        font-size: 13px;
        outline: none;
        background: #fff;
        transition: all 0.2s;

        &:focus {
          border-color: #3177ff;
          box-shadow: 0 0 0 3px rgba(49, 119, 255, 0.12);
        }

        &::placeholder {
          color: #c9cdd4;
        }
      }
    }

    .filter-actions {
      display: flex;
      gap: 8px;
      margin-left: auto;
    }
  }

  // 按钮统一样式
  .btn-primary {
    height: 36px;
    padding: 0 16px;
    background: #3177ff;
    border-color: #3177ff;
    color: #fff;
    border-radius: 6px;
    font-size: 13px;

    i {
      margin-right: 4px;
    }

    &:hover,
    &:focus {
      background: #2864d8;
      border-color: #2864d8;
      color: #fff;
    }
  }

  .btn-outline {
    height: 36px;
    padding: 0 16px;
    background: #fff;
    border: 1px solid #e5e6eb;
    color: #4e5969;
    border-radius: 6px;
    font-size: 13px;

    i {
      margin-right: 4px;
    }

    &:hover,
    &:focus {
      color: #3177ff;
      border-color: #3177ff;
      background: #fff;
    }
  }

  .btn-success {
    height: 36px;
    padding: 0 16px;
    background: #00b42a;
    border-color: #00b42a;
    color: #fff;
    border-radius: 6px;
    font-size: 13px;

    &:hover,
    &:focus {
      background: #00a025;
      border-color: #00a025;
      color: #fff;
    }
  }

  .btn-danger {
    height: 36px;
    padding: 0 16px;
    background: #f53f3f;
    border-color: #f53f3f;
    color: #fff;
    border-radius: 6px;
    font-size: 13px;

    &:hover,
    &:focus {
      background: #d93434;
      border-color: #d93434;
      color: #fff;
    }
  }

  // 空态
  .empty-state {
    padding: 64px 0;
    text-align: center;
    font-size: 13px;
    color: #86909c;
  }

  // 表格
  .table-wrapper {
    overflow-x: auto;
  }

  .approval-table {
    width: 100%;
    font-size: 13px;
    border-collapse: collapse;

    thead tr {
      background: #fafafc;
    }

    th {
      padding: 12px 16px;
      text-align: left;
      font-weight: 500;
      color: #4e5969;
      white-space: nowrap;

      &:nth-child(5) {
        white-space: normal;
      }
    }

    tbody tr.border-row {
      border-top: 1px solid #f2f3f5;
    }

    td {
      padding: 12px 16px;
    }

    .cell-top {
      vertical-align: top;
    }

    .cell-primary {
      color: #1d2129;
      font-weight: 500;
    }

    .cell-sub {
      font-size: 14px;
      color: #86909c;
      margin-top: 2px;
    }

    .nowrap {
      white-space: nowrap;
    }

    .cell-time {
      white-space: nowrap;
      color: #4e5969;
    }

    .cell-reason {
      color: #4e5969;
      max-width: 260px;

      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.5;
      }
    }
  }

  // 行内操作按钮
  .action-btns {
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  }

  .btn-detail,
  .btn-approve,
  .btn-reject {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 28px;
    padding: 0 10px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    border: 1px solid;
    transition: all 0.2s;

    i {
      font-size: 12px;
    }
  }

  .btn-detail {
    color: #3177ff;
    border-color: #3177ff;
    background: #fff;

    &:hover {
      background: #e8f1ff;
    }
  }

  .btn-approve {
    color: #fff;
    border-color: #00b42a;
    background: #00b42a;

    &:hover {
      background: #00a025;
      border-color: #00a025;
    }
  }

  .btn-reject {
    color: #f53f3f;
    border-color: #f53f3f;
    background: #fff;

    &:hover {
      background: #ffece8;
    }
  }

  // 分页
  .pagination-container {
    display: flex;
    justify-content: flex-end;
    padding: 16px 24px;
    border-top: 1px solid #f2f3f5;
  }

  // 抽屉
  .drawer-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
  }

  .drawer-mask {
    flex: 1;
    background: rgba(0, 0, 0, 0.3);
  }

  .drawer-panel {
    width: 600px;
    max-width: 100%;
    background: #fff;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-shadow: -8px 0 24px rgba(0, 0, 0, 0.12);
    animation: drawerSlideIn 0.25s ease-out;
  }

  @keyframes drawerSlideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }

  .drawer-header {
    padding: 16px 24px;
    border-bottom: 1px solid #f2f3f5;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .drawer-title {
      font-size: 15px;
      font-weight: 600;
      color: #1d2129;
      margin: 0;
    }

    .drawer-subtitle {
      font-size: 12px;
      color: #86909c;
      margin-top: 2px;
    }

    .drawer-close {
      padding: 4px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 4px;
      color: #86909c;
      font-size: 18px;

      &:hover {
        background: #f2f3f5;
      }
    }
  }

  .drawer-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
  }

  .detail-block {
    margin-bottom: 24px;
  }

  .detail-label {
    font-size: 12px;
    color: #86909c;
    margin-bottom: 4px;
  }

  .detail-value {
    font-size: 13px;
    color: #1d2129;

    .detail-sub {
      color: #86909c;
      margin-left: 8px;
    }
  }

  .detail-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    color: #1d2129;
    margin-bottom: 12px;

    .section-icon {
      font-size: 14px;
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .info-item {
    .info-label {
      font-size: 12px;
      color: #86909c;
      margin-bottom: 4px;
    }

    .info-value {
      font-size: 13px;
      color: #1d2129;
      display: flex;
      align-items: center;
      gap: 6px;

      .info-i {
        color: #86909c;
        font-size: 13px;
      }
    }
  }

  .reason-box {
    font-size: 13px;
    color: #4e5969;
    line-height: 1.6;
    padding: 12px;
    background: #fafafc;
    border: 1px solid #f2f3f5;
    border-radius: 6px;
    min-height: 60px;
  }

  .drawer-footer {
    padding: 16px 24px;
    border-top: 1px solid #f2f3f5;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
  }

  .btn-reject-large,
  .btn-approve-large {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 36px;
    padding: 0 16px;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    border: 1px solid;
    transition: all 0.2s;
  }

  .btn-reject-large {
    color: #f53f3f;
    border-color: #f53f3f;
    background: #fff;

    &:hover {
      background: #ffece8;
    }
  }

  .btn-approve-large {
    color: #fff;
    border-color: #00b42a;
    background: #00b42a;

    &:hover {
      background: #00a025;
      border-color: #00a025;
    }
  }

  // 弹窗
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 55;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-mask {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
  }

  .modal-card {
    position: relative;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
    padding: 24px;
    max-width: 90vw;

    &.confirm-card {
      width: 420px;
    }

    &.reject-card {
      width: 400px;
    }
  }

  .modal-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .modal-icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 18px;

    &.success-icon-wrap {
      background: #e8ffea;
      color: #00b42a;
    }

    &.danger-icon-wrap {
      background: #ffece8;
      color: #f53f3f;
    }
  }

  .modal-body {
    flex: 1;
    padding-top: 2px;
  }

  .modal-title {
    font-size: 15px;
    font-weight: 600;
    color: #1d2129;
    margin: 0;
  }

  .modal-desc {
    margin-top: 8px;
    font-size: 13px;
    color: #4e5969;
    line-height: 1.6;
  }

  .modal-sub {
    margin-top: 4px;
    font-size: 12px;
    color: #86909c;
  }

  .modal-info {
    margin-top: 12px;
    padding: 12px;
    background: #fafafc;
    border: 1px solid #f2f3f5;
    border-radius: 6px;
    font-size: 12px;
    color: #4e5969;

    > div {
      margin-bottom: 4px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .modal-info-value {
      color: #1d2129;
    }
  }

  .modal-footer {
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }

  // 驳回表单
  .reject-form {
    margin-top: 16px;

    .reject-label {
      display: block;
      font-size: 13px;
      color: #1d2129;
      margin-bottom: 6px;

      .required-star {
        color: #f53f3f;
      }
    }

    ::v-deep .el-textarea__inner {
      border-color: #e5e6eb;
      border-radius: 6px;

      &:focus {
        border-color: #f53f3f;
        box-shadow: 0 0 0 3px rgba(245, 63, 63, 0.12);
      }
    }
  }
</style>
