<template>
  <div class="p-6 common-container">
    <!-- 面包屑 -->
    <div class="role-top">
      <div class="text-sm text-gray-500">
        <span
          class="text-blue-600 cursor-pointer"
          @click="$router.push('/system')"
          >系统管理</span
        >
        <span class="mx-2">/</span>
        <span class="text-gray-700">角色权限</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="flex">
        <!-- 左侧角色列表 -->
        <div class="w-80 border-r border-gray-100">
          <div class="p-5 border-b border-gray-100">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"
                >
                  <i class="el-icon-user text-blue-600"></i>
                </div>
                <span class="font-semibold text-gray-800">角色列表</span>
              </div>
              <el-button
                type="primary"
                size="small"
                circle
                @click="handleAddRole"
              >
                <i class="el-icon-plus"></i>
              </el-button>
            </div>
            <div
              class="text-xs text-blue-600 bg-blue-50 rounded-full px-3 py-1 inline-block"
            >
              共 {{ roles.length }} 个角色
            </div>
          </div>

          <div class="overflow-y-auto" style="max-height: 600px">
            <div
              v-for="role in roles"
              :key="role.id"
              class="p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors"
              :class="{
                'bg-blue-50 border-l-4 border-l-blue-500':
                  selectedRole && selectedRole.id === role.id,
              }"
              @click="selectRole(role)"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-gray-800">{{ role.name }}</div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ role.description }}
                  </div>
                  <div class="text-xs text-gray-400 mt-1">
                    创建时间：{{ role.createTime }}
                  </div>
                </div>
                <div
                  class="flex gap-1"
                  v-if="selectedRole && selectedRole.id === role.id"
                >
                  <el-button
                    type="text"
                    size="mini"
                    @click.stop="handleEditRole(role)"
                  >
                    <i class="el-icon-edit text-blue-500"></i>
                  </el-button>
                  <el-button
                    type="text"
                    size="mini"
                    @click.stop="handleDeleteRole(role)"
                  >
                    <i class="el-icon-delete text-red-500"></i>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧权限配置 -->
        <div class="flex-1 p-6">
          <div v-if="selectedRole" class="h-full flex flex-col">
            <!-- 头部 -->
            <div class="flex right-top items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-semibold text-gray-800">
                  {{ selectedRole.name }}
                </h2>
                <p class="text-sm text-gray-500 mt-1">
                  {{ selectedRole.description }}
                </p>
              </div>
              <div class="flex gap-3">
                <el-button @click="saveAsTemplate">
                  <i class="el-icon-document-copy mr-1"></i>
                  保存为模板
                </el-button>
                <el-button @click="loadTemplate">
                  <i class="el-icon-upload2 mr-1"></i>
                  加载模板
                </el-button>
              </div>
            </div>

            <!-- 权限表格 -->
            <div
              class="flex-1 border border-gray-200 rounded-lg overflow-hidden"
            >
              <div
                class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center"
              >
                <div class="flex-1 text-sm font-medium text-gray-700">
                  模块/功能
                </div>
                <div class="w-20 text-center text-sm text-gray-600">查看</div>
                <div class="w-20 text-center text-sm text-gray-600">新增</div>
                <div class="w-20 text-center text-sm text-gray-600">编辑</div>
                <div class="w-20 text-center text-sm text-gray-600">删除</div>
              </div>

              <div class="overflow-y-auto" style="max-height: 580px">
                <div
                  v-for="module in permissionTree"
                  :key="module.id"
                  class="border-b border-gray-100"
                >
                  <!-- 模块行 -->
                  <div class="flex items-center px-4 py-3 hover:bg-gray-50">
                    <div class="flex-1 flex items-center gap-2">
                      <i
                        class="el-icon-arrow-down text-gray-400"
                        v-if="module.expanded"
                      ></i>
                      <i class="el-icon-arrow-right text-gray-400" v-else></i>
                      <el-checkbox
                        v-model="module.checked"
                        @change="handleModuleCheck(module)"
                      >
                        <span class="font-medium text-gray-800">{{
                          module.name
                        }}</span>
                      </el-checkbox>
                    </div>
                    <div class="w-20 text-center">
                      <el-checkbox
                        v-model="module.permissions.view"
                        @change="updateModuleCheck(module)"
                      ></el-checkbox>
                    </div>
                    <div class="w-20 text-center">
                      <el-checkbox
                        v-model="module.permissions.add"
                        @change="updateModuleCheck(module)"
                      ></el-checkbox>
                    </div>
                    <div class="w-20 text-center">
                      <el-checkbox
                        v-model="module.permissions.edit"
                        @change="updateModuleCheck(module)"
                      ></el-checkbox>
                    </div>
                    <div class="w-20 text-center">
                      <el-checkbox
                        v-model="module.permissions.delete"
                        @change="updateModuleCheck(module)"
                      ></el-checkbox>
                    </div>
                  </div>

                  <!-- 子功能行 -->
                  <div
                    v-if="module.expanded && module.children"
                    class="bg-gray-50/50"
                  >
                    <div
                      v-for="child in module.children"
                      :key="child.id"
                      class="flex items-center px-4 py-2 pl-12 border-t border-gray-100"
                    >
                      <div class="flex-1 flex items-center gap-2">
                        <i class="el-icon-document text-gray-400 text-sm"></i>
                        <el-checkbox
                          v-model="child.checked"
                          @change="handleChildCheck(child, module)"
                        >
                          <span class="text-sm text-gray-700">{{
                            child.name
                          }}</span>
                        </el-checkbox>
                      </div>
                      <div class="w-20 text-center">
                        <el-checkbox
                          v-model="child.permissions.view"
                          @change="updateChildCheck(child, module)"
                        ></el-checkbox>
                      </div>
                      <div class="w-20 text-center">
                        <el-checkbox
                          v-model="child.permissions.add"
                          @change="updateChildCheck(child, module)"
                        ></el-checkbox>
                      </div>
                      <div class="w-20 text-center">
                        <el-checkbox
                          v-model="child.permissions.edit"
                          @change="updateChildCheck(child, module)"
                        ></el-checkbox>
                      </div>
                      <div class="w-20 text-center">
                        <el-checkbox
                          v-model="child.permissions.delete"
                          @change="updateChildCheck(child, module)"
                        ></el-checkbox>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 权限说明 -->
            <div class="mt-4 right-bottom bg-blue-50 rounded-lg p-4">
              <div class="flex items-start gap-2">
                <i class="el-icon-info text-blue-600 mt-0.5"></i>
                <div class="flex-1 text-sm text-blue-800 space-y-1">
                  <p>• 点击模块名称前的复选框可快速勾选/取消该模块所有权限</p>
                  <p>• 权限模板可以保存常用的权限配置，方便快速应用到新角色</p>
                  <p>• 修改权限后立即生效，已分配该角色的账号将获得新权限</p>
                </div>
              </div>
            </div>

            <!-- 保存按钮 -->
            <!-- <div class="flex justify-end mt-6">
              <el-button type="primary" size="medium" @click="savePermissions">
                <i class="el-icon-check mr-1"></i>
                保存权限配置
              </el-button>
            </div> -->
          </div>

          <!-- 未选择角色提示 -->
          <div v-else class="h-full flex items-center justify-center">
            <div class="text-center text-gray-400">
              <i class="el-icon-s-check text-6xl mb-4"></i>
              <p class="text-lg">请在左侧选择一个角色进行权限配置</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增角色弹窗 -->
    <AddRoleDialog
      :visible.sync="addRoleVisible"
      @success="handleRoleSuccess"
    />

    <!-- 编辑角色弹窗 -->
    <EditRoleDialog
      :visible.sync="editRoleVisible"
      :data="currentRoleData"
      @success="handleRoleSuccess"
    />

    <!-- 加载权限模板弹窗 -->
    <LoadTemplateDialog
      :visible.sync="loadTemplateVisible"
      @select="handleTemplateSelect"
    />
  </div>
