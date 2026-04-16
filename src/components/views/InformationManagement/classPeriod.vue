<template>
  <div class="p-6 bg-gray-50 min-h-full common-container">
    <!-- 面包屑 -->
    <div class="mb-4 text-sm text-gray-600">
      <span
        class="text-blue-600 cursor-pointer hover:underline"
        @click="$router.push('/')"
        >基础信息管理</span
      >
      <span class="mx-2">/</span>
      <span class="text-gray-900">课时管理</span>
    </div>

    <!-- 主卡片 -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <!-- 标题栏 -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <i class="el-icon-s-data text-blue-600 text-xl"></i>
            <span class="text-lg font-semibold text-gray-900">课时管理</span>
          </div>
          <div class="flex items-center gap-2 ml-6">
            <span class="text-sm text-gray-600">学段:</span>
            <el-select
              @change="changeXd"
              v-model="currentGrade"
              size="small"
              class="w-24"
            >
              <el-option
                v-for="item in currentGradeOptions"
                :key="item.id"
                :label="item.stageName"
                :value="item.id"
              >
              </el-option>
            </el-select>
            <span class="text-sm text-blue-600 ml-2"
              >共 {{ periodList.length }} 个课时</span
            >
          </div>
        </div>
        <div class="flex items-center gap-3">
          <el-button
            type="default"
            size="medium"
            icon="el-icon-upload2"
            @click="uploadExcel"
          >
            下载导入模板
          </el-button>
          <el-button
            type="default"
            size="medium"
            icon="el-icon-upload2"
            @click="handleBatchImport"
          >
            批量导入
          </el-button>
          <el-button
            type="primary"
            size="medium"
            icon="el-icon-plus"
            @click="handleAdd"
          >
            新增课时
          </el-button>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table
        :data="periodList"
        row-key="id"
        ref="dragTable"
        style="width: 100%"
        class="class-period-table"
        v-loading="loading"
      >
        <el-table-column type="index" width="80" align="center">
          <template slot="header">
            <span>排序</span>
          </template>
          <template slot-scope="scope">
            <div class="flex items-center justify-center gap-2">
              <i class="el-icon-s-operation text-gray-400 cursor-move"></i>
              <span
                class="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center"
                >{{ scope.row.periodIndex }}</span
              >
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="periodName" label="课时名称" min-width="120">
          <template slot-scope="scope">
            <span class="font-medium text-gray-900">{{
              scope.row.periodName
            }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="startTime"
          label="开始时间"
          min-width="120"
          align="center"
        >
          <template slot-scope="scope">
            <span class="text-gray-700 font-mono">{{
              scope.row.startTime
            }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="endTime"
          label="结束时间"
          min-width="120"
          align="center"
        >
          <template slot-scope="scope">
            <span class="text-gray-700 font-mono">{{ scope.row.endTime }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="时长"
          prop="duration"
          min-width="100"
          align="center"
        >
          <template slot-scope="scope">
            <span class="text-gray-700">{{ scope.row.duration }} 分钟</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template slot-scope="scope">
            <div class="flex items-center justify-center gap-2">
              <el-button
                type="text"
                size="small"
                class="text-blue-600 hover:text-blue-800"
                @click="handleEdit(scope.row)"
              >
                <i class="el-icon-edit text-lg"></i>
              </el-button>
              <el-button
                type="text"
                size="small"
                class="text-red-600 hover:text-red-800"
                @click="handleDelete(scope.row)"
              >
                <i class="el-icon-delete text-lg"></i>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 使用提示 -->
      <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <i class="el-icon-info text-blue-500 mt-0.5"></i>
          <div>
            <p class="font-medium text-blue-900 mb-2">使用提示：</p>
            <ul class="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>拖拽课时行前的图标可以调整课时顺序</li>
              <li>每个学段的课时配置独立管理，切换学段查看不同配置</li>
              <li>课时时间不能与同一天内其他课时重叠</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑课时弹窗 -->
    <class-period-dialog
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      :gradeName="currentGradeName"
      :is-edit="isEdit"
      :edit-data="editData"
      :existing-periods="periodList"
      @confirm="handleDialogConfirm"
      @cancel="handleDialogCancel"
      @close="handleDialogClose"
    />
  </div>
</template>

<script>
import ClassPeriodDialog from "@/components/views/dialog/ClassPeriodDialog.vue";
import Sortable, { mount } from "sortablejs";
import classPeriod from "@/api/classPeriod.js";
export default {
  name: "ClassPeriod",
  components: {
    ClassPeriodDialog,
  },
  data() {
    return {
      loading: false,
      currentGrade: "",
      currentGradeName: "",
      periodList: [],
      dialogVisible: false,
      dialogTitle: "新增课时",
      isEdit: false,
      currentId: null,
      // 传递给弹窗的数据
      editData: null,
      currentGradeOptions: [],
    };
  },
  // watch: {
  //   currentGrade() {
  //     this.fetchPeriodList();
  //   },
  // },
  created() {
    // this.fetchPeriodList();
    this.stageList();
  },
  mounted() {
    // 默认选中第一个组织
    // this.currentOrg = this.orgData[0];
  },
  methods: {
    // 获取学段下拉列表
    async stageList() {
      let res = await classPeriod.stageList();
      if (res.code == 200) {
        this.currentGradeOptions = res.data;
        this.currentGrade = res.data[0].id; // 默认选中第一个学段
        this.currentGradeName = res.data[0].stageName; // 默认选中第一个学段

        this.getlist();
      }
    },
    // 改变学段
    changeXd(v) {
      let ind = this.currentGradeOptions.findIndex((i) => {
        return i.id == v;
      });
      this.currentGradeName = this.currentGradeOptions[ind].stageName;
      this.getlist();
    },
    async getlist() {
      let res = await classPeriod.list(this.currentGrade);
      if (res.code == 200) {
        this.periodList = res.data;
      }
    },
    // 下载导入模板
    async uploadExcel() {
      let res = await classPeriod.downloadTemplate();
      if (res.code == 200) {
        console.log("模板====", res);
      }
    },
    // 初始化拖拽排序
    initDragSort() {
      if (this.periodList.length === 0) return;
      console.log("=========", this.$refs.dragTable);
      const el = this.$refs.dragTable.$el.querySelector(
        ".el-table__body-wrapper tbody"
      );
      const self = this;

      Sortable.create(el, {
        // 指定可拖拽的元素为表格行
        draggable: ".el-table__row",
        // 动画时长
        animation: 150,
        // 拖拽结束后的回调
        onEnd({ newIndex, oldIndex }) {
          // 核心逻辑：交换数组元素位置
          const list = [...self.periodList];
          const [movedItem] = list.splice(oldIndex, 1);
          list.splice(newIndex, 0, movedItem);
          // 更新数据，触发视图刷新
          self.periodList = list;
        },
      });
    },
    // 获取课时列表

    // 计算时长
    calculateDuration(startTime, endTime) {
      const start = new Date(`2000-01-01 ${startTime}`);
      const end = new Date(`2000-01-01 ${endTime}`);
      return Math.round((end - start) / (1000 * 60));
    },

    // 批量导入
    handleBatchImport() {
      this.$message.info("批量导入功能开发中");
    },

    // 新增课时
    handleAdd() {
      this.isEdit = false;
      this.dialogTitle = "新增课时";
      this.currentId = null;
      this.editData = null;
      this.dialogVisible = true;
      console.log("打开新增课时弹窗");
    },

    // 编辑课时
    handleEdit(row) {
      this.isEdit = true;
      this.dialogTitle = "编辑课时";
      this.currentId = row.id;
      this.editData = { ...row };
      this.dialogVisible = true;
    },

    // 删除课时
    handleDelete(row) {
      this.$confirm(`确定要删除 "${row.name}" 吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          let res = await classPeriod.delete(row.id);
          if (res.code == 200) {
            this.$message.success("删除成功");
            this.getlist();
          }
        })
        .catch(() => {});
    },

    // 弹窗确认
    handleDialogConfirm(formData) {
      if (this.isEdit) {
        // 编辑
        this.update(formData);
      } else {
        // 新增
        this.add(formData);
      }
    },
    async add(formData) {
      let params = {
        periodName: formData.name,
        startTime: formData.startTime,
        endTime: formData.endTime,
        periodIndex: formData.sort,
        stageId: this.currentGrade,
      };
      let res = await classPeriod.add(params);
      if (res.code == 200) {
        this.dialogVisible = false;
        this.$message.success("新增成功");
        this.getlist();
      }
    },
    // 编辑课时
    async update(formData) {
      let params = {
        periodName: formData.name,
        startTime: formData.startTime,
        endTime: formData.endTime,
        periodIndex: formData.sort,
        stageId: this.currentGrade,
      };
      let res = await classPeriod.update(this.editData.id, params);
      if (res.code == 200) {
        this.dialogVisible = false;
        this.$message.success("编辑成功");
        this.getlist();
      }
    },
    // 弹窗取消
    handleDialogCancel() {
      console.log("弹窗取消");
    },

    // 弹窗关闭
    handleDialogClose() {
      console.log("弹窗关闭");
    },
  },
};
</script>

<style scoped>
.class-period-table {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.class-period-table ::v-deep .el-table__header th {
  background-color: #f9fafb;
  color: #374151;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

.class-period-table ::v-deep .el-table__row td {
  border-bottom: 1px solid #f3f4f6;
}

.class-period-table ::v-deep .el-table__row:hover td {
  background-color: #f9fafb;
}

/* 面包屑样式 */
.text-blue-600 {
  color: #2563eb;
}

.text-blue-600:hover {
  color: #1d4ed8;
}
</style>
