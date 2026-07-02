<template>
  <div class="layout">
    <!-- 左侧菜单栏 -->
    <div class="sidebar" :class="{ collapsed: isCollapsed }">
      <!-- Logo区域 -->
      <div class="logo">
        <div class="logo-icon">
          <img v-if="platformLogoUrl" :src="platformLogoUrl" class="platform-logo-img" />
          <span v-else>兴</span>
        </div>
        <div v-if="!isCollapsed" class="logo-info">
          <span class="logo-text" :title="platformName">{{ platformName }}</span>
          <span v-if="platformDescription" class="logo-description">{{ platformDescription }}</span>
        </div>
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
          <div class="toolbar-item notification-wrapper" ref="notificationRef">
            <button type="button" class="notification-trigger" @click.stop="toggleNotificationPanel">
              <i class="el-icon-bell"></i>
              <span v-if="unreadCount > 0" class="notification-badge">
                {{ unreadCount > 99 ? '99+' : unreadCount }}
              </span>
            </button>

            <transition name="notification-panel">
              <div v-if="showNotificationPanel" class="notification-panel" @click.stop>
                <div class="notification-header">
                  <h3>通知消息</h3>
                  <div class="notification-actions">
                    <button
                      v-if="unreadCount > 0"
                      type="button"
                      class="notification-read-all"
                      @click="handleMarkAllRead"
                    >
                      全部已读
                    </button>
                    <button
                      v-if="notifications.length > 0"
                      type="button"
                      class="notification-delete"
                      title="清空通知"
                      @click="handleDeleteAllNotifications"
                    >
                      <i class="el-icon-delete"></i>
                    </button>
                  </div>
                </div>

                <div class="notification-tabs">
                  <button type="button" class="notification-tab active">调课</button>
                </div>

                <div class="notification-list">
                  <div v-if="notifications.length === 0" class="notification-empty">
                    <i class="el-icon-bell"></i>
                    <p>暂无通知</p>
                  </div>
                  <div v-else class="notification-items">
                    <div
                      v-for="item in notifications"
                      :key="item.id"
                      :class="['notification-card', { unread: Number(item.isRead) === 0 }]"
                      @click="handleNotificationClick(item)"
                    >
                      <div class="notification-type-icon">
                        <i class="el-icon-sort"></i>
                      </div>
                      <div class="notification-content">
                        <div class="notification-title-row">
                          <h4 :class="{ unread: Number(item.isRead) === 0 }">{{ item.title }}</h4>
                          <span>{{ formatNotificationTime(item.createTime) }}</span>
                        </div>
                        <p>{{ item.content }}</p>
                        <div v-if="Number(item.isRead) === 0" class="notification-unread">
                          <span></span>
                          <em>未读</em>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="notifications.length > 0" class="notification-footer">
                  <button type="button" @click="goRescheduleApproval">查看调课审批 →</button>
                </div>
              </div>
            </transition>
          </div>

          <!-- 用户下拉菜单 -->
          <div class="toolbar-item user-dropdown">
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="user-info">
                <div class="user-avatar">
                  <i class="el-icon-user-solid"></i>
                </div>
                <span class="username">{{ userInfo.realName || 'admin' }}</span>
                <i class="el-icon-arrow-down"></i>
              </div>
              <el-dropdown-menu slot="dropdown" class="user-dropdown-menu">
                <div class="dropdown-header">
                  <div class="dropdown-avatar">
                    <i class="el-icon-user-solid"></i>
                  </div>
                  <div class="dropdown-user-info">
                    <div class="dropdown-username">
                      {{ userInfo.realName || 'admin' }}
                    </div>
                    <div class="dropdown-role">
                      {{ userInfo.role || '超级管理员' }}
                    </div>
                  </div>
                </div>
                <el-dropdown-item command="profile">
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
  import systemConfig from '@/api/systemConfig';
  import noticeApi from '@/api/notice';
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
        platformName: '智慧教育云平台',
        platformDescription: '',
        platformLogoUrl: '',
        showNotificationPanel: false,
        notificationFilter: 'all',
        notifications: [],
        notificationTimer: null,
        notificationLoading: false,
        notificationQuery: {
          userType: 'admin',
          pageNum: 1,
          pageSize: 20,
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
              { path: '/reschedule-approval', title: '调课审批' },
            ],
          },
          {
            path: '/devices',
            icon: 'el-icon-monitor',
            title: '设备管理',
            expanded: true,
            children: [
              // { path: '/devices-list', title: '设备列表' }
              { path: '/mobile-security-box', title: '移动保障箱' },
            ],
          },
          {
            path: '/cloud-meeting',
            icon: 'el-icon-chat-dot-round',
            title: '云会议管理',
            expanded: true,
            children: [
              { path: '/cloud-meeting-hardware', title: '硬件终端' },
              { path: '/cloud-meeting-software', title: '软件终端' },
            ],
          },
          {
            path: '/resource',
            icon: 'el-icon-office-building',
            title: '资源库管理',
            expanded: true,
            children: [
              // { path: '/resource-personal', title: '个人资源' },
              { path: '/resource-common', title: '公共资源' },
              { path: '/resource-types', title: '类型管理' },
            ],
          },
          {
            path: '/Information',
            icon: 'el-icon-office-building',
            title: '基础信息管理',
            expanded: true,
            children: [
              { path: '/Information-school-management', title: '学校管理' },
              // { path: '/Information-base-info', title: '组织架构' },
              { path: '/Information-subject-management', title: '学科管理' },
              { path: '/Information-subject-grades', title: '年级管理' },
              { path: '/Information-subject-classes', title: '班级管理' },
              { path: '/Information-subject-personnel', title: '人员管理' },
              { path: '/Information-class-period', title: '课时管理' },
              { path: '/Information-subject-course', title: '课程管理' },
              { path: '/resource-tags', title: '标签管理' },
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
      this.updateBreadcrumbs();
      this.initMenuExpanded();
      this.loadPlatformInfo();
      this.userInfo = JSON.parse(sessionStorage.getItem('userInfo')) || this.userInfo;
      this.fetchNotifications();
      this.startNotificationPolling();
      window.addEventListener('platformInfoUpdated', this.handlePlatformInfoUpdated);
    },
    mounted() {
      document.addEventListener('mousedown', this.handleNotificationOutside);
    },
    beforeDestroy() {
      this.clearNotificationPolling();
      document.removeEventListener('mousedown', this.handleNotificationOutside);
      window.removeEventListener('platformInfoUpdated', this.handlePlatformInfoUpdated);
    },
    watch: {
      $route() {
        this.updateBreadcrumbs();
      },
    },
    computed: {
      unreadCount() {
        return this.notifications.filter(item => Number(item.isRead) === 0).length;
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
          '/reschedule-approval': '调课审批',
          '/devices': '设备管理',
          '/mobile-security-box': '移动保障箱',
          '/cloud-meeting': '云会议管理',
          '/cloud-meeting-hardware': '硬件终端',
          '/cloud-meeting-software': '软件终端',
          '/organizational-structure': '组织架构',
          '/class-period': '课时管理',
          '/subject-management': '学科管理',
          '/statistics': '数据统计看板',
          '/account-management': '账号管理',
          '/role-permission': '角色权限',
          '/system-config': '系统配置',
          '/operation-log': '操作日志',
          '/resource-types': '资源类型管理',
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

      isSuccessResponse(response) {
        return response && (response.code === 200 || response.code === 0 || response.success === true);
      },

      toggleNotificationPanel() {
        this.showNotificationPanel = !this.showNotificationPanel;
        if (this.showNotificationPanel) {
          this.fetchNotifications();
        }
      },

      handleNotificationOutside(event) {
        const notificationRef = this.$refs.notificationRef;
        if (notificationRef && !notificationRef.contains(event.target)) {
          this.showNotificationPanel = false;
        }
      },

      startNotificationPolling() {
        this.clearNotificationPolling();
        this.notificationTimer = setInterval(() => {
          this.fetchNotifications();
        }, 30000);
      },

      clearNotificationPolling() {
        if (this.notificationTimer) {
          clearInterval(this.notificationTimer);
          this.notificationTimer = null;
        }
      },

      async fetchNotifications() {
        if (this.notificationLoading) {
          return;
        }
        this.notificationLoading = true;
        try {
          const response = await noticeApi.page({ ...this.notificationQuery });
          if (this.isSuccessResponse(response) && response.data) {
            this.notifications = Array.isArray(response.data.list) ? response.data.list : [];
          }
        } catch (error) {
          console.error('获取通知消息失败:', error);
        } finally {
          this.notificationLoading = false;
        }
      },

      async handleNotificationClick(item) {
        if (!item || !item.id) {
          return;
        }
        if (Number(item.isRead) === 0) {
          try {
            const response = await noticeApi.markRead(item.id);
            if (this.isSuccessResponse(response)) {
              this.notifications = this.notifications.map(notification =>
                notification.id === item.id ? { ...notification, isRead: 1 } : notification
              );
            }
          } catch (error) {
            console.error('标记通知已读失败:', error);
          }
        }
        this.showNotificationPanel = false;
      },

      async handleMarkAllRead() {
        try {
          const response = await noticeApi.markAllRead();
          if (this.isSuccessResponse(response)) {
            this.notifications = this.notifications.map(item => ({ ...item, isRead: 1 }));
            this.$message.success('已全部标记为已读');
          } else {
            this.$message.error((response && response.message) || '全部已读失败');
          }
        } catch (error) {
          console.error('全部已读失败:', error);
          this.$message.error('全部已读失败');
        }
      },

      async handleDeleteAllNotifications() {
        const ids = this.notifications.map(item => item.id).filter(id => id !== undefined && id !== null);
        if (ids.length === 0) {
          return;
        }
        try {
          const response = await noticeApi.deleteByIds(ids);
          if (this.isSuccessResponse(response)) {
            this.notifications = [];
            this.$message.success('通知已清空');
          } else {
            this.$message.error((response && response.message) || '删除通知失败');
          }
        } catch (error) {
          console.error('删除通知失败:', error);
          this.$message.error('删除通知失败');
        }
      },

      goRescheduleApproval() {
        this.showNotificationPanel = false;
        if (this.$route.path !== '/reschedule-approval') {
          this.$router.push('/reschedule-approval');
        }
      },

      formatNotificationTime(value) {
        if (!value) {
          return '';
        }
        const normalizedValue = typeof value === 'string' ? value.replace(/-/g, '/').replace('T', ' ') : value;
        const date = new Date(normalizedValue);
        if (Number.isNaN(date.getTime())) {
          return String(value).slice(0, 5);
        }
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      },

      async loadPlatformInfo() {
        try {
          const response = await systemConfig.getPlatformImage();
          if (response && response.data && response.data.url) {
            this.platformLogoUrl = `${window.businessURL}${response.data.url}`;
          }

          const listResponse = await systemConfig.list();
          if (listResponse && listResponse.data) {
            const configs = listResponse.data;
            const systemNameConfig = configs.find(item => item.configName === '系统名称');
            const systemDescriptionConfig = configs.find(item => item.configName === '系统简介');

            if (systemNameConfig && systemNameConfig.configValue) {
              this.platformName = systemNameConfig.configValue;
              localStorage.setItem('platformName', systemNameConfig.configValue);
            }
            if (systemDescriptionConfig && systemDescriptionConfig.configValue) {
              this.platformDescription = systemDescriptionConfig.configValue;
              localStorage.setItem('platformDescription', systemDescriptionConfig.configValue);
            }
          }
        } catch (error) {
          console.error('获取平台信息失败:', error);
        }
      },

      handlePlatformInfoUpdated() {
        const storedLogoUrl = localStorage.getItem('platformLogoUrl');
        const storedPlatformName = localStorage.getItem('platformName');
        const storedPlatformDescription = localStorage.getItem('platformDescription');

        if (storedLogoUrl) {
          // 添加时间戳参数，强制浏览器刷新图片缓存
          const timestamp = Date.now();
          this.platformLogoUrl = `${storedLogoUrl}?t=${timestamp}`;
        }
        if (storedPlatformName) {
          this.platformName = storedPlatformName;
        }
        if (storedPlatformDescription) {
          this.platformDescription = storedPlatformDescription;
        }
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
    // background: linear-gradient(180deg, #1a237e 0%, #283593 100%);
    background: #3165d2;
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

        .logo-info {
          display: none;
        }

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
            color: #fff;
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

        .platform-logo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }

        span {
          font-size: 20px;
          font-weight: bold;
          color: #4f7cff;
        }
      }

      .logo-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }

      .logo-text {
        font-size: 14px;
        font-weight: 600;
        color: #fff;
        white-space: nowrap;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .logo-description {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 120px;
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
              color: #fff;
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
          // padding-left: 32px;
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
              display: flex;
              align-items: center;
              justify-content: center;
              .menu-title {
                font-size: 14px;
                white-space: nowrap;
                color: #fff;
              }

              &:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
              }

              &.active {
                // background: #4f7cff;
                // color: #fff;
                background: white;
                color: #3165d2;
                .menu-title {
                  color: #3165d2;
                }
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

          &.notification-wrapper {
            overflow: visible;

            .notification-trigger {
              position: relative;
              width: 40px;
              height: 40px;
              border: none;
              border-radius: 8px;
              background: transparent;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: background 0.2s;
              padding: 0;
              outline: none;

              &:hover {
                background: #f5f7fa;
              }

              i {
                font-size: 20px;
                color: #606266;
              }
            }

            .notification-badge {
              position: absolute;
              top: -2px;
              right: -2px;
              min-width: 18px;
              height: 18px;
              padding: 0 5px;
              background: #ef4444;
              color: #fff;
              font-size: 10px;
              font-weight: 700;
              border-radius: 999px;
              display: flex;
              align-items: center;
              justify-content: center;
              line-height: 18px;
              box-sizing: border-box;
            }

            .notification-panel {
              position: absolute;
              top: calc(100% + 8px);
              right: 0;
              width: 380px;
              background: #fff;
              border-radius: 12px;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
              border: 1px solid #e5e7eb;
              z-index: 50;
              overflow: hidden;
              cursor: default;
            }

            .notification-header {
              padding: 12px 16px;
              border-bottom: 1px solid #f3f4f6;
              display: flex;
              align-items: center;
              justify-content: space-between;

              h3 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
                color: #111827;
              }
            }

            .notification-actions {
              display: flex;
              align-items: center;
              gap: 4px;
            }

            .notification-read-all {
              padding: 4px 8px;
              border: none;
              border-radius: 4px;
              background: transparent;
              color: #2563eb;
              font-size: 12px;
              line-height: 16px;
              cursor: pointer;
              transition: background 0.2s;

              &:hover {
                background: #eff6ff;
              }
            }

            .notification-delete {
              width: 24px;
              height: 24px;
              padding: 0;
              border: none;
              border-radius: 4px;
              background: transparent;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: background 0.2s, color 0.2s;

              i {
                font-size: 14px;
                color: #9ca3af;
              }

              &:hover {
                background: #fef2f2;

                i {
                  color: #ef4444;
                }
              }
            }

            .notification-tabs {
              display: flex;
              align-items: center;
              gap: 4px;
              padding: 8px 12px;
              border-bottom: 1px solid #f3f4f6;
              background: rgba(249, 250, 251, 0.5);
            }

            .notification-tab {
              padding: 4px 12px;
              border: none;
              border-radius: 999px;
              background: transparent;
              color: #6b7280;
              font-size: 12px;
              font-weight: 500;
              line-height: 16px;
              cursor: pointer;
              transition: background 0.2s, color 0.2s;

              &.active {
                background: #dbeafe;
                color: #1d4ed8;
              }
            }

            .notification-list {
              max-height: 360px;
              overflow-y: auto;
            }

            .notification-empty {
              height: 136px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: #9ca3af;

              i {
                font-size: 40px;
                color: #d1d5db;
                margin-bottom: 8px;
              }

              p {
                margin: 0;
                font-size: 14px;
                color: #9ca3af;
              }
            }

            .notification-items {
              .notification-card + .notification-card {
                border-top: 1px solid #f9fafb;
              }
            }

            .notification-card {
              display: flex;
              gap: 12px;
              padding: 12px 16px;
              cursor: pointer;
              transition: background 0.2s;

              &:hover {
                background: #f9fafb;
              }

              &.unread {
                background: rgba(239, 246, 255, 0.3);

                &:hover {
                  background: rgba(239, 246, 255, 0.6);
                }
              }
            }

            .notification-type-icon {
              width: 36px;
              height: 36px;
              border-radius: 8px;
              background: #fffbeb;
              border: 1px solid #fef3c7;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;

              i {
                font-size: 16px;
                color: #d97706;
              }
            }

            .notification-content {
              flex: 1;
              min-width: 0;
            }

            .notification-title-row {
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
              gap: 8px;

              h4 {
                margin: 0;
                color: #374151;
                font-size: 14px;
                font-weight: 500;
                line-height: 20px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;

                &.unread {
                  color: #111827;
                  font-weight: 600;
                }
              }

              span {
                color: #9ca3af;
                font-size: 11px;
                line-height: 18px;
                flex-shrink: 0;
                margin-top: 2px;
              }
            }

            .notification-content p {
              margin: 2px 0 0;
              color: #6b7280;
              font-size: 12px;
              line-height: 20px;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }

            .notification-unread {
              margin-top: 6px;
              display: flex;
              align-items: center;
              gap: 4px;

              span {
                width: 6px;
                height: 6px;
                background: #ef4444;
                border-radius: 999px;
              }

              em {
                color: #ef4444;
                font-size: 11px;
                font-style: normal;
                font-weight: 500;
                line-height: 14px;
              }
            }

            .notification-footer {
              padding: 8px 16px;
              border-top: 1px solid #f3f4f6;
              background: rgba(249, 250, 251, 0.5);
              text-align: center;

              button {
                border: none;
                background: transparent;
                color: #2563eb;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: color 0.2s;
                padding: 0;

                &:hover {
                  color: #1d4ed8;
                }
              }
            }
          }

          .notification-panel-enter-active,
          .notification-panel-leave-active {
            transition: opacity 0.2s, transform 0.2s;
          }

          .notification-panel-enter,
          .notification-panel-leave-to {
            opacity: 0;
            transform: translateY(-8px);
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
      justify-content: center;
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
