<template>
  <div class="p-6 common-container">
    <div class="mb-6">
      <div class="text-sm text-gray-500">
        <span class="text-blue-600 cursor-pointer" @click="$router.push('/resource')">资源库管理</span>
        <span class="mx-2">/</span>
        <span class="text-gray-700">公共资源管理</span>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <i class="el-icon-date text-[#1677FF] text-xl"></i>
              <h2 class="text-lg font-semibold text-gray-900">公共资源管理</h2>
            </div>
            <el-tag type="primary" class="!bg-blue-50 !text-blue-700 !border-blue-200"> 总计 {{ total }} </el-tag>
          </div>
          <el-button type="primary" class="!bg-[#1677FF] !border-[#1677FF]" @click="openAddDialog">
            <i class="el-icon-plus mr-1"></i>新增资源
          </el-button>
        </div>

        <div class="flex items-center gap-2">
          <div class="relative flex-1 max-w-md">
            <i class="el-icon-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索资源标题..."
              size="small"
              class="!pl-10"
              @keyup.enter.native="handleSearch"
            />
          </div>
          <el-button
            :type="showFilters ? 'primary' : 'default'"
            size="small"
            class="!h-9"
            :class="showFilters ? '!bg-[#1677FF] !border-[#1677FF]' : ''"
            @click="showFilters = !showFilters"
          >
            <i class="el-icon-s-operation mr-1"></i>高级筛选
          </el-button>
          <el-button size="small" class="!h-9" @click="resetFilters">重置</el-button>
        </div>

        <div v-if="showFilters" class="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div class="grid grid-cols-4 gap-4">
            <div>
              <label class="text-xs font-medium text-gray-700 mb-1.5 block">所属学校</label>
              <el-select
                v-model="filterSchoolId"
                placeholder="全部学校"
                size="small"
                class="w-full"
                clearable
                @change="handleSchoolChange"
              >
                <el-option
                  v-for="school in schoolOptions"
                  :key="school.id"
                  :label="school.schoolName"
                  :value="school.id"
                />
              </el-select>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-700 mb-1.5 block">主讲教师</label>
              <el-select
                v-model="filterTeacherId"
                placeholder="全部教师"
                size="small"
                class="w-full"
                clearable
                @change="handleFilterChange"
              >
                <el-option
                  v-for="teacher in filterTeacherOptions"
                  :key="teacher.id"
                  :label="teacher.teacherName"
                  :value="teacher.id"
                />
              </el-select>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-700 mb-1.5 block">学科</label>
              <el-select
                v-model="filterSubjectId"
                placeholder="全部学科"
                size="small"
                class="w-full"
                clearable
                @change="handleFilterChange"
              >
                <el-option
                  v-for="subject in subjectOptions"
                  :key="subject.id"
                  :label="subject.subjectName"
                  :value="subject.id"
                />
              </el-select>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-700 mb-1.5 block">学段</label>
              <el-select
                v-model="filterStageId"
                placeholder="全部学段"
                size="small"
                class="w-full"
                clearable
                @change="handleFilterChange"
              >
                <el-option v-for="stage in stageOptions" :key="stage.id" :label="stage.stageName" :value="stage.id" />
              </el-select>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedRows.length > 0" class="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
        <span class="text-sm text-blue-600">已选择 {{ selectedRows.length }} 项</span>
        <el-button type="danger" size="mini" plain class="!h-8" @click="handleBatchDelete">
          <i class="el-icon-delete mr-1"></i>批量删除
        </el-button>
      </div>

      <div class="px-6 py-4">
        <el-table
          :data="tableData"
          class="common-resource-table"
          @selection-change="handleSelectionChange"
          v-loading="loading"
        >
          <!-- <el-table-column type="selection" width="55" align="center" /> -->
          <el-table-column label="资源信息" min-width="240">
            <template #default="{ row }">
              <div class="flex items-center gap-4">
                <div
                  class="w-20 h-14 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 shrink-0 overflow-hidden"
                >
                  <img v-if="row.coverUrl" :src="row.coverUrlData" class="w-full h-full object-cover" />
                  <i v-else class="el-icon-video-play text-lg"></i>
                </div>
                <div class="min-w-0">
                  <div class="font-medium text-gray-900 truncate" :title="row.title">{{ row.title }}</div>
                  <div class="flex items-center gap-2 mt-1.5">
                    <el-tag size="mini" class="!border-blue-200 !text-blue-600 !bg-blue-50" v-if="row.typeName">{{
                      row.typeName
                    }}</el-tag>
                    <span class="text-xs text-gray-400" v-if="row.fileSize">{{ formatFileSize(row.fileSize) }}</span>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="所属学校" width="128" align="center">
            <template #default="{ row }">
              <span class="text-sm text-gray-700">{{ row.schoolName || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="主讲教师" width="112" align="center">
            <template #default="{ row }">
              <span class="text-sm text-gray-700">{{ row.teacherName || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="学段" width="96" align="center">
            <template #default="{ row }">
              <span class="text-sm text-gray-600">{{ row.stageName || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="学科" width="96" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.subjectName" size="mini" class="!border-green-200 !text-green-600 !bg-green-50">{{
                row.subjectName
              }}</el-tag>
              <span v-else class="text-sm text-gray-400">-</span>
            </template>
          </el-table-column>
          <el-table-column label="上传时间" width="160" align="center">
            <template #default="{ row }">
              <span class="text-sm text-gray-500">{{ formatTime(row.createdAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="浏览/下载" width="112" align="center">
            <template #default="{ row }">
              <span class="text-sm">
                <span class="text-blue-600">{{ row.viewCount || 0 }}</span>
                <span class="text-gray-300 mx-1">/</span>
                <span class="text-green-600">{{ row.downloadCount || 0 }}</span>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.publishStatus === 1 ? 'success' : 'info'" size="mini">
                {{ row.publishStatus === 1 ? '已上架' : '已下架' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template #default="{ row }">
              <div class="flex items-center justify-center gap-1">
                <el-button type="text" size="small" class="!text-blue-600 !h-8 !px-2" @click="handleView(row)">
                  <i class="el-icon-view mr-1"></i>查看
                </el-button>
                <el-button
                  v-if="row.publishStatus === 0"
                  type="text"
                  size="small"
                  class="!text-green-600 !h-8 !px-2"
                  @click="handleTogglePublish(row)"
                >
                  <i class="el-icon-top mr-1"></i>上架
                </el-button>
                <el-button
                  v-else
                  type="text"
                  size="small"
                  class="!text-orange-500 !h-8 !px-2"
                  @click="handleTogglePublish(row)"
                >
                  <i class="el-icon-bottom mr-1"></i>下架
                </el-button>
                <el-dropdown
                  trigger="click"
                  @command="cmd => handleCommand(cmd, row)"
                  :disabled="row.publishStatus === 1"
                >
                  <el-button type="text" size="small" class="!text-gray-500 !h-8 !px-2">
                    <i class="el-icon-more mr-1"></i>更多
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="edit"> <i class="el-icon-edit mr-1"></i>编辑 </el-dropdown-item>
                    <el-dropdown-item command="delete" class="!text-red-500">
                      <i class="el-icon-delete mr-1"></i>删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
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

      <div class="px-6 py-4 border-t border-gray-200 flex justify-end items-center gap-4">
        <span class="text-sm text-gray-500">共 {{ total }} 条</span>
        <el-pagination
          :current-page="currentPage"
          :page-sizes="[10, 20, 50]"
          :page-size="pageSize"
          layout="prev, pager, next, sizes"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <ResourceFormDialog
      v-model="showFormDialog"
      :is-edit="isEditMode"
      :edit-data="editData"
      @confirm="handleFormConfirm"
      @close="handleFormClose"
    />

    <DeleteConfirmDialog
      v-model="showDeleteDialog"
      :delete-data="deleteData"
      :batch-mode="isBatchDelete"
      :selected-count="selectedRows.length"
      @confirm="handleDeleteConfirm"
      @close="deleteData = null"
    />
  </div>
</template>

<script>
  import publicResourceApi from '@/api/publicResource.js';
  import schoolApi from '@/api/school.js';
  import teacherApi from '@/api/teacher.js';
  import subjectApi from '@/api/subject.js';
  import gradeLevelApi from '@/api/gradeLevel.js';
  import ResourceFormDialog from './resourceCommonDialog/ResourceFormDialog.vue';
  import DeleteConfirmDialog from './resourceCommonDialog/DeleteConfirmDialog.vue';

  export default {
    name: 'ResourceCommon',
    components: {
      ResourceFormDialog,
      DeleteConfirmDialog,
    },
    data() {
      return {
        loading: false,
        tableData: [],
        total: 0,
        currentPage: 1,
        pageSize: 10,
        searchKeyword: '',
        showFilters: false,
        filterSchoolId: '',
        filterTeacherId: '',
        filterSubjectId: '',
        filterStageId: '',
        schoolOptions: [],
        allTeacherOptions: [],
        filterTeacherOptions: [],
        subjectOptions: [],
        stageOptions: [],
        selectedRows: [],
        showFormDialog: false,
        isEditMode: false,
        editData: null,
        showDeleteDialog: false,
        deleteData: null,
        isBatchDelete: false,
      };
    },
    created() {
      this.loadTableData();
      this.loadSchoolOptions();
      this.loadTeacherOptions();
      this.loadSubjectOptions();
      this.loadStageOptions();
    },
    methods: {
      async loadTableData() {
        this.loading = true;
        try {
          const params = {
            pageNum: this.currentPage,
            pageSize: this.pageSize,
          };
          if (this.searchKeyword) params.keyword = this.searchKeyword;
          if (this.filterSchoolId) params.schoolId = this.filterSchoolId;
          if (this.filterTeacherId) params.teacherId = this.filterTeacherId;
          if (this.filterSubjectId) params.subjectId = this.filterSubjectId;
          if (this.filterStageId) params.stageId = this.filterStageId;
          const res = await publicResourceApi.page(params);
          this.tableData =
            res.data?.records.map(i => {
              if (i.coverUrl) {
                i.coverUrlData = `${i.coverUrl}`;
                // i.coverUrlData = `${window.businessURL}${i.coverUrl}`;
              }
              return i;
            }) || [];
          this.total = res.data?.total || 0;
        } catch (e) {
          console.error(e);
        } finally {
          this.loading = false;
        }
      },
      async loadSchoolOptions() {
        try {
          const res = await schoolApi.page({ pageNum: 1, pageSize: 9999 });
          this.schoolOptions = res.data?.list || [];
        } catch (e) {
          console.error(e);
        }
      },
      async loadTeacherOptions() {
        try {
          const res = await teacherApi.page({ pageNum: 1, pageSize: 9999 });
          this.allTeacherOptions = res.data?.list || [];
          this.filterTeacherOptions = this.allTeacherOptions;
        } catch (e) {
          console.error(e);
        }
      },
      async loadTeacherOptionsBySchool(schoolId) {
        try {
          if (schoolId) {
            const res = await teacherApi.page({ pageNum: 1, pageSize: 9999, schoolId: schoolId });
            this.filterTeacherOptions = res.data?.list || [];
          } else {
            this.filterTeacherOptions = this.allTeacherOptions;
          }
        } catch (e) {
          console.error(e);
        }
      },
      async loadSubjectOptions() {
        try {
          const res = await subjectApi.page({ pageNum: 1, pageSize: 9999 });
          this.subjectOptions = res.data?.list || [];
        } catch (e) {
          console.error(e);
        }
      },
      async loadStageOptions() {
        try {
          const res = await gradeLevelApi.list();
          this.stageOptions = res.data || [];
        } catch (e) {
          console.error(e);
        }
      },
      handleSearch() {
        this.currentPage = 1;
        this.loadTableData();
      },
      handleSchoolChange(schoolId) {
        this.filterTeacherId = '';
        this.loadTeacherOptionsBySchool(schoolId);
        this.handleFilterChange();
      },
      handleFilterChange() {
        this.currentPage = 1;
        this.loadTableData();
      },
      resetFilters() {
        this.searchKeyword = '';
        this.filterSchoolId = '';
        this.filterTeacherId = '';
        this.filterSubjectId = '';
        this.filterStageId = '';
        this.showFilters = false;
        this.filterTeacherOptions = this.allTeacherOptions;
        this.currentPage = 1;
        this.loadTableData();
      },
      handleSizeChange(val) {
        this.pageSize = val;
        this.currentPage = 1;
        this.loadTableData();
      },
      handleCurrentChange(val) {
        this.currentPage = val;
        this.loadTableData();
      },
      handleSelectionChange(selection) {
        this.selectedRows = selection;
      },
      openAddDialog() {
        this.isEditMode = false;
        this.editData = null;
        this.showFormDialog = true;
      },
      handleCommand(cmd, row) {
        if (cmd === 'edit') {
          this.isEditMode = true;
          this.editData = row;
          this.showFormDialog = true;
        } else if (cmd === 'delete') {
          this.isBatchDelete = false;
          this.deleteData = row;
          this.showDeleteDialog = true;
        }
      },
      async handleTogglePublish(row) {
        try {
          await publicResourceApi.togglePublish(row.id);
          this.$message.success(row.publishStatus === 1 ? '下架成功' : '上架成功');
          this.loadTableData();
        } catch (e) {
          console.error(e);
        }
      },
      handleBatchDelete() {
        this.isBatchDelete = true;
        this.deleteData = null;
        this.showDeleteDialog = true;
      },
      async handleDeleteConfirm() {
        try {
          if (this.isBatchDelete) {
            for (const row of this.selectedRows) {
              await publicResourceApi.delete(row.id);
            }
            this.$message.success('批量删除成功');
          } else if (this.deleteData) {
            await publicResourceApi.delete(this.deleteData.id);
            this.$message.success('删除成功');
          }
          this.showDeleteDialog = false;
          this.deleteData = null;
          this.loadTableData();
        } catch (e) {
          console.error(e);
        }
      },
      handleFormConfirm() {
        this.showFormDialog = false;
        this.editData = null;
        this.loadTableData();
      },
      handleFormClose() {
        this.editData = null;
      },
      handleView(row) {
        this.$router.push({
          path: '/resource-common-detail',
          query: { id: row.id },
        });
      },
      formatFileSize(bytes) {
        if (!bytes) return '';
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      },
      formatTime(timeStr) {
        if (!timeStr) return '-';
        return timeStr.replace('T', ' ').substring(0, 19);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .common-container {
    background: #f5f7fa;
    min-height: 100%;
  }

  ::v-deep .common-resource-table {
    .el-table__header-wrapper {
      .el-table__header {
        th {
          background: #fafafc;
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
      }
    }

    .el-checkbox__inner {
      border-radius: 4px;
    }

    .el-table-column--selection .cell {
      padding-left: 10px !important;
      padding-right: 10px !important;
      text-overflow: clip !important;
    }
  }
</style>
