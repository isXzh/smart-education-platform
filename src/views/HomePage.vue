<template>
  <div class="home-page">
    <div class="mx-auto w-full max-w-[1440px] px-6 py-6">
      <!-- 面包屑 -->
      <div class="mb-5 flex items-center text-sm text-slate-500">
        <span>首页</span>
      </div>

      <!-- ========== LAYER 1: 今日运营仪表盘 ========== -->
      <section class="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <!-- 头部 -->
        <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 class="text-2xl font-bold tracking-wide text-slate-900 lg:text-[28px]">
              教育数字化 · 一站式视频云服务平台
            </h1>
            <p class="mt-1.5 text-sm font-medium text-slate-500">
              覆盖「排课 · 上课 · 资源 · 设备 · 数据」全链路 · 让教学协同更高效
            </p>
          </div>
          <div class="flex items-center gap-3 text-sm text-slate-500">
            <span>{{ username }}</span>
            <span>·</span>
            <span>{{ formattedDate }}</span>
            <span class="font-mono font-semibold text-blue-600">{{ formattedTime }}</span>
          </div>
        </div>

        <!-- 分隔线 -->
        <div class="mb-5 h-px bg-slate-100"></div>

        <!-- 4 个核心指标 -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="(k, idx) in kpis" :key="idx" class="flex items-start gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50">
              <i :class="['text-2xl text-slate-500', k.icon]"></i>
            </div>
            <div>
              <div class="text-xs font-medium text-slate-500">{{ k.title }}</div>
              <div class="mt-1 flex items-baseline gap-1">
                <span class="font-mono text-2xl font-bold tabular-nums text-slate-900">{{ k.value }}</span>
                <span v-if="k.unit" class="text-xs text-slate-500">{{ k.unit }}</span>
              </div>
              <div class="mt-0.5 text-[11px]">
                <span :class="toneClass(k.tone)">{{ k.delta }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部状态摘要 -->
        <div class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
          <span class="flex items-center gap-1.5">
            <i class="el-icon-warning-outline text-amber-500"></i>
            <span class="font-medium text-amber-600">{{ pendingAlerts }} 项待处理</span>
          </span>
          <span class="hidden h-3 w-px bg-slate-300 sm:block"></span>
          <span class="flex items-center gap-1.5">
            <i class="el-icon-monitor text-rose-500"></i>
            <span class="font-medium text-rose-600">{{ offlineDevices }} 台离线</span>
          </span>
          <span class="hidden h-3 w-px bg-slate-300 sm:block"></span>
          <span class="flex items-center gap-1.5">
            <i class="el-icon-s-opportunity text-blue-500"></i>
            <span class="font-medium text-blue-600">{{ activeClasses }} 节课进行中</span>
          </span>
          <span class="ml-auto">{{ greeting }}</span>
        </div>
      </section>

      <!-- ========== LAYER 2: 今日课堂全景 ========== -->
      <section class="mb-6">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-sm font-bold tracking-wider text-slate-800">今日课堂全景</h2>
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <!-- 课程-设备时间线 -->
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="el-icon-time text-slate-500"></i>
                <span class="text-sm font-semibold text-slate-800">课程-设备时间线</span>
              </div>
              <div class="flex items-center gap-3 text-[11px] text-slate-500">
                <span class="flex items-center gap-1">
                  <i class="el-icon-success text-emerald-500"></i>已结束
                </span>
                <span class="flex items-center gap-1">
                  <i class="el-icon-video-play text-blue-500"></i>进行中
                </span>
                <span class="flex items-center gap-1">
                  <i class="el-icon-time text-slate-400"></i>待开始
                </span>
                <span class="flex items-center gap-1">
                  <i class="el-icon-warning-outline text-amber-500"></i>异常
                </span>
              </div>
            </div>

            <div class="space-y-3">
              <div
                v-for="(s, i) in todaySchedule"
                :key="s.scheduleId || i"
                :class="[
                  'flex items-center gap-4 rounded-xl border p-3 transition-all',
                  s._statusKey === 'active'
                    ? 'border-blue-200 bg-blue-50/50'
                    : s._statusKey === 'warning'
                      ? 'border-amber-200 bg-amber-50/30'
                      : 'border-slate-100 bg-white',
                ]"
              >
                <!-- 时间 -->
                <div class="w-16 shrink-0 text-center">
                  <div class="font-mono text-sm font-semibold tabular-nums text-slate-700">
                    {{ s._startTime }}
                  </div>
                  <div :class="['mt-0.5 text-[10px] font-medium', statusConfig(s._statusKey).color]">
                    {{ statusConfig(s._statusKey).label }}
                  </div>
                </div>

                <!-- 连接线 -->
                <div class="relative flex h-10 w-px shrink-0 items-center justify-center">
                  <div :class="['absolute inset-0 w-px', statusConfig(s._statusKey).line]"></div>
                  <div :class="['relative z-10 h-2.5 w-2.5 rounded-full border-2 border-white', statusConfig(s._statusKey).line]"></div>
                </div>

                <!-- 课程信息 -->
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-slate-800">{{ s.subjectName }}</span>
                    <span class="text-xs text-slate-500">
                      · {{ s.schoolName }}<template v-if="s.courseName"> / {{ s.courseName }}</template>
                    </span>
                  </div>
                  <div class="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <i class="el-icon-monitor text-[12px]"></i>
                    <span>{{ s.mainDeviceName || '—' }}</span>
                  </div>
                </div>

                <!-- 状态图标 -->
                <div :class="['flex h-8 w-8 shrink-0 items-center justify-center rounded-full', statusConfig(s._statusKey).bg]">
                  <i :class="[statusConfig(s._statusKey).icon, statusConfig(s._statusKey).color]"></i>
                </div>
              </div>

              <div v-if="!todaySchedule.length" class="py-10 text-center text-xs text-slate-400">暂无今日课程</div>
            </div>
          </div>

          <!-- 异常与待办 + 快捷行动 -->
          <div class="flex flex-col gap-4">
            <!-- 异常与待办 -->
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-3 flex items-center gap-2">
                <i class="el-icon-warning text-amber-600"></i>
                <span class="text-sm font-semibold text-slate-800">异常与待办</span>
                <span class="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  {{ alerts.length }}
                </span>
              </div>
              <div class="space-y-2.5">
                <div
                  v-for="(alert, i) in alerts"
                  :key="i"
                  :class="['rounded-xl border p-3', alertConfig(alert._type).border, alertConfig(alert._type).bg]"
                >
                  <div class="flex items-start gap-2.5">
                    <i :class="['mt-0.5 shrink-0', alertConfig(alert._type).icon, alertConfig(alert._type).color]"></i>
                    <div class="min-w-0 flex-1">
                      <div class="text-sm font-medium text-slate-800">{{ alert._title }}</div>
                      <div v-if="alert._detail" class="mt-0.5 text-xs text-slate-500">{{ alert._detail }}</div>
                    </div>
                  </div>
                  <button
                    v-if="alert._action"
                    @click="onAlertAction(alert)"
                    :class="['mt-2 flex items-center gap-1 text-xs font-medium hover:underline', alertConfig(alert._type).color]"
                  >
                    {{ alert._action }}
                    <i class="el-icon-arrow-right text-[10px]"></i>
                  </button>
                </div>
                <div v-if="!alerts.length" class="py-4 text-center text-xs text-slate-400">暂无异常与待办</div>
              </div>
            </div>

            <!-- 快捷行动 -->
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-3 text-sm font-semibold text-slate-800">快捷行动</div>
              <div class="grid grid-cols-2 gap-2">
                <button
                  @click="goTo('/schedule-calendar')"
                  class="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <i class="el-icon-date"></i>排课日历
                </button>
                <button
                  @click="goTo('/mobile-security-box')"
                  class="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <i class="el-icon-monitor"></i>设备状态
                </button>
                <button
                  @click="goTo('/resource-common')"
                  class="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                >
                  <i class="el-icon-folder-opened"></i>资源库
                </button>
                <button
                  @click="goTo('/statistics')"
                  class="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                >
                  <i class="el-icon-data-line"></i>数据统计
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ========== LAYER 3: 平台能力与趋势 ========== -->
      <section>
        <h2 class="mb-4 text-sm font-bold tracking-wider text-slate-800">平台能力与趋势</h2>

        <!-- 业务能力入口 -->
        <div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          <button
            v-for="card in capabilities"
            :key="card.key"
            @click="goTo(card.path)"
            class="capability-card group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:scale-[0.98]"
          >
            <div :class="['mb-3 flex h-12 w-12 items-center justify-center rounded-xl', card.accent]">
              <i :class="[card.icon, 'text-2xl']"></i>
            </div>
            <div class="text-sm font-semibold text-slate-800">{{ card.title }}</div>
            <div class="mt-1 text-[11px] leading-snug text-slate-500">{{ card.desc }}</div>
            <i class="el-icon-right mt-2 text-[12px] text-slate-300 opacity-0 transition-all group-hover:text-slate-500 group-hover:opacity-100"></i>
          </button>
        </div>

        <!-- 趋势 + 动态 -->
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <!-- 本周课堂趋势 -->
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="el-icon-data-line text-slate-500"></i>
                <span class="text-sm font-semibold text-slate-800">本周课堂趋势</span>
              </div>
              <span class="text-[11px] text-slate-400">近 7 天</span>
            </div>
            <div class="flex items-end gap-2" style="height: 140px">
              <div
                v-for="(t, i) in weeklyTrend"
                :key="i"
                class="flex flex-1 flex-col items-center gap-1.5 h-full justify-end"
              >
                <div class="relative w-full flex justify-center items-end" style="height: 100px">
                  <div
                    :class="[
                      'w-full rounded-t-md transition-all',
                      i === todayIndex ? 'bg-blue-500' : t.count > 0 ? 'bg-slate-300' : 'bg-slate-100',
                    ]"
                    :style="{ height: barHeight(t.count) + 'px' }"
                  ></div>
                  <div
                    v-if="t.count > 0"
                    class="absolute left-1/2 -translate-x-1/2 text-[10px] font-medium text-slate-600"
                    :style="{ bottom: barHeight(t.count) + 4 + 'px' }"
                  >
                    {{ t.count }}
                  </div>
                </div>
                <span :class="['text-[11px]', i === todayIndex ? 'font-semibold text-blue-600' : 'text-slate-500']">
                  {{ dayLabels[i] }}
                </span>
              </div>
            </div>
          </div>

          <!-- 平台最新动态 -->
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="el-icon-data-analysis text-blue-600"></i>
                <span class="text-sm font-semibold text-slate-800">平台最新动态</span>
              </div>
              <button
                @click="goTo('/system/log')"
                class="flex items-center gap-0.5 text-[11px] text-blue-600 transition-colors hover:text-blue-800"
              >
                查看全部 <i class="el-icon-arrow-right text-[10px]"></i>
              </button>
            </div>
            <ul class="divide-y divide-slate-100">
              <li
                v-for="(a, i) in latestActivity"
                :key="a.id || i"
                :class="['flex items-center gap-3 py-2.5 transition-all', i === feedIdx ? 'translate-x-0 opacity-100' : 'opacity-70']"
              >
                <span class="w-12 shrink-0 font-mono text-[11px] tabular-nums text-slate-500">
                  {{ formatFeedTime(a.createdAt) }}
                </span>
                <span :class="['rounded px-1.5 py-0.5 text-[10px] font-medium', moduleTagColor(a.module)]">
                  {{ a.module || '系统' }}
                </span>
                <span class="truncate text-[13px] text-slate-700" :title="a.operationDesc">
                  {{ a.operationDesc }}
                </span>
              </li>
              <li v-if="!latestActivity.length" class="py-4 text-center text-xs text-slate-400">暂无动态</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 页脚注 -->
      <footer class="mt-6 flex items-center justify-between text-[11px] text-slate-400">
        <span>兴图新科 · 智慧教育视频云服务平台 v3.0</span>
        <span>© 2026 Xingtu Xinke EduTech</span>
      </footer>
    </div>
  </div>
