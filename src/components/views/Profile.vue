<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- 左侧主要内容区 -->
      <div class="main-section">
        <!-- 用户信息卡片 -->
        <div class="user-card">
          <!-- 卡片头部背景 -->
          <div class="card-header-bg"></div>

          <!-- 用户信息内容 -->
          <div class="user-info-content">
            <!-- 头像区域 -->
            <div class="avatar-section">
              <div class="avatar-wrapper">
                <div class="user-avatar">
                  <i class="el-icon-user-solid"></i>
                </div>
                <div class="camera-icon" v-if="isEditing">
                  <i class="el-icon-camera"></i>
                </div>
              </div>
              <div class="user-basic">
                <h2 class="user-name">张三</h2>
                <p class="user-account">@admin</p>
              </div>
            </div>

            <!-- 编辑/保存按钮 -->
            <div class="action-buttons">
              <template v-if="!isEditing">
                <el-button
                  type="primary"
                  size="small"
                  icon="el-icon-edit"
                  @click="startEdit"
                >
                  编辑信息
                </el-button>
                <el-button
                  size="small"
                  icon="el-icon-lock"
                  @click="showChangePassword"
                >
                  修改密码
                </el-button>
              </template>
              <template v-else>
                <el-button
                  type="success"
                  size="small"
                  icon="el-icon-check"
                  @click="saveProfile"
                >
                  保存
                </el-button>
                <el-button
                  size="small"
                  icon="el-icon-close"
                  @click="cancelEdit"
                >
                  取消
                </el-button>
              </template>
            </div>
          </div>

          <!-- 用户信息表单 -->
          <div class="user-form">
            <el-form
              ref="profileForm"
              :model="profileForm"
              label-position="top"
            >
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="真实姓名">
                    <el-input
                      v-model="profileForm.realName"
                      :disabled="!isEditing"
                      placeholder="请输入真实姓名"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="账号">
                    <el-input v-model="profileForm.account" disabled />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="邮箱">
                    <el-input
                      v-model="profileForm.email"
                      :disabled="!isEditing"
                      placeholder="请输入邮箱"
                    >
                      <i slot="prefix" class="el-icon-message"></i>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="手机号">
                    <el-input
                      v-model="profileForm.phone"
                      :disabled="!isEditing"
                      placeholder="请输入手机号"
                    >
                      <i slot="prefix" class="el-icon-mobile-phone"></i>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="所属部门">
                    <div class="info-text">{{ profileForm.department }}</div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="角色">
                    <el-tag size="small" type="primary" effect="plain">{{
                      profileForm.role
                    }}</el-tag>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="创建时间">
                    <div class="info-text">
                      <i class="el-icon-date"></i>
                      {{ profileForm.createTime }}
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="最后登录">
                    <div class="info-text">
                      <i class="el-icon-time"></i>
                      {{ profileForm.lastLoginTime }}
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </div>

        <!-- 最近活动 -->
        <div class="activity-section">
          <h3 class="section-title">最近活动</h3>
          <div class="activity-list">
            <div
              v-for="(activity, index) in activities"
              :key="index"
              class="activity-item"
            >
              <div class="activity-status" :class="activity.status">
                <i :class="activity.icon"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
              <div class="activity-result">
                <i
                  v-if="activity.success"
                  class="el-icon-check success-icon"
                ></i>
                <i v-else class="el-icon-close fail-icon"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧统计卡片 -->
      <div class="stats-section">
        <div class="stat-card blue">
          <div class="stat-icon">
            <i class="el-icon-data-line"></i>
          </div>
          <div class="stat-number">328</div>
          <div class="stat-label">登录次数</div>
        </div>

        <div class="stat-card green">
          <div class="stat-icon">
            <i class="el-icon-time"></i>
          </div>
          <div class="stat-number">1,245</div>
          <div class="stat-label">操作次数</div>
        </div>

        <div class="stat-card purple">
          <div class="stat-icon">
            <i class="el-icon-date"></i>
          </div>
          <div class="stat-number">156</div>
          <div class="stat-label">创建排课</div>
        </div>

        <div class="stat-card orange">
          <div class="stat-icon">
            <i class="el-icon-collection-tag"></i>
          </div>
          <div class="stat-title">全部</div>
          <div class="stat-label">系统权限</div>
        </div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <change-password-dialog
      :visible.sync="changePasswordVisible"
      @success="handlePasswordChanged"
    />
  </div>
</template>

<script>
import ChangePasswordDialog from "./dialog/ChangePasswordDialog.vue";

