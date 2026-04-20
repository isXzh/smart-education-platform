<template>
  <div class="login-page">
    <div class="login-box">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <div class="logo-icon">
          <span class="logo-text">兴</span>
        </div>
        <h1 class="main-title">兴图新科智慧教育云平台</h1>
        <p class="sub-title">统一教务管理与设备调度系统</p>
      </div>

      <!-- 登录表单 -->
      <div class="form-section">
        <el-form ref="loginForm" :model="loginForm" :rules="loginRules">
          <el-form-item prop="username">
            <div class="input-label">用户名</div>
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="el-icon-user"
              @keyup.enter.native="handleLogin"
            />
          </el-form-item>

          <el-form-item prop="password">
            <div class="input-label">密码</div>
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              show-password
              @keyup.enter.native="handleLogin"
            />
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-button type="text" class="forgot-link" @click="handleForgotPassword"> 忘记密码？ </el-button>
          </div>

          <el-form-item>
            <el-button :loading="loading" type="primary" class="login-btn" @click.native.prevent="handleLogin">
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 测试账号提示 -->
        <!-- <div class="test-account">
          <span class="test-label">测试账号：</span>
          <span class="test-info">admin / admin123</span>
        </div> -->
      </div>
    </div>

    <!-- 底部版权 -->
    <div class="footer">
      <p>© 2024 兴图新科. All rights reserved.</p>
    </div>
  </div>
</template>

<script>
  import auth from '@/api/auth';

  export default {
    name: 'Login',
    data() {
      return {
        loginForm: {
          username: '',
          password: '',
        },
        loginRules: {
          username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, message: '密码长度至少6位', trigger: 'blur' },
          ],
        },
        rememberMe: false,
        loading: false,
        redirect: undefined,
      };
    },
    watch: {
      $route: {
        handler: function (route) {
          this.redirect = route.query && route.query.redirect;
        },
        immediate: true,
      },
    },
    mounted() {
      // 检查是否有记住的用户名
      const rememberedUser = sessionStorage.getItem('rememberedUser');
      if (rememberedUser) {
        this.loginForm.username = rememberedUser;
        this.rememberMe = true;
      }
    },
    methods: {
      handleLogin() {
        // this.$router.push("/");
        this.$refs.loginForm.validate(valid => {
          if (valid) {
            this.loading = true;
            // console.log(
            //   "==========",
            //   auth.login({
            //     username: this.loginForm.username,
            //     password: this.loginForm.password,
            //   })
            // );

            auth
              .login({
                username: this.loginForm.username,
                password: this.loginForm.password,
                userType: 'admin',
              })
              .then(response => {
                this.loading = false;
                if (response.code == 200) {
                  // 保存token
                  sessionStorage.setItem('accessToken', response.data.accessToken);
                  sessionStorage.setItem('refreshToken', response.data.refreshToken);
                  // sessionStorage.setItem(
                  //   "userInfo",
                  //   JSON.stringify(response.data.user)
                  // );

                  // 记住我功能
                  if (this.rememberMe) {
                    sessionStorage.setItem('rememberedUser', this.loginForm.username);
                  } else {
                    sessionStorage.removeItem('rememberedUser');
                  }

                  this.$message.success('登录成功');
                  this.$router.push({ path: this.redirect || '/' });
                } else {
                  this.$message.error(response.message || '登录失败');
                }
              })
              .catch(error => {
                this.loading = false;
                this.$message.error(error.message || '登录失败');
              });
          }
        });
      },
      handleForgotPassword() {
        this.$message.info('请联系管理员重置密码');
      },
    },
  };
</script>

<style lang="scss" scoped>
  .login-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 20px;

    .login-box {
      width: 100%;
      max-width: 420px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }

    .logo-section {
      text-align: center;
      padding: 40px 30px 20px;
      background: linear-gradient(135deg, #4f7cff 0%, #6b8cff 100%);

      .logo-icon {
        width: 60px;
        height: 60px;
        background: #fff;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

        .logo-text {
          font-size: 28px;
          font-weight: bold;
          color: #4f7cff;
        }
      }

      .main-title {
        font-size: 22px;
        font-weight: 600;
        color: #fff;
        margin: 0 0 8px;
      }

      .sub-title {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        margin: 0;
      }
    }

    .form-section {
      padding: 30px;

      .input-label {
        font-size: 14px;
        color: #333;
        margin-bottom: 8px;
        font-weight: 500;
      }

      ::v-deep .el-input {
        .el-input__inner {
          height: 44px;
          border-radius: 8px;
          border: 1px solid #dcdfe6;
          padding-left: 40px;

          &:focus {
            border-color: #4f7cff;
          }
        }

        .el-input__prefix {
          left: 12px;

          .el-input__icon {
            font-size: 18px;
            color: #909399;
          }
        }
      }

      .form-options {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 20px 0;

        .forgot-link {
          color: #4f7cff;
          font-size: 14px;
          padding: 0;

          &:hover {
            color: #3a6ae8;
          }
        }
      }

      .login-btn {
        width: 100%;
        height: 46px;
        font-size: 16px;
        border-radius: 8px;
        background: linear-gradient(135deg, #4f7cff 0%, #6b8cff 100%);
        border: none;
        font-weight: 500;

        &:hover {
          background: linear-gradient(135deg, #3a6ae8 0%, #5a7aee 100%);
        }
      }

      .test-account {
        text-align: center;
        margin-top: 20px;
        padding: 12px;
        background: #f5f7fa;
        border-radius: 6px;

        .test-label {
          font-size: 13px;
          color: #666;
        }

        .test-info {
          font-size: 13px;
          color: #4f7cff;
          font-weight: 500;
        }
      }
    }

    .footer {
      margin-top: 30px;
      text-align: center;

      p {
        font-size: 13px;
        color: #666;
        margin: 0;
      }
    }
  }

  @media screen and (max-width: 480px) {
    .login-page {
      padding: 15px;

      .login-box {
        max-width: 100%;
      }
    }
  }
</style>