</template>

<script>
import homeApi from '@/api/home.js';

export default {
  name: 'HomePage',
  data() {
    return {
      now: new Date(),
      timer: null,
      feedIdx: 0,
      feedTimer: null,
      // 接口数据
      schoolStat: { totalCount: 0, monthAdded: 0 },
      deviceStat: { totalCount: 0, onlineCount: 0 },
      resourceStat: { totalCount: 0, monthAdded: 0 },
      todayCourses: [],
      exceptionTodoList: [],
      weekTrend: [],
      latestActivity: [],
      dayLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      capabilities: [
        {
          key: 'schedule',
          title: '课程排课',
          desc: '智能排课 · 冲突检测 · 课表视图',
          icon: 'el-icon-date',
          path: '/schedule-calendar',
          accent: 'text-sky-600 bg-sky-50',
        },
        {
          key: 'devices',
          title: '终端管理',
          desc: '硬件终端 · 在线监测 · 状态管理',
          icon: 'el-icon-monitor',
          path: '/cloud-meeting-hardware',
          accent: 'text-emerald-600 bg-emerald-50',
        },
        {
          key: 'resource',
          title: '资源库',
          desc: '个人资源 · 公共资源 · 分类标签',
          icon: 'el-icon-folder-opened',
          path: '/resource-common',
          accent: 'text-violet-600 bg-violet-50',
        },
        {
          key: 'base-info',
          title: '基础信息',
          desc: '学校 · 学科 · 年级 · 班级',
          icon: 'el-icon-office-building',
          path: '/Information-school-management',
          accent: 'text-indigo-600 bg-indigo-50',
        },
        {
          key: 'statistics',
          title: '数据统计',
          desc: '驾驶舱 · 多维看板 · 实时分析',
          icon: 'el-icon-data-line',
          path: '/statistics',
          accent: 'text-orange-600 bg-orange-50',
        },
        {
          key: 'system',
          title: '系统管理',
          desc: '账号 · 角色 · 权限 · 操作日志',
          icon: 'el-icon-setting',
          path: '/system/account',
          accent: 'text-slate-600 bg-slate-50',
        },
      ],
    };
  },
  computed: {
    username() {
      try {
        const info = sessionStorage.getItem('userInfo');
        if (info) {
          const u = JSON.parse(info);
          return u.realName || u.username || u.name || '超级管理员';
        }
      } catch (e) {
        // ignore
      }
      return sessionStorage.getItem('username') || '超级管理员';
    },
    formattedTime() {
      const pad = n => String(n).padStart(2, '0');
      const d = this.now;
      return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    },
    formattedDate() {
      const d = this.now;
      const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} 周${weekdays[d.getDay()]}`;
    },
    greeting() {
      const h = this.now.getHours();
      if (h < 6) return '夜深了';
      if (h < 9) return '早上好';
      if (h < 12) return '上午好';
      if (h < 14) return '中午好';
      if (h < 18) return '下午好';
      return '晚上好';
    },
    // 4 大 KPI
    kpis() {
      const offline = Math.max(0, (this.deviceStat.totalCount || 0) - (this.deviceStat.onlineCount || 0));
      return [
        {
          title: '接入学校',
          value: this.schoolStat.totalCount || 0,
          unit: '所',
          delta: `本月新增 ${this.schoolStat.monthAdded || 0}`,
          tone: (this.schoolStat.monthAdded || 0) > 0 ? 'up' : 'flat',
          icon: 'el-icon-school',
        },
        {
          title: '在线终端',
          value: this.deviceStat.onlineCount || 0,
          unit: `/${this.deviceStat.totalCount || 0} 台`,
          delta: offline > 0 ? `${offline} 台离线` : '全部在线',
          tone: offline > 0 ? 'warn' : 'up',
          icon: 'el-icon-monitor',
        },
        {
          title: '今日开课',
          value: this.todayCourses.length,
          unit: '节',
          delta: `覆盖 ${this.coveredSchoolCount} 所学校`,
          tone: 'up',
          icon: 'el-icon-date',
        },
        {
          title: '资源沉淀',
          value: this.formatNumber(this.resourceStat.totalCount || 0),
          unit: '个',
          delta: `本月新增 ${this.resourceStat.monthAdded || 0}`,
          tone: (this.resourceStat.monthAdded || 0) > 0 ? 'up' : 'flat',
          icon: 'el-icon-files',
        },
      ];
    },
    coveredSchoolCount() {
      const set = new Set();
      this.todayCourses.forEach(c => {
        if (c.schoolName) set.add(c.schoolName);
      });
      return set.size;
    },
    // 今日课程时间线（增加状态映射）
    todaySchedule() {
      return this.todayCourses.map(c => {
        const startTime = c.periodTime ? c.periodTime.split('-')[0] : '';
        return {
          ...c,
          _startTime: startTime,
          _statusKey: this.mapCourseStatus(c.status),
        };
      });
    },
    activeClasses() {
      return this.todaySchedule.filter(s => s._statusKey === 'active').length;
    },
    offlineDevices() {
      return Math.max(0, (this.deviceStat.totalCount || 0) - (this.deviceStat.onlineCount || 0));
    },
    // 异常与待办 -> 统一结构
    alerts() {
      return this.exceptionTodoList.map(item => {
        if (item.typeCode === 1 && item.exceptionDetail) {
          const d = item.exceptionDetail;
          return {
            _type: 'expire',
            _title: `${d.deviceName || ''} ${d.exceptionContent || ''}`.trim(),
            _detail: [d.expireTimeDesc, d.deviceOrgName].filter(Boolean).join(' · '),
            _action: '去处理',
            _path: '/cloud-meeting-hardware',
          };
        }
        if (item.typeCode === 2 && item.todoDetail) {
          const d = item.todoDetail;
          return {
            _type: 'approval',
            _title: d.content || '待办事项',
            _detail: d.courseContent || '',
            _action: '去审批',
            _path: '/reschedule-approval',
          };
        }
        return {
          _type: 'warning',
          _title: '未知事项',
          _detail: '',
          _action: '',
          _path: '',
        };
      });
    },
    pendingAlerts() {
      return this.alerts.length;
    },
    // 本周趋势（补齐 7 天）
    weeklyTrend() {
      const map = {};
      this.weekTrend.forEach(t => {
        map[t.dayOfWeek] = t;
      });
      const result = [];
      for (let i = 1; i <= 7; i++) {
        const item = map[i];
        result.push({
          dayOfWeek: i,
          count: item ? item.count : 0,
          lessonDate: item ? item.lessonDate : '',
        });
      }
      return result;
    },
    todayIndex() {
      // 0=周日..6=周六，转换为 0=周一..6=周日
      const day = new Date().getDay();
      return day === 0 ? 6 : day - 1;
    },
    maxTrendCount() {
      return Math.max(1, ...this.weeklyTrend.map(t => t.count));
    },
  },
  created() {
    this.startClock();
    this.startFeedRotation();
    this.fetchAll();
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
    if (this.feedTimer) clearInterval(this.feedTimer);
  },
  methods: {
    startClock() {
      this.timer = setInterval(() => {
        this.now = new Date();
      }, 1000);
    },
    startFeedRotation() {
      this.feedTimer = setInterval(() => {
        if (this.latestActivity.length > 0) {
          this.feedIdx = (this.feedIdx + 1) % this.latestActivity.length;
        }
      }, 4000);
    },
    async fetchAll() {
      this.fetchSchoolStat();
      this.fetchDeviceStat();
      this.fetchResourceStat();
      this.fetchTodayCourses();
      this.fetchExceptionTodo();
      this.fetchWeekTrend();
      this.fetchLatestActivity();
    },
    async fetchSchoolStat() {
      try {
        const res = await homeApi.schoolStat();
        if (res && res.code === 200 && res.data) {
          this.schoolStat = res.data;
        }
      } catch (e) {
        console.error('接入学校统计获取失败', e);
      }
    },
    async fetchDeviceStat() {
      try {
        const res = await homeApi.deviceOnlineStat();
        if (res && res.code === 200 && res.data) {
          this.deviceStat = res.data;
        }
      } catch (e) {
        console.error('终端在线情况获取失败', e);
      }
    },
    async fetchResourceStat() {
      try {
        const res = await homeApi.resourceStat();
        if (res && res.code === 200 && res.data) {
          this.resourceStat = res.data;
        }
      } catch (e) {
        console.error('资源沉淀统计获取失败', e);
      }
    },
    async fetchTodayCourses() {
      try {
        const res = await homeApi.todayCourses();
        if (res && res.code === 200 && Array.isArray(res.data)) {
          this.todayCourses = res.data;
        }
      } catch (e) {
        console.error('今日课程获取失败', e);
      }
    },
    async fetchExceptionTodo() {
      try {
        const res = await homeApi.exceptionTodo();
        if (res && res.code === 200 && Array.isArray(res.data)) {
          this.exceptionTodoList = res.data;
        }
      } catch (e) {
        console.error('异常与待办获取失败', e);
      }
    },
    async fetchWeekTrend() {
      try {
        const res = await homeApi.weekCourseTrend();
        if (res && res.code === 200 && Array.isArray(res.data)) {
          this.weekTrend = res.data;
        }
      } catch (e) {
        console.error('本周课堂趋势获取失败', e);
      }
    },
    async fetchLatestActivity() {
      try {
        const res = await homeApi.latestActivity();
        if (res && res.code === 200 && Array.isArray(res.data)) {
          this.latestActivity = res.data;
        }
      } catch (e) {
        console.error('平台最新动态获取失败', e);
      }
    },
    // 课程状态映射：1已排课(待开始) 2进行中 3已完成 0已取消 4设备异常
    mapCourseStatus(status) {
      switch (status) {
        case 2:
          return 'active';
        case 3:
          return 'completed';
        case 4:
          return 'warning';
        case 0:
          return 'cancelled';
        case 1:
        default:
          return 'pending';
      }
    },
    statusConfig(key) {
      switch (key) {
        case 'completed':
          return {
            icon: 'el-icon-success',
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            label: '已结束',
            line: 'bg-emerald-500',
          };
        case 'active':
          return {
            icon: 'el-icon-video-play',
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            label: '进行中',
            line: 'bg-blue-500',
          };
        case 'warning':
          return {
            icon: 'el-icon-warning-outline',
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            label: '设备异常',
            line: 'bg-amber-500',
          };
        case 'cancelled':
          return {
            icon: 'el-icon-close',
            color: 'text-slate-400',
            bg: 'bg-slate-50',
            label: '已取消',
            line: 'bg-slate-300',
          };
        case 'pending':
        default:
          return {
            icon: 'el-icon-time',
            color: 'text-slate-400',
            bg: 'bg-slate-50',
            label: '待开始',
            line: 'bg-slate-300',
          };
      }
    },
    alertConfig(type) {
      switch (type) {
        case 'warning':
          return {
            icon: 'el-icon-warning-outline',
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
          };
        case 'approval':
          return {
            icon: 'el-icon-bell',
            color: 'text-sky-600',
            bg: 'bg-sky-50',
            border: 'border-sky-200',
          };
        case 'expire':
        default:
          return {
            icon: 'el-icon-warning',
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            border: 'border-rose-200',
          };
      }
    },
    toneClass(tone) {
      if (tone === 'up') return 'text-emerald-600 font-medium';
      if (tone === 'warn') return 'text-amber-600 font-medium';
      if (tone === 'down') return 'text-rose-600 font-medium';
      return 'text-slate-500 font-medium';
    },
    onAlertAction(alert) {
      if (alert._path) this.goTo(alert._path);
    },
    goTo(path) {
      if (!path) return;
      if (this.$route.path === path) return;
      this.$router.push(path).catch(() => {});
    },
    barHeight(count) {
      const maxHeight = 100;
      if (!count) return 4;
      return Math.max(4, (count / this.maxTrendCount) * maxHeight);
    },
    formatNumber(n) {
      return Number(n || 0).toLocaleString('en-US');
    },
    formatFeedTime(dt) {
      if (!dt) return '';
      const d = new Date(dt.replace ? dt.replace(/-/g, '/') : dt);
      if (isNaN(d.getTime())) {
        // 尝试直接截取 HH:mm
        const m = String(dt).match(/(\d{2}):(\d{2})/);
        return m ? `${m[1]}:${m[2]}` : '';
      }
      const pad = n => String(n).padStart(2, '0');
      return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    },
    moduleTagColor(module) {
      const map = {
        排课: 'bg-sky-100 text-sky-700',
        课程: 'bg-sky-100 text-sky-700',
        资源: 'bg-violet-100 text-violet-700',
        设备: 'bg-emerald-100 text-emerald-700',
        系统: 'bg-slate-100 text-slate-700',
        数据: 'bg-amber-100 text-amber-700',
        账号: 'bg-slate-100 text-slate-700',
        角色: 'bg-slate-100 text-slate-700',
      };
      if (!module) return 'bg-slate-100 text-slate-700';
      for (const key in map) {
        if (module.indexOf(key) !== -1) return map[key];
      }
      return 'bg-slate-100 text-slate-700';
    },
  },
};
</script>

<style scoped>
.home-page {
  width: 100%;
  min-height: 100%;
  background-color: #f8fafc;
  box-sizing: border-box;
  color: #0f172a;
}

.capability-card:hover {
  border-color: #cbd5e1;
}
</style>