export default {
  name: "Profile",
  components: {
    ChangePasswordDialog,
  },
  data() {
    return {
      isEditing: false,
      changePasswordVisible: false,
      profileForm: {
        realName: "张三",
        account: "admin",
        email: "admin@xingtuxinke.com",
        phone: "138****8888",
        department: "教务处",
        role: "超级管理员",
        createTime: "2024-01-15",
        lastLoginTime: "2026-04-14 10:30:25",
      },
      originalForm: {},
      activities: [
        {
          title: "登录系统",
          time: "2026-04-14 10:30",
          status: "success",
          icon: "el-icon-user",
          success: true,
        },
        {
          title: "修改课程排课",
          time: "2026-04-14 09:15",
          status: "success",
          icon: "el-icon-date",
          success: true,
        },
        {
          title: "导出设备统计报表",
          time: "2026-04-13 16:45",
          status: "success",
          icon: "el-icon-document",
          success: true,
        },
        {
          title: "新增学生信息",
          time: "2026-04-13 14:20",
          status: "success",
          icon: "el-icon-plus",
          success: true,
        },
        {
          title: "修改系统配置",
          time: "2026-04-12 11:10",
          status: "warning",
          icon: "el-icon-setting",
          success: false,
        },
      ],
    };
  },
  created() {
    // 获取用户信息
    const storedUserInfo = sessionStorage.getItem("userInfo");
    if (storedUserInfo) {
      const userInfo = JSON.parse(storedUserInfo);
      this.profileForm.realName = userInfo.realName || "张三";
      this.profileForm.account = userInfo.username || "admin";
      this.profileForm.email = userInfo.email || "admin@xingtuxinke.com";
      this.profileForm.phone = userInfo.phone || "138****8888";
      this.profileForm.role = userInfo.role || "超级管理员";
    }
  },
  methods: {
    startEdit() {
      this.originalForm = { ...this.profileForm };
      this.isEditing = true;
    },
    cancelEdit() {
      this.profileForm = { ...this.originalForm };
      this.isEditing = false;
    },
    saveProfile() {
      this.$refs.profileForm.validate((valid) => {
        if (valid) {
          // 模拟保存操作
          this.$message.success("保存成功");
          this.isEditing = false;

          // 更新本地存储的用户信息
          const userInfo = JSON.parse(
            sessionStorage.getItem("userInfo") || "{}"
          );
          userInfo.realName = this.profileForm.realName;
          userInfo.email = this.profileForm.email;
          userInfo.phone = this.profileForm.phone;
          sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
        }
      });
    },
    showChangePassword() {
      this.changePasswordVisible = true;
    },
    handlePasswordChanged() {
      this.$message.success("密码修改成功，请重新登录");
      // 可选：执行退出登录操作
    },
  },
};
</script>

<style lang="scss" scoped>
.profile-page {
  .profile-container {
    display: flex;
    gap: 20px;

    .main-section {
      flex: 1;
      min-width: 0;

      .user-card {
        background: #fff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        margin-bottom: 20px;

        .card-header-bg {
          height: 100px;
          background: linear-gradient(135deg, #4f7cff 0%, #6b8cff 100%);
        }

        .user-info-content {
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-top: -40px;
          margin-bottom: 20px;

          .avatar-section {
            display: flex;
            align-items: flex-end;
            gap: 16px;

            .avatar-wrapper {
              position: relative;

              .user-avatar {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 4px solid #fff;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

                i {
                  font-size: 40px;
                  color: #c0c4cc;
                }
              }

              .camera-icon {
                position: absolute;
                bottom: 0;
                right: 0;
                width: 28px;
                height: 28px;
                background: #4f7cff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid #fff;
                cursor: pointer;

                i {
                  font-size: 12px;
                  color: #fff;
                }
              }
            }

            .user-basic {
              padding-bottom: 8px;

              .user-name {
                font-size: 20px;
                font-weight: 600;
                color: #303133;
                margin: 0 0 4px;
              }

              .user-account {
                font-size: 13px;
                color: #909399;
                margin: 0;
              }
            }
          }

          .action-buttons {
            display: flex;
            gap: 8px;
            padding-top: 48px;
          }
        }

        .user-form {
          padding: 0 24px 24px;

          ::v-deep .el-form {
            .el-form-item {
              margin-bottom: 16px;

              &__label {
                font-size: 13px;
                color: #606266;
                padding-bottom: 4px;
                line-height: 1.4;
              }
            }

            .el-input {
              &__inner {
                height: 36px;
                border-radius: 6px;
              }

              &.is-disabled {
                .el-input__inner {
                  background: #f5f7fa;
                  color: #909399;
                }
              }
            }

            .info-text {
              font-size: 14px;
              color: #303133;
              height: 36px;
              line-height: 36px;
              background: #f5f7fa;
              padding: 0 12px;
              border-radius: 6px;

              i {
                margin-right: 6px;
                color: #909399;
              }
            }

            .el-tag {
              height: 28px;
              line-height: 26px;
              padding: 0 10px;
              font-size: 12px;
            }
          }
        }
      }

      /* 最近活动 */
      .activity-section {
        background: #fff;
        border-radius: 12px;
        padding: 20px 24px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin: 0 0 16px;
        }

        .activity-list {
          .activity-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid #ebeef5;

            &:last-child {
              border-bottom: none;
            }

            .activity-status {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;

              &.success {
                background: #f0f9ff;

                i {
                  color: #67c23a;
                }
              }

              &.warning {
                background: #fdf6ec;

                i {
                  color: #e6a23c;
                }
              }

              i {
                font-size: 14px;
              }
            }

            .activity-content {
              flex: 1;
              min-width: 0;

              .activity-title {
                font-size: 14px;
                color: #303133;
                margin-bottom: 4px;
              }

              .activity-time {
                font-size: 12px;
                color: #909399;
              }
            }

            .activity-result {
              flex-shrink: 0;

              .success-icon {
                color: #67c23a;
                font-size: 16px;
                font-weight: bold;
              }

              .fail-icon {
                color: #e6a23c;
                font-size: 16px;
                font-weight: bold;
              }
            }
          }
        }
      }
    }

    /* 右侧统计卡片 */
    .stats-section {
      width: 280px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;

      .stat-card {
        background: #fff;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;

          i {
            font-size: 24px;
          }
        }

        .stat-number {
          font-size: 28px;
          font-weight: 700;
          color: #303133;
          margin-bottom: 4px;
        }

        .stat-title {
          font-size: 20px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 13px;
          color: #909399;
        }

        &.blue {
          .stat-icon {
            background: #ecf5ff;

            i {
              color: #409eff;
            }
          }
        }

        &.green {
          .stat-icon {
            background: #f0f9ff;

            i {
              color: #67c23a;
            }
          }
        }

        &.purple {
          .stat-icon {
            background: #f5f0ff;

            i {
              color: #9254de;
            }
          }
        }

        &.orange {
          .stat-icon {
            background: #fff7e6;

            i {
              color: #fa8c16;
            }
          }
        }
      }
    }
  }
}
</style>

