<template>
  <div class="home-page common-container">
    <div class="breadcrumb">
      <span class="breadcrumb-current">首页</span>
    </div>

    <div class="welcome-card">
      <div class="welcome-icon">
        <i class="el-icon-school"></i>
      </div>
      <h1 class="welcome-title">首页</h1>
      <p class="welcome-subtitle">欢迎使用兴图新科智慧教育云平台</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomePage",
};
</script>

<style scoped>
.home-page {
  width: 100%;
  min-height: 100%;
  background-color: #f5f7fa;
  /* padding: 16px 24px; */
  box-sizing: border-box;
  padding-bottom: 100px;
}

.breadcrumb {
  margin-bottom: 16px;
  font-size: 14px;
}

.breadcrumb-current {
  color: #409eff;
}

.welcome-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 500px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.welcome-icon {
  width: 120px;
  height: 120px;
  background: #f0f5ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.welcome-icon i {
  font-size: 56px;
  color: #409eff;
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.welcome-subtitle {
  font-size: 14px;
  color: #606266;
  margin: 0;
}
</style>
