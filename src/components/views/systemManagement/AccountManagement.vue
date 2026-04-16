<template>
  <div class="p-6 common-container">
    <!-- 面包屑 -->
    <div class="mb-6">
      <div class="text-sm text-gray-500">
        <span
          class="text-blue-600 cursor-pointer"
          @click="$router.push('/system')"
          >系统管理</span
        >
        <span class="mx-2">/</span>
        <span class="text-gray-700">账号管理</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="bg-white rounded-lg shadow-sm">
      <!-- 头部 -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"
            >
              <i class="el-icon-user text-blue-600 text-lg"></i>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-800">账号管理</h2>
              <div class="flex items-center gap-3 mt-1">
                <span class="text-xs text-gray-500">
                  总计
                  <span class="text-blue-600 font-medium">{{
                    accountStats.total
                  }}</span>
                </span>
                <span class="text-xs text-gray-500">
                  启用
                  <span class="text-green-600 font-medium">{{
                    accountStats.enabled
                  }}</span>
                </span>
                <span class="text-xs text-gray-500">
                  禁用
                  <span class="text-red-600 font-medium">{{
                    accountStats.disabled
                  }}</span>
                </span>
              </div>
            </div>
          </div>
          <el-button type="primary" class="!rounded-lg" @click="handleAdd">
            <i class="el-icon-plus mr-1"></i>
            新增账号
          </el-button>
        </div>
      </div>

      <!-- 搜索和筛选 -->
      <div class="p-4 bg-gray-50 border-b border-gray-100">
        <div class="flex items-center gap-4">
          <div class="flex-1 max-w-md">
            <el-input
              v-model="searchQuery"
              placeholder="搜索账号、姓名、手机号..."
              prefix-icon="el-icon-search"
              clearable
              @keyup.enter.native="handleSearch"
            />
          </div>
          <el-select
            v-model="filterRole"
            placeholder="全部角色"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.roleName"
              :value="role.id"
            />
          </el-select>
          <el-select
            v-model="filterStatus"
            placeholder="全部状态"
            clearable
            style="width: 140px"
          >
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </div>
      </div>

      <!-- 账号列表 -->
      <div class="p-0">
        <el-table
          :data="accounts"
          stripe
          style="width: 100%"
          :header-cell-style="{ background: '#f8fafc', color: '#475569' }"
        >
          <el-table-column prop="username" label="账号名称" min-width="120">
            <template slot-scope="{ row }">
              <span class="font-medium text-gray-800">{{ row.username }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="realName" label="姓名" min-width="100" />
          <el-table-column prop="roleName" label="角色" min-width="140">
            <template slot-scope="{ row }">
              <el-tag
                :type="getRoleType(row.roleCode)"
                size="small"
                effect="light"
                class="!rounded-full"
              >
                <i :class="getRoleIcon(row.roleCode)" class="mr-1"></i>
                {{ row.roleName || row.role }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="手机号" min-width="130" />
          <el-table-column prop="status" label="状态" min-width="100">
            <template slot-scope="{ row }">
              <el-switch
                v-model="row.status"
                active-value="1"
                inactive-value="0"
                @change="handleStatusChange(row)"
              />
            </template>
          </el-table-column>
          <el-table-column
            prop="lastLoginTime"
            label="最后登录时间"
            min-width="160"
          />
          <el-table-column label="操作" fixed="right" min-width="180">
            <template slot-scope="{ row }">
              <div class="flex items-center gap-2">
                <el-button
                  type="text"
                  size="small"
                  class="!text-blue-600"
                  @click="handleEdit(row)"
                >
                  <i class="el-icon-edit mr-1"></i>编辑
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  class="!text-amber-600"
                  @click="handleResetPassword(row)"
                >
                  <i class="el-icon-key mr-1"></i>重置密码
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  class="!text-gray-400"
                  @click="handleDisable(row)"
                >
                  <i
                    :class="
                      row.status === '0'
                        ? 'el-icon-circle-close'
                        : 'el-icon-circle-check'
                    "
                    class="mr-1"
                  ></i>
                  {{ row.status === "0" ? "禁用" : "启用" }}
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="p-4 border-t border-gray-100 flex justify-end">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 安全提示 -->
    <div class="mt-4 bg-blue-50 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <i class="el-icon-info text-blue-600 text-lg mt-0.5"></i>
        <div class="flex-1">
          <h4 class="text-sm font-medium text-blue-800 mb-1">安全提示：</h4>
          <ul class="text-xs text-blue-700 space-y-1">
            <li>• 超级管理员拥有所有权限，请谨慎分配</li>
            <li>
              • 定期更新密码，建议密码长度不少于8位，包含字母、数字和特殊字符
            </li>
            <li>• 禁用的账号无法登录系统，但数据会保留</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 新增账号弹窗 -->
    <AddAccountDialog @success="handleAddSuccess" ref="addRef" />

    <!-- 编辑账号弹窗 -->
    <EditAccountDialog @success="handleEditSuccess" ref="editRef" />

    <!-- 重置密码弹窗 -->
    <ResetPasswordDialog
      :visible.sync="resetPasswordVisible"
      :data="currentRow"
      @success="handleResetSuccess"
    />
  </div>
</template>

<script>
import { create } from "sortablejs";
import AddAccountDialog from "./dialog/AddAccountDialog.vue";
import EditAccountDialog from "./dialog/EditAccountDialog.vue";
import ResetPasswordDialog from "./dialog/ResetPasswordDialog.vue";
import role from "@/api/role";
import user from "@/api/user";
export default {
  name: "AccountManagement",
  components: {
    AddAccountDialog,
    EditAccountDialog,
    ResetPasswordDialog,
  },
  data() {
    return {
      searchQuery: "",
      filterRole: "",
      filterStatus: "",
      currentPage: 1,
      pageSize: 10,
      total: 8,
      addDialogVisible: false,
      editDialogVisible: false,
      resetPasswordVisible: false,
      currentRow: null,
      accountStats: {
        total: 8,
        enabled: 5,
        disabled: 1,
      },
      roleOptions: [],
      accounts: [],
    };
  },
  // computed: {
  //   filteredAccounts() {
  //     let result = [...this.accounts];

  //     if (this.searchQuery) {
  //       const query = this.searchQuery.toLowerCase();
  //       result = result.filter(
  //         (item) =>
  //           item.username.toLowerCase().includes(query) ||
  //           item.realName.toLowerCase().includes(query) ||
  //           item.phone.includes(query)
  //       );
  //     }

  //     if (this.filterRole) {
  //       result = result.filter((item) => item.roleId === this.filterRole);
  //     }

  //     if (this.filterStatus) {
  //       result = result.filter((item) => item.status === this.filterStatus);
  //     }

  //     return result;
  //   },
  // },
  created() {
    this.getRoleOptions();
    this.getAccountList();
  },
  methods: {
    getRoleOptions() {
      role.list().then((res) => {
        console.log("角色列表======", res);
        if (res.code == 200) {
          this.roleOptions = res.data;
        }
      });
    },
    getAccountList() {
      const params = {
        page: this.currentPage,
        pageSize: this.pageSize,
      };
      if (this.searchQuery) {
        params.keyword = this.searchQuery;
      }
      if (this.filterRole) {
        params.roleId = this.filterRole;
      }
      if (this.filterStatus) {
        params.status = this.filterStatus - 0;
      }
      user.page(params).then((res) => {
        if (res.code === 200) {
          this.accounts = res.data.list.map((i) => {
            i.status = i.status + "";
            i.statusType = i.status === "1" ? true : false;
            return i;
          });
          console.log("ccccccccccccc", this.accounts);
          this.total = res.data.total || 0;
          this.accountStats = {
            total: this.total,
            enabled: this.accounts.filter((a) => a.status === "1").length,
            disabled: this.accounts.filter((a) => a.status === "0").length,
          };
        }
      });
    },
    getRoleType(role) {
      const types = {
        super_admin: "danger",
        jw_admin: "warning",
        device_admin: "success",
        sys_admin: "info",
      };
      return types[role] || "info";
    },
    getRoleLabel(role) {
      const labels = {
        super_admin: "超级管理员",
        jw_admin: "教务管理员",
        device_admin: "设备管理员",
        sys_admin: "系统管理员",
      };
      return labels[role] || role;
    },
    getRoleIcon(role) {
      const icons = {
        super_admin: "el-icon-s-custom",
        jw_admin: "el-icon-s-management",
        device_admin: "el-icon-s-tools",
        sys_admin: "el-icon-s-platform",
      };
      return icons[role] || "el-icon-user";
    },
    handleSearch() {
      this.currentPage = 1;
      this.getAccountList();
    },
    handleAdd() {
      this.$refs.addRef.showDialog();
    },
    handleAddSuccess() {
      this.$message.success("账号创建成功");
      this.getAccountList();
    },
    handleEdit(row) {
      this.currentRow = { ...row };
      this.$refs.editRef.showDialog(this.currentRow);
    },
    handleEditSuccess() {
      this.$message.success("账号更新成功");
      this.getAccountList();
    },
    handleResetPassword(row) {
      this.currentRow = { ...row };
      this.resetPasswordVisible = true;
    },
    handleResetSuccess() {
      this.$message.success("密码重置成功");
    },
    handleDisable(row) {
      const action = row.status === "0" ? "禁用" : "启用";
      this.$confirm(`确认${action}该账号吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          row.status = row.status == "0" ? "1" : "0";
          this.handleStatusChange(row);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    handleStatusChange(row) {
      let params = {
        username: row.username,
        realName: row.realName,
        password: row.password,
        phone: row.phone,
        roleId: row.roleId - 0,
        status: row.status - 0,
      };
      user.update(row.id, params).then((res) => {
        if (res.code == 200) {
          const status = row.status === "1" ? "启用" : "禁用";
          this.$message.success(`账号已${status}`);
          this.getAccountList();
        }
      });
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getAccountList();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getAccountList();
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .el-table {
  th {
    background-color: #f8fafc;
    font-weight: 500;
    color: #475569;
  }
}

::v-deep .el-tag {
  border-radius: 9999px;
}

::v-deep .el-switch {
  &.is-checked .el-switch__core {
    border-color: #10b981;
    background-color: #10b981;
  }
}

::v-deep .el-button--text {
  padding: 0;
  height: auto;
}
</style>
