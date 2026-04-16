# 智慧教育云平台 - Vue 2 + Element UI

这是一个基于Vue 2 + Element UI + axios构建的智慧教育云平台前端项目。

## 项目结构

```
src/
├── assets/          # 静态资源
├── components/      # 通用组件
├── views/           # 页面组件
├── router/          # 路由配置
├── api/             # API接口
├── store/           # Vuex状态管理
├── utils/           # 工具函数
└── App.vue          # 根组件
```

## 主要功能

- 课程排课视图（日/周/月视图）
- 设备管理
- 组织架构管理
- 统计分析
- 系统设置

## 运行项目

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run serve
```

3. 构建生产版本：
```bash
npm run build
```

## 技术栈

- Vue 2.6.14
- Element UI 2.15.13
- axios 1.6.8
- Vuex (状态管理)
- Vue Router (路由管理)