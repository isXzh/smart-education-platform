import Vue from "vue";
import VueRouter from "vue-router";
import Layout from "@/components/views/Layout.vue";
import HomePage from "@/views/HomePage.vue";
import CourseManage from "@/components/views/courseSchedule/courseManage.vue";
import CourseView from "@/components/views/courseSchedule/courseView.vue";
import CourseCalendar from "@/components/views/courseSchedule/courseCalendar.vue";
import DeviceManagement from "@/components/views/deviceResource/devicemanagement.vue";
import OrganizationalStructure from "@/components/views/InformationManagement/organizationalStructure.vue";
import ClassPeriod from "@/components/views/InformationManagement/classPeriod.vue";
import SubjectManagement from "@/components/views/InformationManagement/subjectManagement.vue";
import SystemManagement from "@/components/views/systemManagement/index.vue";
import AccountManagement from "@/components/views/systemManagement/AccountManagement.vue";
import RolePermission from "@/components/views/systemManagement/RolePermission.vue";
import SystemConfig from "@/components/views/systemManagement/SystemConfig.vue";
import OperationLog from "@/components/views/systemManagement/OperationLog.vue";
import DataBoard from "@/components/views/dataBoard/index.vue";
import Login from "@/components/views/Login.vue";
import Profile from "@/components/views/Profile.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/",
    component: Layout,
    children: [
      {
        path: "",
        name: "home",
        component: HomePage,
      },
      // 课程排课-排课管理
      {
        path: "schedule-management",
        name: "schedule-management",
        component: CourseManage,
      },
      // 课程排课-课表视图
      {
        path: "schedule-view",
        name: "schedule-view",
        component: CourseView,
      },
      // 课程排课-排课日历
      {
        path: "schedule-calendar",
        name: "schedule-calendar",
        component: CourseCalendar,
      },
      // 设备资源管理-设备列表
      {
        path: "devices-list",
        name: "devices-list",
        component: DeviceManagement,
      },
      // 基础信息管理-组织架构
      {
        path: "Information-base-info",
        name: "Information-base-info",
        component: OrganizationalStructure,
      },
      // 基础信息管理-课时管理
      {
        path: "Information-class-period",
        name: "Information-class-period",
        component: ClassPeriod,
      },
      // 基础信息管理-学科管理
      {
        path: "Information-subject-management",
        name: "Information-subject-management",
        component: SubjectManagement,
      },
      // 系统管理
      {
        path: "system",
        component: SystemManagement,
        children: [
          {
            path: "",
            redirect: "account",
          },
          {
            path: "account",
            name: "account-management",
            component: AccountManagement,
          },
          {
            path: "role",
            name: "role-permission",
            component: RolePermission,
          },
          {
            path: "config",
            name: "system-config",
            component: SystemConfig,
          },
          {
            path: "log",
            name: "operation-log",
            component: OperationLog,
          },
        ],
      },
      // 数据统计看板
      {
        path: "statistics",
        name: "statistics",
        component: DataBoard,
      },
      // 个人中心
      {
        path: "profile",
        name: "profile",
        component: Profile,
        meta: { title: "个人中心" },
      },
      // 默认重定向到首页
      {
        path: "",
        redirect: "home",
      },
    ],
  },
  // 404页面
  {
    path: "*",
    redirect: "/login",
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 显示页面标题
  document.title = to.meta.title
    ? `${to.meta.title} - 智慧教育云平台`
    : "智慧教育云平台";

  const refreshToken = sessionStorage.getItem("refreshToken");
  // next();
  // 如果前往登录页
  if (to.path === "/login") {
    next();
    // if (token) {
    //   next({ path: '/' })
    // } else {
    //   next()
    // }
  } else {
    // 非登录页
    if (refreshToken) {
      next();
    } else {
      // 没有刷新Token，跳转到登录页
      next(`/login`);
    }
  }
});

export default router;
