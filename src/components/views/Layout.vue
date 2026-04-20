<template>
  <div class="layout">
    <!-- 左侧菜单栏 -->
    <div class="sidebar" :class="{ collapsed: isCollapsed }">
      <!-- Logo区域 -->
      <div class="logo">
        <div class="logo-icon">
          <span>兴</span>
        </div>
        <span v-if="!isCollapsed" class="logo-text">智慧教育云平台</span>
      </div>

      <!-- 菜单 -->
      <div class="menu-container">
        <div v-for="item in menuItems" :key="item.path" class="menu-wrapper">
          <!-- 一级菜单 -->
          <div
            :class="[
              'menu-item',
              'level-1',
              {
                active: isActive(item.path),
                expanded: item.expanded && !isCollapsed,
                'has-children': item.children && item.children.length > 0,
              },
            ]"
            @click="handleMenuClick(item)"
          >
            <i :class="item.icon"></i>
            <span v-if="!isCollapsed" class="menu-title">{{ item.title }}</span>
            <i
              v-if="item.children && item.children.length > 0 && !isCollapsed"
              class="el-icon-arrow-down expand-icon"
            ></i>
          </div>

          <!-- 二级菜单 -->
          <div v-if="item.children && item.children.length > 0 && item.expanded && !isCollapsed" class="submenu">
            <div
              v-for="subItem in item.children"
              :key="subItem.path"
              :class="['menu-item', 'level-2', { active: isActive(subItem.path) }]"
              @click="navigateTo(subItem.path)"
            >
              <span class="menu-title">{{ subItem.title }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部折叠按钮 -->
      <div class="bottom-menu">
        <div class="menu-item collapse-btn" @click="toggleCollapse">
          <i :class="isCollapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
          <span v-if="!isCollapsed" class="menu-title">收起菜单</span>
        </div>
      </div>
    </div>

    <!-- 右侧内容区域 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <div class="navbar">
        <!-- 搜索框 -->
        <div class="search-box">
          <i class="el-icon-search"></i>
          <input type="text" placeholder="搜索..." />
        </div>

        <!-- 右侧工具栏 -->
        <div class="toolbar">
          <!-- 消息通知 -->
          <div class="toolbar-item">
            <el-badge :value="3" class="badge-item">
              <i class="el-icon-bell"></i>
            </el-badge>
          </div>

          <!-- 用户下拉菜单 -->
          <div class="toolbar-item user-dropdown">
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="user-info">
                <div class="user-avatar">
                  <i class="el-icon-user-solid"></i>
                </div>
                <span class="username">{{ userInfo.username || 'admin' }}</span>
                <i class="el-icon-arrow-down"></i>
              </div>
              <el-dropdown-menu slot="dropdown" class="user-dropdown-menu">
                <div class="dropdown-header">
                  <div class="dropdown-avatar">
                    <i class="el-icon-user-solid"></i>
                  </div>
                  <div class="dropdown-user-info">
                    <div class="dropdown-username">
                      {{ userInfo.username || 'admin' }}
                    </div>
                    <div class="dropdown-role">
                      {{ userInfo.role || '超级管理员' }}
                    </div>
                  </div>
                </div>
                <el-dropdown-item divided command="profile">
                  <i class="el-icon-user"></i>
                  <span>个人中心</span>
                </el-dropdown-item>
                <el-dropdown-item command="logout">
                  <i class="el-icon-switch-button" style="color: #f56c6c"></i>
                  <span style="color: #f56c6c">退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </div>

      <!-- 面包屑导航 -->
      <!-- <div class="breadcrumb">
        <span
          v-for="(item, index) in breadcrumbs"
          :key="index"
          :class="{ active: index === breadcrumbs.length - 1 }"
        >
          {{ item }}
          <span v-if="index < breadcrumbs.length - 1" class="separator">/</span>
        </span>
      </div> -->

      <!-- 主要内容区域 -->
      <div class="main-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
  import auth from '@/api/auth';
  export default {
    name: 'Layout',
    data() {
      return {
        isCollapsed: false,
        breadcrumbs: ['首页'],
        userInfo: {
          username: 'admin',
          role: '超级管理员',
          avatar: '',
        },
        menuItems: [
          { path: '/', icon: 'el-icon-s-home', title: '首页', expanded: false },
          {
            path: '/schedule',
            icon: 'el-icon-date',
            title: '课程排课',
            expanded: true,
            children: [
              { path: '/schedule-management', title: '排课管理' },
              { path: '/schedule-view', title: '课表视图' },
              { path: '/schedule-calendar', title: '排课日历' },
            ],
          },
          {
            path: '/devices',
            icon: 'el-icon-monitor',
            title: '设备管理',
            expanded: true,
            children: [{ path: '/devices-list', title: '设备列表' }],
          },
          {
            path: '/Information',
            icon: 'el-icon-office-building',
            title: '基础信息管理',
            expanded: true,
            children: [
              { path: '/Information-base-info', title: '组织架构' },
              { path: '/Information-subject-management', title: '学科管理' },
              { path: '/Information-subject-grades', title: '年级管理' },
              { path: '/Information-subject-classes', title: '班级管理' },
              { path: '/Information-subject-personnel', title: '人员管理' },
              { path: '/Information-class-period', title: '课时管理' },
              { path: '/Information-subject-course', title: '课程管理' },
            ],
          },

          {
            path: '/system',
            icon: 'el-icon-setting',
            title: '系统管理',
            expanded: false,
            children: [
              { path: '/system/account', title: '账号管理' },
              { path: '/system/role', title: '角色权限' },
              { path: '/system/config', title: '系统配置' },
              { path: '/system/log', title: '操作日志' },
            ],
          },
          {
            path: '/statistics',
            icon: 'el-icon-s-data',
            title: '数据统计看板',
            expanded: false,
          },
        ],
      };
    },
    created() {
      // 获取用户信息
      // const storedUserInfo = sessionStorage.getItem("userInfo");
      // if (storedUserInfo) {
      //   this.userInfo = JSON.parse(storedUserInfo);
      // }
      this.updateBreadcrumbs();
      this.initMenuExpanded();
    },
    watch: {
      $route() {
        this.updateBreadcrumbs();
      },
    },
    methods: {
      // 初始化菜单展开状态
      initMenuExpanded() {
        const currentPath = this.$route.path;
        this.menuItems.forEach(item => {
          if (item.children && item.children.length > 0) {
            // 如果当前路由在该菜单下，展开该菜单
            if (currentPath.startsWith(item.path) || item.children.some(child => currentPath.startsWith(child.path))) {
              item.expanded = true;
            }
          }
        });
      },
      // 判断菜单是否激活
      isActive(path) {
        if (path === '/') {
          return this.$route.path === '/';
        }
        return this.$route.path.startsWith(path);
      },
      // 处理菜单点击
      handleMenuClick(item) {
        if (item.children && item.children.length > 0) {
          // 有子菜单，切换展开状态
          item.expanded = !item.expanded;
        } else {
          // 没有子菜单，直接跳转
          this.navigateTo(item.path);
        }
      },
      // 导航到指定路径
      navigateTo(path) {
        if (this.$route.path !== path) {
          console.log('path//', path);

          this.$router.push(path);
        }
      },
      // 切换侧边栏折叠状态
      toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
      },
      // 更新面包屑导航
      updateBreadcrumbs() {
        const routeMap = {
          '/': '首页',
          '/schedule-management': '排课管理',
          '/schedule-view': '课表视图',
          '/schedule-calendar': '排课日历',
          '/devices': '设备管理',
          '/organizational-structure': '组织架构',
          '/class-period': '课时管理',
          '/subject-management': '学科管理',
          '/statistics': '数据统计看板',
          '/account-management': '账号管理',
          '/role-permission': '角色权限',
          '/system-config': '系统配置',
          '/operation-log': '操作日志',
          '/profile': '个人中心',
        };

        const paths = this.$route.path.split('/').filter(Boolean);
        const breadcrumbs = [];

        if (paths.length === 0) {
          breadcrumbs.push(routeMap['/']);
        } else {
          let currentPath = '';
          paths.forEach(path => {
            currentPath += '/' + path;
            if (routeMap[currentPath]) {
              breadcrumbs.push(routeMap[currentPath]);
            }
          });
        }

        this.breadcrumbs = breadcrumbs;
      },
      // 处理下拉菜单命令
      handleCommand(command) {
        switch (command) {
          case 'profile':
            this.$router.push('/profile');
            break;
          case 'logout':
            this.handleLogout();
            break;
        }
      },
      // 处理退出登录
      handleLogout() {
        this.$confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(async () => {
            let res = await auth.logout();
            if (res.code == 200) {
              // 清除登录信息
              sessionStorage.removeItem('accessToken');
              sessionStorage.removeItem('refreshToken');

              this.$message.success('已退出登录');
              this.$router.push('/login');
            }
          })
          .catch(() => {});
      },
    },
  };
