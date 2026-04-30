<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- 左侧主要内容区 -->
      <div class="main-section">
        <!-- 用户信息卡片 -->
        <div class="user-card">
          <!-- 卡片头部背景 -->
          <div class="card-header-bg">
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
                <h2 class="user-name">{{ profileForm.realName }}</h2>
                <p class="user-account">@{{ profileForm.username }}</p>
              </div>
            </div>
          </div>

          <!-- 用户信息内容 -->
          <div class="user-info-content">
            <!-- 头像区域 -->
            <!-- <div class="avatar-section">
              <div class="avatar-wrapper">
                <div class="user-avatar">
                  <i class="el-icon-user-solid"></i>
                </div>
                <div class="camera-icon" v-if="isEditing">
                  <i class="el-icon-camera"></i>
                </div>
              </div>
              <div class="user-basic">
                <h2 class="user-name">{{ profileForm.realName }}</h2>
                <p class="user-account">@{{ profileForm.username }}</p>
              </div>
            </div> -->

            <!-- 编辑/保存按钮 -->
            <div class="action-buttons">
              <template v-if="!isEditing">
                <el-button type="primary" size="small" icon="el-icon-edit" @click="startEdit"> 编辑信息 </el-button>
                <el-button size="small" icon="el-icon-lock" @click="showChangePassword"> 修改密码 </el-button>
              </template>
              <template v-else>
                <el-button type="success" size="small" icon="el-icon-check" @click="saveProfile"> 保存 </el-button>
                <el-button size="small" icon="el-icon-close" @click="cancelEdit"> 取消 </el-button>
              </template>
            </div>
          </div>

          <!-- 用户信息表单 -->
          <div class="user-form">
            <el-form ref="profileForm" :model="profileForm" label-position="top">
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="真实姓名">
                    <el-input v-model="profileForm.realName" :disabled="!isEditing" placeholder="请输入真实姓名" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="账号">
                    <el-input v-model="profileForm.username" disabled />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="邮箱">
                    <el-input v-model="profileForm.email" :disabled="!isEditing" placeholder="请输入邮箱">
                      <i slot="prefix" class="el-icon-message"></i>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="手机号">
                    <el-input v-model="profileForm.phone" :disabled="!isEditing" placeholder="请输入手机号">
                      <i slot="prefix" class="el-icon-mobile-phone"></i>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="角色">
                    <el-tag size="small" type="primary" effect="plain">{{ profileForm.roleName }}</el-tag>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="创建时间">
                    <div class="info-text">
                      <i class="el-icon-date"></i>
                      {{ filterTime(profileForm.createdAt) }}
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="最后登录">
                    <div class="info-text">
                      <i class="el-icon-time"></i>
                      {{ filterTime(profileForm.lastLoginAt) }}
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
            <div v-for="(activity, index) in activities" :key="index" class="activity-item">
              <div class="activity-status" :class="activity.status">
                <i :class="activity.icon"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
              <div class="activity-result">
                <i v-if="activity.success" class="el-icon-check success-icon"></i>
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
          <div class="stat-number">{{ stats.loginCount }}</div>
          <div class="stat-label">登录次数</div>
        </div>

        <div class="stat-card green">
          <div class="stat-icon">
            <i class="el-icon-time"></i>
          </div>
          <div class="stat-number">{{ stats.operationCount }}</div>
          <div class="stat-label">操作次数</div>
        </div>

        <div class="stat-card purple">
          <div class="stat-icon">
            <i class="el-icon-date"></i>
          </div>
          <div class="stat-number">{{ stats.scheduleCount }}</div>
          <div class="stat-label">创建排课</div>
        </div>

        <div class="stat-card orange">
          <div class="stat-icon">
            <i class="el-icon-collection-tag"></i>
          </div>
          <div class="stat-title">{{ profileForm.roleRemark || '全部' }}</div>
          <div class="stat-label">系统权限</div>
        </div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <change-password-dialog :visible.sync="changePasswordVisible" @success="handlePasswordChanged" />
  </div>
