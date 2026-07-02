import http from "@/utils/http.js";
// 主页
export default {
  // 查询本周课堂趋势
  async weekCourseTrend() {
    return await http.get("/api/system/home/week-course-trend");
  },
  // 查询全平台今日课程详情
  async todayCourses() {
    return await http.get("/api/system/home/today-courses");
  },
  // 查询接入学校统计
  async schoolStat() {
    return await http.get("/api/system/home/school-stat");
  },
  // 查询资源沉淀统计
  async resourceStat() {
    return await http.get("/api/system/home/resource-stat");
  },
  // 查询平台最新动态
  async latestActivity() {
    return await http.get("/api/system/home/latest-activity");
  },
  // 查询异常与待办
  async exceptionTodo() {
    return await http.get("/api/system/home/exception-todo");
  },
  // 查询终端在线情况
  async deviceOnlineStat() {
    return await http.get("/api/system/home/device-online-stat");
  },
};
