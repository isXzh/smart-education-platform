<template>
  <div class="p-6 common-container">
    <!-- 面包屑 -->
    <div class="mb-6">
      <div class="text-sm text-gray-500">
        <span class="text-blue-600 cursor-pointer" @click="$router.push('/system')">系统管理</span>
        <span class="mx-2">/</span>
        <span class="text-gray-700">操作日志</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="bg-white rounded-lg shadow-sm">
      <!-- 头部 -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <i class="el-icon-document text-blue-600 text-lg"></i>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-800">操作日志</h2>
              <el-tag type="warning" size="small" class="mt-1">仅保留</el-tag>
            </div>
          </div>
          <el-button type="primary" icon="el-icon-download" @click="handleExport">导出日志</el-button>
        </div>
      </div>

      <!-- 搜索筛选区 -->
      <div class="p-4 bg-gray-50 border-b border-gray-100">
        <div class="flex flex-wrap items-center gap-4 search-top">
          <div class="flex search-top-item items-center gap-2">
            <span class="text-sm text-gray-600">操作时间</span>
            <el-date-picker
              v-model="filter.startTime"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              style="width: 70%"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </div>
          <div class="flex search-top-item items-center gap-2">
            <span class="text-sm text-gray-600">操作人</span>
            <el-select v-model="filter.operatorName" placeholder="全部操作人" size="small" style="width: 70%">
              <el-option label="全部操作人" value="" />
              <el-option v-for="item in operatorList" :key="item.id" :label="item.realName" :value="item.realName" />
            </el-select>
          </div>
          <div class="flex search-top-item items-center gap-2">
            <span class="text-sm text-gray-600">操作模块</span>
            <el-select v-model="filter.module" placeholder="全部模块" size="small" style="width: 70%">
              <el-option label="全部模块" value="" />
              <el-option v-for="item in moduleList" :key="item.code" :label="item.code" :value="item.code" />
            </el-select>
          </div>
        </div>
        <div class="mt-3 search-btm">
          <span>关键词搜索</span>
          <el-input
            v-model="filter.keyword"
            placeholder="搜索操作内容、操作人、IP地址..."
            prefix-icon="el-icon-search"
            size="small"
            style="width: 800px"
            clearable
          />
          <el-button type="primary" size="small" icon="el-icon-search" @click="handleSearch" style="width: 300px"
            >查询筛选</el-button
          >
          <el-button size="small" icon="el-icon-refresh-right" @click="handleReset" style="width: 300px"
            >重置</el-button
          >
        </div>
      </div>

      <!-- 日志列表 -->
      <div class="p-0">
        <el-table
          :data="logList"
          stripe
          style="width: 100%"
          :header-cell-style="{ background: '#f8fafc', color: '#475569' }"
        >
          <el-table-column prop="createdAt" label="操作时间" min-width="160" />
          <el-table-column prop="operatorName" label="操作人" min-width="100" />
          <el-table-column prop="module" label="操作模块" min-width="100">
            <template slot-scope="{ row }">
              <el-tag size="small" :type="getModuleType(row.module)">{{ row.module }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="operationType" label="操作类型" min-width="100">
            <template slot-scope="{ row }">
              <el-tag size="small" :type="getTypeType(row.operationType)">{{ row.operationType }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="operationDesc" label="操作内容详情" min-width="200" show-overflow-tooltip />
          <el-table-column prop="ipAddress" label="IP地址" min-width="130" />
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="p-4 border-t border-gray-100 flex justify-end">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 底部说明 -->
      <div class="px-6 py-4 bg-gray-50 rounded-b-lg">
        <div class="text-xs text-gray-500 space-y-1">
          <p><i class="el-icon-info mr-1"></i>日志按照操作时间倒序排列，最新的操作日志在最前面</p>
          <p><i class="el-icon-info mr-1"></i>操作日志仅保留6个月，超过6个月的日志将被自动删除</p>
          <p><i class="el-icon-info mr-1"></i>支持按照时间范围、操作人、操作模块进行筛选查询</p>
          <p><i class="el-icon-info mr-1"></i>导出的日志将保存为CSV格式，文件大小不超过50MB</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import operationLog from '@/api/operationLog.js';
  import user from '@/api/user.js';

  export default {
    name: 'OperationLog',
    data() {
      return {
        activeTab: 'general',
        tabList: [
          { key: 'general', label: '通用配置' },
          { key: 'theme', label: '界面与主题' },
          { key: 'sync', label: '数据同步' },
          { key: 'notification', label: '通知配置' },
        ],
        filter: {
          startTime: '',
          endTime: '',
          operatorName: '',
          module: '',
          operationType: '',
          status: '',
          keyword: '',
        },
        currentPage: 1,
        pageSize: 10,
        total: 100,
        operatorList: [],
        moduleList: [],
        logList: [
          {
            id: 1,
            createdAt: '2026-04-13 10:01:04',
            operatorName: '王五',
            module: '系统配置',
            operationType: '修改',
            operationDesc: '修改配置项"自动入会提前时间"为10分钟',
            ipAddress: '192.168.253.45',
            status: 1,
            duration: 150,
          },
          {
            id: 2,
            createdAt: '2026-04-13 10:19:15',
            operatorName: '李四',
            module: '账号管理',
            operationType: '新增',
            operationDesc: '新增教师账号"李明"',
            ipAddress: '192.168.253.206',
            status: 1,
            duration: 200,
          },
          {
            id: 3,
            createdAt: '2026-04-13 10:33:57',
            operatorName: '管理员',
            module: '账号管理',
            operationType: '新增',
            operationDesc: '新增教师账号"张平"',
            ipAddress: '192.168.253.49',
            status: 1,
            duration: 180,
          },
          {
            id: 4,
            createdAt: '2026-04-13 10:48:42',
            operatorName: '管理员',
            module: '设备管理',
            operationType: '删除',
            operationDesc: '删除设备"保障部001"',
            ipAddress: '192.168.253.124',
            status: 1,
            duration: 120,
          },
          {
            id: 5,
            createdAt: '2026-04-12 12:53:06',
            operatorName: '管理员',
            module: '账号管理',
            operationType: '新增',
            operationDesc: '新增学生"赵六"',
            ipAddress: '192.168.255.36',
            status: 1,
            duration: 160,
          },
          {
            id: 6,
            createdAt: '2026-04-12 12:34:38',
            operatorName: '张三',
            module: '账号管理',
            operationType: '新增',
            operationDesc: '新增教师账号"李学"',
            ipAddress: '192.168.255.148',
            status: 1,
            duration: 190,
          },
        ],
      };
    },
    mounted() {
      this.loadOperatorList();
      this.loadModuleList();
      this.loadLogList();
    },
    methods: {
      async loadOperatorList() {
        try {
          const params = {
            pageNum: 1,
            pageSize: 1000,
          };
          const response = await user.page(params);
          if (response.code === 200) {
            this.operatorList = response.data.list;
          }
        } catch (error) {
          this.$message.error('加载操作人列表失败');
        }
      },
      async loadModuleList() {
        try {
          const response = await operationLog.modules();
          if (response.code === 200) {
            this.moduleList = response.data;
          }
        } catch (error) {
          this.$message.error('加载操作模块列表失败');
        }
      },
      async loadLogList() {
        try {
          const params = {
            startTime: this.filter.startTime ? this.filter.startTime[0] : '',
            endTime: this.filter.startTime ? this.filter.startTime[1] : '',
            operatorName: this.filter.operatorName,
            module: this.filter.module,
            operationType: this.filter.operationType,
            status: this.filter.status,
            keyword: this.filter.keyword,
            pageNum: this.currentPage,
            pageSize: this.pageSize,
          };
          const response = await operationLog.page(params);
          if (response.code === 200) {
            this.logList = response.data.list;
            this.total = response.data.total;
          }
        } catch (error) {
          this.$message.error('加载日志数据失败');
        }
      },
      handleSearch() {
        this.currentPage = 1;
        this.loadLogList();
        this.$message.success('筛选条件已应用');
      },
      async handleExport() {
        try {
          const params = {
            startTime: this.filter.startTime ? this.filter.startTime[0] : '',
            endTime: this.filter.startTime ? this.filter.startTime[1] : '',
            operatorName: this.filter.operatorName,
            module: this.filter.module,
            operationType: this.filter.operationType,
            status: this.filter.status,
            keyword: this.filter.keyword,
          };
          const response = await operationLog.exportLogs(params);

          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;

          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          const hours = String(now.getHours()).padStart(2, '0');
          const minutes = String(now.getMinutes()).padStart(2, '0');
          const seconds = String(now.getSeconds()).padStart(2, '0');

          link.download = `操作日志_${year}${month}${day}_${hours}${minutes}${seconds}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          this.$message.success('导出日志成功');
        } catch (error) {
          this.$message.error('导出日志失败');
        }
      },
      handleReset() {
        this.filter = {
          startTime: '',
          endTime: '',
          operatorName: '',
          module: '',
          operationType: '',
          status: '',
          keyword: '',
        };
        this.$message.success('筛选条件已重置');
      },
      handleSizeChange(val) {
        this.pageSize = val;
        this.loadLogList();
      },
      handleCurrentChange(val) {
        this.currentPage = val;
        this.loadLogList();
      },
      getModuleType(module) {
        const types = {
          系统配置: 'primary',
          账号管理: 'success',
          设备管理: 'warning',
          角色权限: 'info',
        };
        return types[module] || 'info';
      },
      getTypeType(type) {
        const types = {
          新增: 'success',
          修改: 'primary',
          删除: 'danger',
          查询: 'info',
          登录: 'warning',
        };
        return types[type] || 'info';
      },
    },
  };
</script>

<style lang="scss" scoped>
  ::v-deep .el-tag {
    border-radius: 4px;
  }

  ::v-deep .el-table {
    th {
      background-color: #f8fafc;
      font-weight: 500;
      color: #475569;
    }
  }
  .search-top {
    justify-content: space-between;
    .search-top-item {
      flex: 1;
    }
  }
  .search-btm {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 90px;
    .el-button {
      font-size: 14px;
    }
  }
</style>