</template>

<script>
import AddRoleDialog from "./dialog/AddRoleDialog.vue";
import EditRoleDialog from "./dialog/EditRoleDialog.vue";
import LoadTemplateDialog from "./dialog/LoadTemplateDialog.vue";
import menu from "@/api/menu";
export default {
  name: "RolePermission",
  components: {
    AddRoleDialog,
    EditRoleDialog,
    LoadTemplateDialog,
  },
  data() {
    return {
      selectedRole: null,
      addRoleVisible: false,
      editRoleVisible: false,
      loadTemplateVisible: false,
      currentRoleData: null,
      roles: [
        {
          id: 1,
          name: "超级管理员",
          description: "拥有系统所有权限",
          createTime: "2024-01-01",
        },
        {
          id: 2,
          name: "教务管理员",
          description: "负责课程排课和基础信息管理",
          createTime: "2024-02-15",
        },
        {
          id: 3,
          name: "设备管理员",
          description: "负责设备资源管理",
          createTime: "2024-03-20",
        },
      ],
      permissionTree: [
        {
          id: "schedule",
          name: "课程排课",
          checked: false,
          expanded: true,
          permissions: { view: false, add: false, edit: false, delete: false },
          children: [
            {
              id: "schedule_manage",
              name: "排课管理",
              checked: false,
              permissions: {
                view: false,
                add: false,
                edit: false,
                delete: false,
              },
            },
            {
              id: "schedule_view",
              name: "课表视图",
              checked: false,
              permissions: {
                view: false,
                add: false,
                edit: false,
                delete: false,
              },
            },
            {
              id: "schedule_calendar",
              name: "排课日历",
              checked: false,
              permissions: {
                view: false,
                add: false,
                edit: false,
                delete: false,
              },
            },
          ],
        },
        {
          id: "device",
          name: "设备管理",
          checked: false,
          expanded: true,
          permissions: { view: false, add: false, edit: false, delete: false },
          children: [
            {
              id: "device_list",
              name: "设备列表",
              checked: false,
              permissions: {
                view: false,
                add: false,
                edit: false,
                delete: false,
              },
            },
            {
              id: "device_log",
              name: "设备日志",
              checked: false,
              permissions: {
                view: false,
                add: false,
                edit: false,
                delete: false,
              },
            },
          ],
        },
        {
          id: "base",
          name: "基础信息管理",
          checked: false,
          expanded: true,
          permissions: { view: false, add: false, edit: false, delete: false },
          children: [
            {
              id: "org",
              name: "组织架构",
              checked: false,
              permissions: {
                view: false,
                add: false,
                edit: false,
                delete: false,
              },
            },
            {
              id: "period",
              name: "课时管理",
              checked: false,
              permissions: {
                view: false,
                add: false,
                edit: false,
                delete: false,
              },
            },
            {
              id: "subject",
              name: "学科管理",
              checked: false,
              permissions: {
                view: false,
                add: false,
                edit: false,
                delete: false,
              },
            },
          ],
        },
        {
          id: "system",
          name: "系统管理",
          checked: false,
          expanded: true,
          permissions: { view: false, add: false, edit: false, delete: false },
          children: [
            {
              id: "account",
              name: "账号管理",
              checked: false,
              permissions: {
                view: false,
                add: false,
                edit: false,
                delete: false,
              },
            },
            {
              id: "role",
              name: "角色权限",
              checked: false,
              permissions: {
                view: false,
                add: false,
                edit: false,
                delete: false,
              },
            },
          ],
        },
      ],
    };
  },
  created() {
    this.selectedRole = this.roles[0];
    this.treeForPermission();
  },
  methods: {
    async treeForPermission() {
      let res = await menu.treeForPermission();
      if (res.code == 200) {
      }
    },
    selectRole(role) {
      this.selectedRole = role;
    },
    handleAddRole() {
      this.addRoleVisible = true;
    },
    handleEditRole(role) {
      this.currentRoleData = { ...role };
      this.editRoleVisible = true;
    },
    handleDeleteRole(role) {
      this.$confirm("确认删除该角色吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          const index = this.roles.findIndex((r) => r.id === role.id);
          if (index > -1) {
            this.roles.splice(index, 1);
            if (this.selectedRole && this.selectedRole.id === role.id) {
              this.selectedRole = null;
            }
          }
          this.$message.success("删除成功");
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    handleRoleSuccess() {
      this.$message.success("操作成功");
    },
    saveAsTemplate() {
      this.$message.success("权限配置已保存为模板");
    },
    loadTemplate() {
      this.loadTemplateVisible = true;
    },
    handleTemplateSelect(template) {
      this.$message.success(`已加载模板：${template.name}`);
      this.loadTemplateVisible = false;
    },
    handleModuleCheck(module) {
      const checked = module.checked;
      module.permissions.view = checked;
      module.permissions.add = checked;
      module.permissions.edit = checked;
      module.permissions.delete = checked;

      if (module.children) {
        module.children.forEach((child) => {
          child.checked = checked;
          child.permissions.view = checked;
          child.permissions.add = checked;
          child.permissions.edit = checked;
          child.permissions.delete = checked;
        });
      }
    },
    updateModuleCheck(module) {
      const allChecked =
        module.permissions.view &&
        module.permissions.add &&
        module.permissions.edit &&
        module.permissions.delete;
      module.checked = allChecked;

      if (module.children) {
        module.children.forEach((child) => {
          if (module.permissions.view) child.permissions.view = true;
        });
      }
    },
    handleChildCheck(child, module) {
      const checked = child.checked;
      child.permissions.view = checked;
      child.permissions.add = checked;
      child.permissions.edit = checked;
      child.permissions.delete = checked;

      this.updateParentCheck(module);
    },
    updateChildCheck(child, module) {
      const allChecked =
        child.permissions.view &&
        child.permissions.add &&
        child.permissions.edit &&
        child.permissions.delete;
      child.checked = allChecked;
      this.updateParentCheck(module);
    },
    updateParentCheck(module) {
      if (!module.children) return;

      const allChildrenChecked = module.children.every(
        (child) =>
          child.permissions.view &&
          child.permissions.add &&
          child.permissions.edit &&
          child.permissions.delete
      );
      module.checked = allChildrenChecked;

      const someChildrenChecked = module.children.some(
        (child) =>
          child.permissions.view ||
          child.permissions.add ||
          child.permissions.edit ||
          child.permissions.delete
      );

      if (someChildrenChecked) {
        module.permissions.view = true;
      }
    },
    // savePermissions() {
    //   this.$message.success("权限配置保存成功");
    // },
  },
};
</script>

<style lang="scss" scoped>
.common-container {
  height: 100%;
  .bg-white {
    height: calc(100% - 60px);
  }
}
.role-top {
  margin-bottom: 24px;
  height: 20px;
}
::v-deep .el-table {
  th {
    background-color: #f8fafc;
    font-weight: 500;
    color: #475569;
  }
}
.right-top {
  height: 52px;
  margin-bottom: 24px;
}
.right-bottom {
  height: 100px;
}
::v-deep .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #4f7cff;
  border-color: #4f7cff;
}

::v-deep .el-checkbox__input.is-indeterminate .el-checkbox__inner {
  background-color: #4f7cff;
  border-color: #4f7cff;
}
</style>
