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
        <span class="text-gray-700">系统配置</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="bg-white rounded-lg shadow-sm content">
      <!-- 头部 -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"
            >
              <i class="el-icon-setting text-blue-600 text-lg"></i>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-800">系统配置</h2>
            </div>
          </div>
          <el-tooltip content="查看帮助文档" placement="top">
            <i
              class="el-icon-question text-gray-400 text-xl cursor-pointer hover:text-blue-500"
            ></i>
          </el-tooltip>
        </div>
      </div>

      <!-- 标签页内容 -->
      <div class="p-6">
        <!-- 自定义标签页 -->
        <div
          class="flex items-center gap-2 mb-8 bg-gray-100 p-1 rounded-lg w-fit"
        >
          <div
            v-for="tab in tabList"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'px-6 py-2 rounded-md text-sm font-medium cursor-pointer transition-all duration-200',
              activeTab === tab.key
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            ]"
          >
            {{ tab.label }}
          </div>
        </div>

        <!-- 通用配置 -->
        <div v-if="activeTab === 'general'" class="space-y-6">
          <div class="grid grid-cols-2 gap-8">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                自动入会提前时间
                <el-tooltip
                  content="设置会议开始前多久自动加入会议"
                  placement="top"
                >
                  <i class="el-icon-question text-gray-400 ml-1"></i>
                </el-tooltip>
              </label>
              <div class="flex items-center gap-2">
                <el-input v-model="config.autoJoinTime" style="width: 120px" />
                <span class="text-gray-500 text-sm">分钟</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                设备状态刷新间隔
              </label>
              <div class="flex items-center gap-2">
                <el-input
                  v-model="config.deviceRefreshInterval"
                  style="width: 120px"
                />
                <span class="text-gray-500 text-sm">秒</span>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-8">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                排课冲突检测
              </label>
              <el-switch
                v-model="config.conflictCheck"
                active-text="已启用"
                inactive-text="已禁用"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                日志保留时间
              </label>
              <div class="flex items-center gap-2">
                <el-input v-model="config.logRetention" style="width: 120px" />
                <span class="text-gray-500 text-sm">个月</span>
              </div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              默认会议服务商
            </label>
            <el-select v-model="config.meetingProvider" style="width: 240px">
              <el-option label="无" value="none" />
              <el-option label="华为云" value="huawei" />
              <el-option label="腾讯云（预留）" value="tencent" />
            </el-select>
          </div>
        </div>

        <!-- 界面与主题 -->
        <div v-if="activeTab === 'theme'" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3"
              >平台名称</label
            >
            <el-input
              v-model="config.platformName"
              style="width: 400px"
              placeholder="请输入平台名称"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3"
              >平台Logo</label
            >
            <div class="flex items-center gap-4">
              <div
                class="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50"
              >
                <i class="el-icon-upload text-2xl text-gray-400"></i>
              </div>
              <div>
                <el-button type="default" size="small" icon="el-icon-upload2"
                  >上传图片</el-button
                >
                <p class="text-xs text-gray-500 mt-2">
                  支持 JPG、PNG 格式，大小不超过 2MB
                </p>
              </div>
            </div>
          </div>
          <!-- <div>
            <label class="block text-sm font-medium text-gray-700 mb-3"
              >主题色</label
            >
            <div class="flex items-center gap-3">
              <el-color-picker v-model="config.themeColor" show-alpha />
              <el-input v-model="config.themeColor" style="width: 120px" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3"
              >预设颜色</label
            >
            <div class="flex items-center gap-3">
              <div
                v-for="color in presetColors"
                :key="color"
                class="w-8 h-8 rounded-lg cursor-pointer border-2 transition-all"
                :style="{
                  backgroundColor: color,
                  borderColor:
                    config.themeColor === color ? color : 'transparent',
                }"
                @click="config.themeColor = color"
              >
                <i
                  v-if="config.themeColor === color"
                  class="el-icon-check text-white text-xs flex items-center justify-center h-full"
                ></i>
              </div>
            </div>
          </div>
          <div class="bg-blue-50 rounded-lg p-4">
            <div class="flex items-start gap-2">
              <i class="el-icon-info text-blue-500 mt-0.5"></i>
              <p class="text-sm text-blue-700">
                修改主题色后，全局导航、按钮、图标等颜色将同步更新。
              </p>
            </div>
          </div> -->
        </div>

        <!-- 数据同步 -->
        <div v-if="activeTab === 'sync'" class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-medium text-gray-800">
                企业通讯录同步
              </h3>
            </div>
            <el-switch v-model="config.enterpriseSync" />
          </div>

          <div
            v-show="config.enterpriseSync"
            class="bg-gray-50 rounded-lg p-6 space-y-6 transition-all"
          >
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >同步周期</label
              >
              <div class="flex items-center gap-2">
                <el-input v-model="config.syncPeriod" style="width: 120px" />
                <span class="text-gray-500 text-sm">小时</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >手动同步</label
              >
              <el-button type="default" icon="el-icon-refresh"
                >立即同步</el-button
              >
            </div>
          </div>

          <div class="bg-blue-50 rounded-lg p-4">
            <div class="flex items-start gap-2">
              <i class="el-icon-info text-blue-500 mt-0.5"></i>
              <p class="text-sm text-blue-700">
                同步教师/学生信息至第三方会议系统通讯录。
              </p>
            </div>
          </div>
        </div>

        <!-- 通知配置 -->
        <div v-if="activeTab === 'notification'" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >上课提醒提前时间</label
            >
            <div class="flex items-center gap-2">
              <el-input v-model="config.reminderTime" style="width: 120px" />
              <span class="text-gray-500 text-sm">分钟</span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3"
              >上课提醒方式</label
            >
            <div class="space-y-3">
              <el-checkbox v-model="config.reminderMethods.internal"
                >站内信</el-checkbox
              >
              <div>
                <el-checkbox v-model="config.reminderMethods.sms" disabled
                  >短信（后续扩展）</el-checkbox
                >
              </div>
              <div>
                <el-checkbox v-model="config.reminderMethods.email" disabled
                  >邮件（后续扩展）</el-checkbox
                >
              </div>
            </div>
          </div>
          <div
            class="flex items-center justify-between pt-4 border-t border-gray-100"
          >
            <div>
              <h3 class="text-base font-medium text-gray-800">互动通知</h3>
              <p class="text-sm text-gray-500 mt-1">
                教师端接收学生举手、辅讲教室请求通知
              </p>
            </div>
            <el-switch v-model="config.interactiveNotification" />
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div
        class="px-6 btm-box py-4 border-t border-gray-100 bg-gray-50 rounded-b-lg"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <el-button type="default" icon="el-icon-upload2"
              >导入配置</el-button
            >
            <el-button type="default" icon="el-icon-download"
              >导出配置</el-button
            >
          </div>
          <div class="flex items-center gap-3">
            <el-button
              type="default"
              icon="el-icon-refresh-right"
              @click="handleReset"
              >重置</el-button
            >
            <el-button
              type="primary"
              icon="el-icon-document-checked"
              @click="handleSave"
              >保存配置</el-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SystemConfig",
  data() {
    return {
      activeTab: "general",
      tabList: [
        { key: "general", label: "通用配置" },
        { key: "theme", label: "界面与主题" },
        { key: "sync", label: "数据同步" },
        { key: "notification", label: "通知配置" },
      ],
      presetColors: [
        "#1E88E5",
        "#26A69A",
        "#66BB6A",
        "#FFA726",
        "#AB47BC",
        "#EF5350",
      ],
      config: {
        // 通用配置
        autoJoinTime: 5,
        deviceRefreshInterval: 30,
        conflictCheck: true,
        logRetention: 12,
        meetingProvider: "none",
        // 界面与主题
        platformName: "兴图新科智慧教育云平台",
        themeColor: "#1E88E5",
        // 数据同步
        enterpriseSync: false,
        syncPeriod: 24,
        // 通知配置
        reminderTime: 10,
        reminderMethods: {
          internal: true,
          sms: false,
          email: false,
        },
        interactiveNotification: true,
      },
    };
  },
  methods: {
    handleSave() {
      this.$message.success("配置保存成功");
    },
    handleReset() {
      this.$confirm("确定要重置所有配置吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.$message.success("配置已重置");
      });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .el-switch.is-checked .el-switch__core {
  border-color: #10b981;
  background-color: #10b981;
}

::v-deep .el-checkbox__input.is-checked + .el-checkbox__label {
  color: #606266;
}

::v-deep .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #409eff;
  border-color: #409eff;
}
.content {
  height: 830px;
  position: relative;
}
.btm-box {
  width: 100%;
  position: absolute;
  bottom: 0;
}
</style>
