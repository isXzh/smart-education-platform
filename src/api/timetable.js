import http from "@/utils/http.js";
// 课表视图
export default {
  // 周视图
  async weekTimetable(semesterId, weekNumber) {
    return await http.get("/api/schedule/timetable/week", {
      semesterId,
      weekNumber,
    });
  },
  // 教师课表
  async teacherTimetable(teacherId, semesterId) {
    return await http.get(`/api/schedule/timetable/teacher/${teacherId}`, {
      semesterId,
    });
  },
  // 日期课表
  async dateTimetable(date) {
    return await http.get(`/api/schedule/timetable/date/${date}`);
  },
  // 教室课表
  async classroomTimetable(classroomId, semesterId) {
    return await http.get(`/api/schedule/timetable/classroom/${classroomId}`, {
      semesterId,
    });
  },
  // 班级课表

  async classTimetable(classId, semesterId) {
    return await http.get(`/api/schedule/timetable/class/${classId}`, {
      semesterId,
    });
  },
};