</script>

<style lang="scss" scoped>
  .layout {
    display: flex;
    height: 100vh;
    background: #f5f7fa;
  }

  /* 侧边栏 */
  .sidebar {
    width: 220px;
    background: linear-gradient(180deg, #1a237e 0%, #283593 100%);
    display: flex;
    flex-direction: column;
    padding: 16px 0;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    transition: width 0.3s;
    flex-shrink: 0;

    &.collapsed {
      width: 64px;

      .logo {
        justify-content: center;
        padding: 0;

        .logo-text {
          display: none;
        }
      }

      .menu-container {
        padding: 0 8px;

        .menu-wrapper {
          .menu-item {
            &.level-1 {
              width: 48px;
              padding: 0;
              justify-content: center;

              .menu-title,
              .expand-icon {
                display: none;
              }
            }
          }

          .submenu {
            display: none;
          }
        }
      }

      .bottom-menu {
        padding: 16px 8px 0;

        .menu-item {
          width: 48px;
          padding: 0;
          justify-content: center;

          .menu-title {
            display: none;
          }
        }
      }
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 0 16px;
      margin-bottom: 24px;
      gap: 12px;

      .logo-icon {
        width: 40px;
        height: 40px;
        background: #fff;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        flex-shrink: 0;

        span {
          font-size: 20px;
          font-weight: bold;
          color: #4f7cff;
        }
      }

      .logo-text {
        font-size: 14px;
        font-weight: 600;
        color: #fff;
        white-space: nowrap;
      }
    }

    .menu-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      width: 100%;
      padding: 0 12px;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
      }

      .menu-wrapper {
        display: flex;
        flex-direction: column;

        .menu-item {
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s;
          color: rgba(255, 255, 255, 0.7);

          &:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
          }

          &.active {
            background: #4f7cff;
            color: #fff;
          }

          &.level-1 {
            width: 100%;
            height: 44px;
            padding: 0 12px;
            border-radius: 8px;
            gap: 10px;
            position: relative;

            i {
              font-size: 18px;
              width: 20px;
              text-align: center;
              flex-shrink: 0;
            }

            .menu-title {
              font-size: 14px;
              white-space: nowrap;
              flex: 1;
            }

            .expand-icon {
              font-size: 12px;
              transition: transform 0.3s;
              width: auto;
              margin-left: auto;
            }

            &.expanded {
              .expand-icon {
                transform: rotate(180deg);
              }
            }

            &.has-children {
              // padding-right: 32px;
            }
          }
        }

        .submenu {
          display: flex;
          flex-direction: column;
          padding-left: 32px;
          animation: slideDown 0.3s ease;

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .menu-item {
            &.level-2 {
              height: 40px;
              padding: 0 12px;
              border-radius: 6px;
              margin-top: 2px;

              .menu-title {
                font-size: 14px;
                white-space: nowrap;
              }

              &:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
              }

              &.active {
                background: #4f7cff;
                color: #fff;
              }
            }
          }
        }
      }
    }

    .bottom-menu {
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      width: 100%;
      padding: 16px 12px 0;

      .menu-item {
        width: 100%;
        height: 44px;
        display: flex;
        align-items: center;
        padding: 0 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        color: rgba(255, 255, 255, 0.7);
        gap: 10px;

        i {
          font-size: 18px;
          width: 20px;
          text-align: center;
          flex-shrink: 0;
        }

        .menu-title {
          font-size: 14px;
          white-space: nowrap;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
      }
    }
  }

  /* 主内容区 */
  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .navbar {
      height: 64px;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

      .search-box {
        display: flex;
        align-items: center;
        background: #f5f7fa;
        border-radius: 8px;
        padding: 8px 16px;
        width: 240px;

        i {
          color: #909399;
          margin-right: 8px;
        }

        input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 14px;
          width: 100%;

          &::placeholder {
            color: #c0c4cc;
          }
        }
      }

      .toolbar {
        display: flex;
        align-items: center;
        gap: 8px;

        .toolbar-item {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            background: #f5f7fa;
          }

          i {
            font-size: 20px;
            color: #606266;
          }

          .badge-item {
            ::v-deep .el-badge__content {
              top: -4px;
              right: -4px;
              height: 16px;
              line-height: 16px;
              padding: 0 5px;
              font-size: 11px;
              border: none;
            }
          }

          &.user-dropdown {
            width: auto;
            padding: 0 8px;

            &:hover {
              background: #f5f7fa;
            }

            .user-info {
              display: flex;
              align-items: center;
              gap: 8px;

              .user-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: linear-gradient(135deg, #4f7cff 0%, #6b8cff 100%);
                display: flex;
                align-items: center;
                justify-content: center;

                i {
                  font-size: 18px;
                  color: #fff;
                }
              }

              .username {
                font-size: 14px;
                color: #303133;
                font-weight: 500;
              }

              .el-icon-arrow-down {
                font-size: 12px;
                color: #909399;
              }
            }
          }
        }
      }
    }

    .breadcrumb {
      height: 48px;
      background: #fff;
      display: flex;
      align-items: center;
      padding: 0 24px;
      border-bottom: 1px solid #ebeef5;
      font-size: 14px;
      color: #606266;

      span {
        &.active {
          color: #4f7cff;
        }

        .separator {
          margin: 0 8px;
          color: #c0c4cc;
        }
      }
    }

    .main-content {
      flex: 1;
      overflow: auto;
      // padding: 20px;
      background: #f5f7fa;
    }
  }

  /* 用户下拉菜单样式 */
  .user-dropdown-menu {
    padding: 8px 0 !important;
    min-width: 200px !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;

    .dropdown-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid #ebeef5;
      margin-bottom: 4px;

      .dropdown-avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: linear-gradient(135deg, #4f7cff 0%, #6b8cff 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        i {
          font-size: 24px;
          color: #fff;
        }
      }

      .dropdown-user-info {
        flex: 1;
        min-width: 0;

        .dropdown-username {
          font-size: 15px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-role {
          font-size: 12px;
          color: #909399;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .el-dropdown-menu__item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      font-size: 14px;
      color: #606266;
      line-height: 1.5;

      i {
        font-size: 16px;
        width: 20px;
        text-align: center;
      }

      &:hover {
        background: #f5f7fa;
        color: #4f7cff;
      }

      &.is-divided {
        margin-top: 4px;
        border-top: 1px solid #ebeef5;
      }
    }
  }
</style>
