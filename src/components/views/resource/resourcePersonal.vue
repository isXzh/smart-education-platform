<template>
  <div class="p-6 common-container">
    <!-- 面包屑 -->
    <div class="mb-6">
      <div class="text-sm text-gray-500">
        <span class="text-blue-600 cursor-pointer" @click="$router.push('/resource')">资源库管理</span>
        <span class="mx-2">/</span>
        <span class="text-gray-700">个人资源管理</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <i class="el-icon-date text-[#1677FF] text-xl"></i>
              <h2 class="text-lg font-semibold text-gray-900">个人资源管理</h2>
            </div>
            <el-tag type="primary" class="!bg-blue-50 !text-blue-700 !border-blue-200">
              总计 {{ data.length }}
            </el-tag>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="flex items-center gap-2">
          <div class="relative flex-1 max-w-md">
            <i class="el-icon-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索资源名称、用户昵称..."
              class="!pl-10"
              size="small"
            />
          </div>
          <el-button
            :type="showFilters ? 'primary' : 'default'"
            size="small"
            class="!h-9"
            :class="showFilters ? '!bg-[#1677FF] !border-[#1677FF]' : ''"
            @click="showFilters = !showFilters"
          >
            <i class="el-icon-s-operation mr-1"></i>
            高级筛选
          </el-button>
          <el-button size="small" class="!h-9" @click="resetFilters">重置</el-button>
        </div>

        <!-- Filter Panel -->
        <div v-if="showFilters" class="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div class="grid grid-cols-5 gap-4">
            <div>
              <label class="text-xs font-medium text-gray-700 mb-1.5 block">所属学校</label>
              <el-select v-model="filterSchool" placeholder="全部学校" size="small" class="w-full">
                <el-option label="全部学校" value="" />
                <el-option label="北京市第一中学" value="北京市第一中学" />
                <el-option label="北京市第二中学" value="北京市第二中学" />
                <el-option label="北京市第三中学" value="北京市第三中学" />
                <el-option label="北京市第四中学" value="北京市第四中学" />
              </el-select>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-700 mb-1.5 block">年级</label>
              <el-select v-model="filterGrade" placeholder="全部年级" size="small" class="w-full">
                <el-option label="全部年级" value="" />
                <el-option label="初一" value="初一" />
                <el-option label="初二" value="初二" />
                <el-option label="初三" value="初三" />
                <el-option label="高一" value="高一" />
                <el-option label="高二" value="高二" />
                <el-option label="高三" value="高三" />
              </el-select>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-700 mb-1.5 block">学科</label>
              <el-select v-model="filterSubject" placeholder="全部学科" size="small" class="w-full">
                <el-option label="全部学科" value="" />
                <el-option label="数学" value="数学" />
                <el-option label="语文" value="语文" />
                <el-option label="英语" value="英语" />
                <el-option label="物理" value="物理" />
                <el-option label="化学" value="化学" />
                <el-option label="生物" value="生物" />
                <el-option label="历史" value="历史" />
                <el-option label="地理" value="地理" />
              </el-select>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-700 mb-1.5 block">资源类型</label>
              <el-select v-model="filterType" placeholder="全部类型" size="small" class="w-full">
                <el-option label="全部类型" value="" />
                <el-option label="课件" value="课件" />
                <el-option label="教案" value="教案" />
                <el-option label="试题" value="试题" />
                <el-option label="视频" value="视频" />
                <el-option label="学案" value="学案" />
                <el-option label="图片" value="图片" />
              </el-select>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-700 mb-1.5 block">审核状态</label>
              <el-select v-model="filterStatus" placeholder="全部状态" size="small" class="w-full">
                <el-option label="全部状态" value="" />
                <el-option label="待审核" value="pending" />
                <el-option label="已通过" value="approved" />
                <el-option label="已驳回" value="rejected" />
              </el-select>
            </div>
          </div>
        </div>
      </div>

      <!-- Batch Actions -->
      <div v-if="selectedRows.size > 0" class="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
        <span class="text-sm text-blue-600">已选择 {{ selectedRows.size }} 项</span>
        <template v-if="selectedPendingCount > 0">
          <el-button
            type="success"
            size="mini"
            plain
            class="!h-8"
            @click="openBatchAudit('approve')"
          >
            <i class="el-icon-circle-check mr-1"></i>
            批量通过({{ selectedPendingCount }})
          </el-button>
          <el-button
            type="danger"
            size="mini"
            plain
            class="!h-8"
            @click="openBatchAudit('reject')"
          >
            <i class="el-icon-circle-close mr-1"></i>
            批量驳回({{ selectedPendingCount }})
          </el-button>
        </template>
      </div>

      <!-- Table -->
      <div class="px-6 py-4">
        <el-table
          :data="filteredData"
          class="personal-resource-table"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            width="55"
            align="center"
          />
          <el-table-column label="资源信息" min-width="200">
            <template #default="{ row }">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                  <i v-if="row.type === '视频'" class="el-icon-video-play text-lg"></i>
                  <i v-else-if="row.type === '图片'" class="el-icon-picture-outline text-lg"></i>
                  <i v-else class="el-icon-document text-lg"></i>
                </div>
                <div class="min-w-0">
                  <div class="font-medium text-gray-900 truncate" :title="row.name">{{ row.name }}</div>
                  <div class="flex items-center gap-2 mt-1.5">
                    <span class="text-xs text-gray-400">{{ row.size }}</span>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="上传用户" width="112" align="center">
            <template #default="{ row }">
              <span class="text-sm text-gray-700">{{ row.nickname }}</span>
            </template>
          </el-table-column>
          <el-table-column label="所属学校" width="128" align="center">
            <template #default="{ row }">
              <span class="text-sm text-gray-700">{{ row.school }}</span>
            </template>
          </el-table-column>
          <el-table-column label="年级/学科" width="96" align="center">
            <template #default="{ row }">
              <span class="text-sm text-gray-600">{{ row.grade }}/{{ row.subject }}</span>
            </template>
          </el-table-column>
          <el-table-column label="资源类型" width="96" align="center">
            <template #default="{ row }">
              <el-tag size="mini" class="!border-blue-200 !text-blue-600 !bg-blue-50">{{ row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="上传时间" width="128" align="center">
            <template #default="{ row }">
              <span class="text-sm text-gray-500">{{ row.uploadTime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="浏览/下载" width="112" align="center">
            <template #default="{ row }">
              <span class="text-sm">
                <span class="text-blue-600">{{ row.views }}</span>
                <span class="text-gray-300 mx-1">/</span>
                <span class="text-green-600">{{ row.downloads }}</span>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="审核状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="statusMap[row.status].type" size="mini">
                {{ statusMap[row.status].label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" align="center">
            <template #default="{ row }">
              <div class="flex items-center justify-center gap-1">
                <el-button type="text" size="small" class="!text-blue-600 !h-8 !px-2" @click="openDetail(row)">
                  <i class="el-icon-view mr-1"></i>查看
                </el-button>
                <template v-if="row.status === 'pending'">
                  <el-button type="text" size="small" class="!text-green-600 !h-8 !px-2" @click="handleAudit(row, 'approve')">
                    <i class="el-icon-circle-check mr-1"></i>通过
                  </el-button>
                  <el-button type="text" size="small" class="!text-red-600 !h-8 !px-2" @click="handleAudit(row, 'reject')">
                    <i class="el-icon-circle-close mr-1"></i>驳回
                  </el-button>
                </template>
                <el-button
                  v-if="row.status === 'rejected' && row.rejectReason"
                  type="text"
                  size="small"
                  class="!text-amber-600 !h-8 !px-2"
                  @click="openRejectReason(row)"
                >
                  <i class="el-icon-chat-line-square mr-1"></i>驳回原因
                </el-button>
              </div>
            </template>
          </el-table-column>
          <template #empty>
            <div class="flex flex-col items-center justify-center py-16 text-gray-400">
              <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <i class="el-icon-document text-4xl text-gray-300"></i>
              </div>
              <p class="text-gray-500 font-medium">暂无资源数据</p>
              <p class="text-sm text-gray-400 mt-1">请尝试调整筛选条件</p>
            </div>
          </template>
        </el-table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end items-center gap-4">
        <span class="text-sm text-gray-500">共 {{ filteredData.length }} 条</span>
        <el-pagination
          :current-page="currentPage"
          :page-sizes="[10, 20, 50]"
          :page-size="pageSize"
          layout="prev, pager, next, sizes"
          :total="filteredData.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- Detail Dialog -->
    <DetailDialog
      v-model="showDetailModal"
      :detail-data="detailData"
      @close="detailData = null"
    />

    <!-- Audit Dialog -->
    <AuditDialog
      v-model="showAuditModal"
      :audit-data="auditData"
      :audit-type="auditType"
      @confirm="confirmAudit"
      @close="auditData = null"
    />

    <!-- Reject Reason Dialog -->
    <RejectReasonDialog
      v-model="showRejectReasonModal"
      :reject-data="rejectData"
      @close="rejectData = null"
    />

    <!-- Batch Audit Dialog -->
    <BatchAuditDialog
      v-model="showBatchAuditModal"
      :batch-type="batchType"
      :selected-count="selectedPendingCount"
      @confirm="confirmBatchAudit"
    />
  </div>
</template>

<script>
import DetailDialog from './resourcePersonalDialog/DetailDialog.vue';
import AuditDialog from './resourcePersonalDialog/AuditDialog.vue';
import RejectReasonDialog from './resourcePersonalDialog/RejectReasonDialog.vue';
import BatchAuditDialog from './resourcePersonalDialog/BatchAuditDialog.vue';

const statusMap = {
  pending: { label: '待审核', type: 'warning' },
  approved: { label: '已通过', type: 'success' },
  rejected: { label: '已驳回', type: 'danger' },
};

const mockData = [
  { id: '1', nickname: '张老师', school: '北京市第一中学', grade: '高一', subject: '数学', name: '函数与导数专题课件', type: '课件', uploadTime: '2026-05-10 14:30', size: '15.2 MB', views: 328, downloads: 156, status: 'approved' },
  { id: '2', nickname: '李老师', school: '北京市第二中学', grade: '初二', subject: '英语', name: '英语语法精讲教案', type: '教案', uploadTime: '2026-05-09 09:15', size: '8.5 MB', views: 215, downloads: 89, status: 'pending' },
  { id: '3', nickname: '王老师', school: '北京市第三中学', grade: '高三', subject: '物理', name: '力学综合训练题', type: '试题', uploadTime: '2026-05-08 16:45', size: '5.3 MB', views: 567, downloads: 234, status: 'rejected', rejectReason: '资源内容与本学科不符，请重新上传符合物理学科要求的试题资源。' },
  { id: '4', nickname: '赵老师', school: '北京市第一中学', grade: '初三', subject: '化学', name: '化学实验视频教程', type: '视频', uploadTime: '2026-05-07 11:20', size: '128 MB', views: 892, downloads: 445, status: 'approved' },
  { id: '5', nickname: '刘老师', school: '北京市第四中学', grade: '高二', subject: '语文', name: '古诗词鉴赏导学案', type: '学案', uploadTime: '2026-05-06 08:30', size: '3.2 MB', views: 178, downloads: 67, status: 'pending' },
  { id: '6', nickname: '陈老师', school: '北京市第二中学', grade: '初一', subject: '生物', name: '细胞结构3D模型', type: '课件', uploadTime: '2026-05-05 15:00', size: '45.6 MB', views: 445, downloads: 198, status: 'approved' },
  { id: '7', nickname: '杨老师', school: '北京市第三中学', grade: '高一', subject: '地理', name: '世界气候类型分布图', type: '图片', uploadTime: '2026-05-04 10:10', size: '12.8 MB', views: 334, downloads: 145, status: 'rejected', rejectReason: '图片清晰度不足，影响教学展示效果，请上传高清版本。' },
  { id: '8', nickname: '周老师', school: '北京市第一中学', grade: '初二', subject: '历史', name: '中国近代史时间轴', type: '课件', uploadTime: '2026-05-03 13:25', size: '9.1 MB', views: 289, downloads: 112, status: 'pending' },
];

export default {
  name: 'ResourcePersonal',
  components: {
    DetailDialog,
    AuditDialog,
    RejectReasonDialog,
    BatchAuditDialog,
  },
  data() {
    return {
      data: [...mockData],
      selectedRows: new Set(),
      searchKeyword: '',
      showFilters: false,
      filterSchool: '',
      filterGrade: '',
      filterSubject: '',
      filterType: '',
      filterStatus: '',
      currentPage: 1,
      pageSize: 10,
      statusMap,
      showDetailModal: false,
      detailData: null,
      showAuditModal: false,
      auditData: null,
      auditType: 'approve',
      showRejectReasonModal: false,
      rejectData: null,
      showBatchAuditModal: false,
      batchType: 'approve',
    };
  },
  computed: {
    filteredData() {
      let result = this.data;

      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        result = result.filter(
          (item) =>
            item.name.toLowerCase().includes(keyword) ||
            item.nickname.toLowerCase().includes(keyword)
        );
      }

      if (this.filterSchool) {
        result = result.filter((item) => item.school === this.filterSchool);
      }
      if (this.filterGrade) {
        result = result.filter((item) => item.grade === this.filterGrade);
      }
      if (this.filterSubject) {
        result = result.filter((item) => item.subject === this.filterSubject);
      }
      if (this.filterType) {
        result = result.filter((item) => item.type === this.filterType);
      }
      if (this.filterStatus) {
        result = result.filter((item) => item.status === this.filterStatus);
      }

      return result;
    },
    selectedPendingCount() {
      return this.data.filter((d) => this.selectedRows.has(d.id) && d.status === 'pending').length;
    },
  },
  watch: {
    filteredData() {
      this.currentPage = 1;
    },
  },
  methods: {
    handleSelectionChange(selection) {
      this.selectedRows = new Set(selection.map((item) => item.id));
    },
    resetFilters() {
      this.searchKeyword = '';
      this.filterSchool = '';
      this.filterGrade = '';
      this.filterSubject = '';
      this.filterType = '';
      this.filterStatus = '';
      this.showFilters = false;
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    openDetail(item) {
      this.detailData = item;
      this.showDetailModal = true;
    },
    handleAudit(item, type) {
      this.auditData = item;
      this.auditType = type;
      this.showAuditModal = true;
    },
    confirmAudit({ type, reason }) {
      if (!this.auditData) return;
      const newStatus = type === 'approve' ? 'approved' : 'rejected';
      this.data = this.data.map((d) =>
        d.id === this.auditData.id
          ? { ...d, status: newStatus, rejectReason: type === 'reject' ? reason : d.rejectReason }
          : d
      );
      if (this.detailData && this.detailData.id === this.auditData.id) {
        this.detailData = { ...this.detailData, status: newStatus, rejectReason: type === 'reject' ? reason : this.detailData.rejectReason };
      }
      this.auditData = null;
    },
    openRejectReason(item) {
      this.rejectData = item;
      this.showRejectReasonModal = true;
    },
    openBatchAudit(type) {
      this.batchType = type;
      this.showBatchAuditModal = true;
    },
    confirmBatchAudit({ type, reason }) {
      const newStatus = type === 'approve' ? 'approved' : 'rejected';
      this.data = this.data.map((d) =>
        this.selectedRows.has(d.id) && d.status === 'pending'
          ? { ...d, status: newStatus, rejectReason: type === 'reject' ? reason : d.rejectReason }
          : d
      );
      this.selectedRows = new Set();
    },
  },
};
</script>

<style lang="scss" scoped>
.common-container {
  background: #f5f7fa;
  min-height: 100%;
}

::v-deep .personal-resource-table {
  .el-table__header-wrapper {
    .el-table__header {
      th {
        background: #FAFAFC;
        color: #4b5563;
        font-weight: 500;
        font-size: 14px;
        padding: 12px 0;
        border-bottom: none;
      }
    }
  }

  .el-table__body-wrapper {
    .el-table__body {
      td {
        padding: 16px 0;
        border-bottom: 1px solid #f3f4f6;
      }
      tr {
        background: #ffffff;
        transition: all 0.2s;

        &:hover {
          td {
            background: #ffffff !important;
          }
        }
      }
      tr.el-table__row {
        border-radius: 12px;
        overflow: hidden;
      }
    }
  }

  .el-checkbox__inner {
    border-radius: 4px;
  }

  .el-table__indent,
  .el-table__placeholder {
    display: none !important;
  }

  .el-table-column--selection .cell {
    padding-left: 10px !important;
    padding-right: 10px !important;
    text-overflow: clip !important;
  }
}
</style>