<script>
import ChangePasswordDialog from "./dialog/ChangePasswordDialog.vue";

export default {
  name: "Profile",
  components: {
    ChangePasswordDialog,
  },
  data() {
    return {
      isEditing: false,
      changePasswordVisible: false,
      profileForm: {
        realName: "张三",
        account: "admin",
        email: "admin@xingtuxinke.com",
        phone: "138****8888",
        department: "教务处",
        role: "超级管理员",
        createTime: "2024-01-15",
        lastLoginTime: "2026-04-14 10:30:25",
      },
      originalForm: {},
      activities: [
        {
          title: "登录系统",
          time: "2026-04-14 10:30",
          status: "success",
          icon: "el-icon-user",
          success: true,
        },
        {
          title: "修改课程排课",
          time: "2026-04-14 09:15",
          status: "success",
          icon: "el-icon-date",
          success: true,
        },
        {
          title: "导出设备统计报表",
          time: "2026-04-13 16:45",
          status: "success",
          icon: "el-icon-document",
          success: true,
        },
        {
          title: "新增学生信息",
          time: "2026-04-13 14:20",
          status: "success",
          icon: "el-icon-plus",
          success: true,
        },
        {
          title: "修改系统配置",
          time: "2026-04-12 11:10",
          status: "warning",
          icon: "el-icon-setting",
          success: false,
        },
      ],
    };
  },
  created() {
    // 获取用户信息
    const storedUserInfo = sessionStorage.getItem("userInfo");
    if (storedUserInfo) {
      const userInfo = JSON.parse(storedUserInfo);
      this.profileForm.realName = userInfo.realName || "张三";
      this.profileForm.account = userInfo.username || "admin";
      this.profileForm.email = userInfo.email || "admin@xingtuxinke.com";
      this.profileForm.phone = userInfo.phone || "138****8888";
      this.profileForm.role = userInfo.role || "超级管理员";
    }
  },
  methods: {
    startEdit() {
      this.originalForm = { ...this.profileForm };
      this.isEditing = true;
    },
    cancelEdit() {
      this.profileForm = { ...this.originalForm };
      this.isEditing = false;
    },
    saveProfile() {
      // 表单验证
      if (!this.profileForm.realName) {
        this.$message.warning("请输入真实姓名");
        return;
      }
      if (!this.profileForm.email) {
        this.$message.warning("请输入邮箱");
        return;
      }
      if (!this.profileForm.phone) {
        this.$message.warning("请输入手机号");
        return;
      }

      // 模拟保存操作
      this.$message.success("保存成功");
      this.isEditing = false;

      // 更新本地存储的用户信息
      const userInfo = JSON.parse(sessionStorage.getItem("userInfo") || "{}");
      userInfo.realName = this.profileForm.realName;
      userInfo.email = this.profileForm.email;
      userInfo.phone = this.profileForm.phone;
      sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
    },
    showChangePassword() {
      this.changePasswordVisible = true;
    },
    handlePasswordChanged() {
      // 密码修改成功后的处理
      this.$message.success("密码修改成功");
    },
  },
};
</script>