</template>

<script>
  import ChangePasswordDialog from './dialog/ChangePasswordDialog.vue';
  import userApi from '@/api/user.js';

  export default {
    name: 'Profile',
    components: {
      ChangePasswordDialog,
    },
    data() {
      return {
        isEditing: false,
        changePasswordVisible: false,
        roleId: '',
        profileForm: {
          id: null,
          realName: '',
          username: '',
          email: '',
          phone: '',
          roleName: '',
          roleRemark: '',
          createdAt: '',
          lastLoginAt: '',
        },
        originalForm: {},
        stats: {
          loginCount: 0,
          operationCount: 0,
          scheduleCount: 0,
        },
        activities: [],
      };
    },
    async created() {
      await this.fetchProfileInfo();
    },
    methods: {
      filterTime(v) {
        let arr = v.split('T');
        return `${arr[0]} ${arr[1]}`;
      },
      async fetchProfileInfo() {
        try {
          const res = await userApi.getProfileInfo();
          if (res.data) {
            this.profileForm.id = res.data.id;
            this.profileForm.realName = res.data.realName;
            this.profileForm.username = res.data.username;
            this.profileForm.email = res.data.email;
            this.profileForm.phone = res.data.phone;
            this.profileForm.roleName = res.data.roleName;
            this.profileForm.roleRemark = res.data.roleRemark;
            this.profileForm.createdAt = res.data.createdAt;
            this.profileForm.lastLoginAt = res.data.lastLoginAt;
            this.roleId = res.data.roleId;
            this.stats.loginCount = res.data.loginCount || 0;
            this.stats.operationCount = res.data.operationCount || 0;
            this.stats.scheduleCount = res.data.scheduleCount || 0;

            if (res.data.recentLogs && Array.isArray(res.data.recentLogs)) {
              this.activities = res.data.recentLogs.map(log => ({
                title: log.operationDesc,
                time: this.formatDateTime(log.createdAt),
                status: 'success',
                icon: 'el-icon-edit',
                success: true,
              }));
            }
          }
        } catch (error) {
          console.error('获取个人信息失败:', error);
          this.$message.error('获取个人信息失败');
        }
      },
      formatDateTime(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hour}:${minute}`;
      },
      startEdit() {
        this.originalForm = { ...this.profileForm };
        this.isEditing = true;
      },
      cancelEdit() {
        this.profileForm = { ...this.originalForm };
        this.isEditing = false;
      },
      async saveProfile() {
        if (!this.profileForm.realName) {
          this.$message.warning('请输入真实姓名');
          return;
        }
        if (!this.profileForm.email) {
          this.$message.warning('请输入邮箱');
          return;
        }
        if (!this.profileForm.phone) {
          this.$message.warning('请输入手机号');
          return;
        }

        try {
          const updateData = {
            username: this.profileForm.username,
            realName: this.profileForm.realName,
            email: this.profileForm.email,
            phone: this.profileForm.phone,
            roleId: this.roleId,
          };
          await userApi.update(this.profileForm.id, updateData);
          this.$message.success('保存成功');
          this.isEditing = false;

          await this.fetchProfileInfo();
        } catch (error) {
          console.error('保存个人信息失败:', error);
          this.$message.error('保存失败');
        }
      },
      showChangePassword() {
        this.changePasswordVisible = true;
      },
      handlePasswordChanged() {
        this.$message.success('密码修改成功，请重新登录');
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
            display: flex;
            align-items: center;
            padding-left: 10px;
            height: 100px;
            background: linear-gradient(135deg, #4f7cff 0%, #6b8cff 100%);
          }

          .user-info-content {
            padding: 0 24px;
            display: flex;
            justify-content: end;
            // justify-content: space-between;
            align-items: flex-start;
            margin-top: -40px;
            margin-bottom: 20px;

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
        color: #fff;
        // color: #909399;
        margin: 0;
      }
    }
  }
</style>