<style lang="scss" scoped>
.profile-page {
  .profile-container {
    display: flex;
    gap: 20px;

    .main-section {
      flex: 1;
      min-width: 0;

      .user-card {
        background: #fff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        margin-bottom: 20px;

        .card-header-bg {
          height: 100px;
          background: linear-gradient(135deg, #4f7cff 0%, #6b8cff 100%);
        }

        .user-info-content {
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-top: -40px;
          margin-bottom: 20px;

          .avatar-section {
            display: flex;
            align-items: flex-end;
            gap: 16px;

            .avatar-wrapper {
              position: relative;

              .user-avatar {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 4px solid #fff;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

                i {
                  font-size: 40px;
                  color: #c0c4cc;
                }
              }

              .camera-icon {
                position: absolute;
                bottom: 0;
                right: 0;
                width: 28px;
                height: 28px;
                background: #4f7cff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid #fff;
                cursor: pointer;

                i {
                  font-size: 12px;
                  color: #fff;
                }
              }
            }

            .user-basic {
              padding-bottom: 8px;

              .user-name {
                font-size: 20px;
                font-weight: 600;
                color: #303133;
                margin: 0 0 4px;
              }

              .user-account {
                font-size: 13px;
                color: #909399;
                margin: 0;
              }
            }
          }

          .action-buttons {
            display: flex;
            gap: 8px;
            padding-top: 48px;
          }
        }

        .user-form {
          padding: 0 24px 24px;

          ::v-deep .el-form {
            .el-form-item {
              margin-bottom: 16px;

              &__label {
                font-size: 13px;
                color: #606266;
                padding-bottom: 4px;
                line-height: 1.4;
              }
            }

            .el-input {
              &__inner {
                height: 36px;
                border-radius: 6px;
              }

              &.is-disabled {
                .el-input__inner {
                  background: #f5f7fa;
                  color: #909399;
                }
              }
            }

            .info-text {
              font-size: 14px;
              color: #303133;
              height: 36px;
              line-height: 36px;
              background: #f5f7fa;
              padding: 0 12px;
              border-radius: 6px;

              i {
                margin-right: 6px;
                color: #909399;
              }
            }

            .el-tag {
              height: 28px;
              line-height: 26px;
              padding: 0 10px;
              font-size: 12px;
            }
          }
        }
      }

      /* 最近活动 */
      .activity-section {
        background: #fff;
        border-radius: 12px;
        padding: 20px 24px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin: 0 0 16px;
        }

        .activity-list {
          .activity-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid #ebeef5;

            &:last-child {
              border-bottom: none;
            }

            .activity-status {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;

              &.success {
                background: #f0f9ff;

                i {
                  color: #67c23a;
                }
              }

              &.warning {
                background: #fdf6ec;

                i {
                  color: #e6a23c;
                }
              }

              i {
                font-size: 14px;
              }
            }

            .activity-content {
              flex: 1;
              min-width: 0;

              .activity-title {
                font-size: 14px;
                color: #303133;
                margin-bottom: 4px;
              }

              .activity-time {
                font-size: 12px;
                color: #909399;
              }
            }

            .activity-result {
              flex-shrink: 0;

              .success-icon {
                color: #67c23a;
                font-size: 16px;
                font-weight: bold;
              }

              .fail-icon {
                color: #e6a23c;
                font-size: 16px;
                font-weight: bold;
              }
            }
          }
        }
      }
    }

    /* 右侧统计卡片 */
    .stats-section {
      width: 280px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;

      .stat-card {
        background: #fff;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;

          i {
            font-size: 24px;
          }
        }

        .stat-number {
          font-size: 28px;
          font-weight: 700;
          color: #303133;
          margin-bottom: 4px;
        }

        .stat-title {
          font-size: 20px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 13px;
          color: #909399;
        }

        &.blue {
          .stat-icon {
            background: #ecf5ff;

            i {
              color: #409eff;
            }
          }
        }

        &.green {
          .stat-icon {
            background: #f0f9ff;

            i {
              color: #67c23a;
            }
          }
        }

        &.purple {
          .stat-icon {
            background: #f5f0ff;

            i {
              color: #9254de;
            }
          }
        }

        &.orange {
          .stat-icon {
            background: #fff7e6;

            i {
              color: #fa8c16;
            }
          }
        }
      }
    }
  }
}
</style>
