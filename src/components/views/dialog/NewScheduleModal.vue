<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    width="640px"
    title="新建排课"
    custom-class="new-schedule-modal"
    @close="handleClose"
  >
    <!-- <div slot="title" class="modal-title">新建排课</div> -->

    <div class="modal-body">
      <el-form ref="form" :model="form" :rules="rules" label-position="top">
        <!-- 教学活动类型 -->
        <el-form-item label="教学活动类型" prop="activityType">
          <div class="activity-type-group">
            <div
              :class="['type-option', { active: form.activityType === '校内' }]"
              @click="form.activityType = '校内'"
            >
              校内
            </div>
            <div
              :class="['type-option', { active: form.activityType === '校外' }]"
              @click="form.activityType = '校外'"
            >
              校外
            </div>
          </div>
        </el-form-item>

        <!-- 学段 -->
        <el-form-item label="学段" prop="gradeLevel">
          <el-select
            v-model="form.gradeLevel"
            placeholder="请选择学段"
            class="full-width"
          >
            <el-option label="小学一年级" value="小学一年级"></el-option>
            <el-option label="小学二年级" value="小学二年级"></el-option>
            <el-option label="小学三年级" value="小学三年级"></el-option>
            <el-option label="小学四年级" value="小学四年级"></el-option>
            <el-option label="小学五年级" value="小学五年级"></el-option>
            <el-option label="小学六年级" value="小学六年级"></el-option>
            <el-option label="初中一年级" value="初中一年级"></el-option>
            <el-option label="初中二年级" value="初中二年级"></el-option>
            <el-option label="初中三年级" value="初中三年级"></el-option>
            <el-option label="高中一年级" value="高中一年级"></el-option>
            <el-option label="高中二年级" value="高中二年级"></el-option>
            <el-option label="高中三年级" value="高中三年级"></el-option>
          </el-select>
        </el-form-item>

        <!-- 课程 -->
        <el-form-item label="课程" prop="course">
          <el-select
            v-model="form.course"
            placeholder="请选择课程"
            class="full-width"
          >
            <el-option label="数学基础课" value="数学基础课"></el-option>
            <el-option label="语文阅读课" value="语文阅读课"></el-option>
            <el-option label="英语口语训练" value="英语口语训练"></el-option>
            <el-option label="美术创作课" value="美术创作课"></el-option>
            <el-option label="物理化学实验" value="物理化学实验"></el-option>
            <el-option label="化学入门" value="化学入门"></el-option>
            <el-option label="体育运动课" value="体育运动课"></el-option>
            <el-option label="音乐鉴赏" value="音乐鉴赏"></el-option>
            <el-option label="历史讲堂" value="历史讲堂"></el-option>
            <el-option label="地理探索" value="地理探索"></el-option>
            <el-option label="编程入门" value="编程入门"></el-option>
            <el-option label="科学实验" value="科学实验"></el-option>
            <el-option label="生物观察课" value="生物观察课"></el-option>
            <el-option label="政治课" value="政治课"></el-option>
            <el-option label="数学竞赛辅导" value="数学竞赛辅导"></el-option>
            <el-option label="书法课" value="书法课"></el-option>
          </el-select>
        </el-form-item>

        <!-- 学科 -->
        <el-form-item label="学科" prop="subject">
          <el-select
            v-model="form.subject"
            placeholder="请选择学科"
            class="full-width"
          >
            <el-option label="数学" value="数学"></el-option>
            <el-option label="语文" value="语文"></el-option>
            <el-option label="英语" value="英语"></el-option>
            <el-option label="物理" value="物理"></el-option>
            <el-option label="化学" value="化学"></el-option>
            <el-option label="生物" value="生物"></el-option>
            <el-option label="历史" value="历史"></el-option>
            <el-option label="地理" value="地理"></el-option>
            <el-option label="美术" value="美术"></el-option>
            <el-option label="音乐" value="音乐"></el-option>
            <el-option label="体育" value="体育"></el-option>
            <el-option label="信息技术" value="信息技术"></el-option>
            <el-option label="科学" value="科学"></el-option>
            <el-option label="政治" value="政治"></el-option>
          </el-select>
        </el-form-item>

        <!-- 教师 -->
        <el-form-item label="教师" prop="teacher">
          <el-select
            v-model="form.teacher"
            placeholder="请选择教师"
            class="full-width"
          >
            <el-option label="张老师" value="张老师"></el-option>
            <el-option label="李老师" value="李老师"></el-option>
            <el-option label="王老师" value="王老师"></el-option>
            <el-option label="赵老师" value="赵老师"></el-option>
            <el-option label="刘老师" value="刘老师"></el-option>
            <el-option label="陈老师" value="陈老师"></el-option>
            <el-option label="孙老师" value="孙老师"></el-option>
            <el-option label="吴老师" value="吴老师"></el-option>
            <el-option label="郑老师" value="郑老师"></el-option>
            <el-option label="周老师" value="周老师"></el-option>
            <el-option label="马老师" value="马老师"></el-option>
            <el-option label="林老师" value="林老师"></el-option>
          </el-select>
        </el-form-item>

        <!-- 上课日期 -->
        <el-form-item label="上课日期" prop="courseDate">
          <el-date-picker
            v-model="form.courseDate"
            type="date"
            placeholder="年/月/日"
            class="full-width"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>

        <!-- 上课节次 -->
        <el-form-item label="上课节次" prop="coursePeriod">
          <el-select
            v-model="form.coursePeriod"
            placeholder="请先选择学段"
            class="full-width"
            :disabled="!form.gradeLevel"
          >
            <el-option label="第1节 08:00-08:40" value="1"></el-option>
            <el-option label="第2节 08:50-09:30" value="2"></el-option>
            <el-option label="第3节 09:40-10:20" value="3"></el-option>
            <el-option label="第4节 10:30-11:10" value="4"></el-option>
            <el-option label="第5节 14:00-14:40" value="5"></el-option>
            <el-option label="第6节 14:50-15:30" value="6"></el-option>
            <el-option label="第7节 15:40-16:20" value="7"></el-option>
            <el-option label="第8节 16:30-17:10" value="8"></el-option>
          </el-select>
          <div class="form-hint" v-if="!form.gradeLevel">
            节次选项将根据所选学段动态加载
          </div>
        </el-form-item>

        <!-- 上课地点 -->
        <el-form-item label="上课地点" prop="courseLocation">
          <el-input
            v-model="form.courseLocation"
            placeholder="选择主讲教室后自动填充"
            class="full-width"
            :readonly="true"
          ></el-input>
        </el-form-item>

        <!-- 主讲教室 -->
        <el-form-item label="主讲教室" prop="mainClassroom">
          <div class="classroom-selector">
            <div class="search-box">
              <i class="el-icon-search"></i>
              <input type="text" placeholder="搜索教室..." />
            </div>
            <div class="classroom-list">
              <div class="classroom-item">
                <el-checkbox v-model="form.mainClassroom" label="移动课堂箱-A01"
                  >移动课堂箱-A01
                  <span class="classroom-location"
                    >教学楼A-101</span
                  ></el-checkbox
                >
              </div>
              <div class="classroom-item">
                <el-checkbox v-model="form.mainClassroom" label="移动课堂箱-A02"
                  >移动课堂箱-A02
                  <span class="classroom-location"
                    >教学楼A-102</span
                  ></el-checkbox
                >
              </div>
              <div class="classroom-item">
                <el-checkbox v-model="form.mainClassroom" label="移动课堂箱-B01"
                  >移动课堂箱-B01
                  <span class="classroom-location"
                    >教学楼B-201</span
                  ></el-checkbox
                >
              </div>
              <div class="classroom-item">
                <el-checkbox v-model="form.mainClassroom" label="移动课堂箱-C01"
                  >移动课堂箱-C01
                  <span class="classroom-location"
                    >实验楼C-301</span
                  ></el-checkbox
                >
              </div>
            </div>
          </div>
        </el-form-item>

        <!-- 辅讲教室 -->
        <el-form-item label="辅讲教室">
          <div class="optional-label">(可选)</div>
          <div class="classroom-selector">
            <div class="search-box">
              <i class="el-icon-search"></i>
              <input type="text" placeholder="搜索教室..." />
            </div>
            <div class="classroom-list">
              <div class="classroom-item">
                <el-checkbox
                  v-model="form.assistClassroom"
                  label="移动课堂箱-A01"
                  >移动课堂箱-A01
                  <span class="classroom-location"
                    >教学楼A-101</span
                  ></el-checkbox
                >
              </div>
              <div class="classroom-item">
                <el-checkbox
                  v-model="form.assistClassroom"
                  label="移动课堂箱-A02"
                  >移动课堂箱-A02
                  <span class="classroom-location"
                    >教学楼A-102</span
                  ></el-checkbox
                >
              </div>
              <div class="classroom-item">
                <el-checkbox
                  v-model="form.assistClassroom"
                  label="移动课堂箱-B01"
                  >移动课堂箱-B01
                  <span class="classroom-location"
                    >教学楼B-201</span
                  ></el-checkbox
                >
              </div>
              <div class="classroom-item">
                <el-checkbox
                  v-model="form.assistClassroom"
                  label="移动课堂箱-C01"
                  >移动课堂箱-C01
                  <span class="classroom-location"
                    >实验楼C-301</span
                  ></el-checkbox
                >
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <div slot="footer" class="modal-footer">
      <el-button class="cancel-btn" @click="handleClose">取消</el-button>
      <el-button type="primary" class="submit-btn" @click="handleSubmit"
        >确认排课</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "NewScheduleModal",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      form: {
        activityType: "校内",
        gradeLevel: "",
        course: "",
        subject: "",
        teacher: "",
        courseDate: "",
        coursePeriod: "",
        courseLocation: "",
        mainClassroom: [],
        assistClassroom: [],
      },
      rules: {
        activityType: [
          { required: true, message: "请选择教学活动类型", trigger: "change" },
        ],
        gradeLevel: [
          { required: true, message: "请选择学段", trigger: "change" },
        ],
        course: [{ required: true, message: "请选择课程", trigger: "change" }],
        subject: [{ required: true, message: "请选择学科", trigger: "change" }],
        teacher: [{ required: true, message: "请选择教师", trigger: "change" }],
        courseDate: [
          { required: true, message: "请选择上课日期", trigger: "change" },
        ],
        coursePeriod: [
          { required: true, message: "请选择上课节次", trigger: "change" },
        ],
        courseLocation: [
          { required: true, message: "请填写上课地点", trigger: "blur" },
        ],
        mainClassroom: [
          {
            required: true,
            message: "请选择主讲教室",
            trigger: "change",
            type: "array",
          },
        ],
      },
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      },
    },
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
      this.resetForm();
    },
    resetForm() {
      this.form = {
        activityType: "校内",
        gradeLevel: "",
        course: "",
        subject: "",
        teacher: "",
        courseDate: "",
        coursePeriod: "",
        courseLocation: "",
        mainClassroom: [],
        assistClassroom: [],
      };
      this.$refs.form && this.$refs.form.resetFields();
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$emit("submit", { ...this.form });
          this.handleClose();
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.new-schedule-modal {
  ::v-deep .el-dialog__header {
    display: none;
  }

  ::v-deep .el-dialog__body {
    padding: 0;
  }

  ::v-deep .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #ebeef5;
  }
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #ebeef5;
}

.modal-body {
  padding: 20px 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  padding: 9px 20px;
  border-color: #dcdfe6;
  color: #606266;

  &:hover {
    color: #4f7cff;
    border-color: #4f7cff;
  }
}

.submit-btn {
  padding: 9px 24px;
  background: #4f7cff;
  border-color: #4f7cff;

  &:hover {
    background: #3d6aea;
    border-color: #3d6aea;
  }
}

.full-width {
  width: 100%;
}

.activity-type-group {
  display: flex;
  gap: 16px;
}

.type-option {
  flex: 1;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  transition: all 0.3s;

  &:hover {
    border-color: #4f7cff;
    color: #4f7cff;
  }

  &.active {
    background: #f0f5ff;
    border-color: #4f7cff;
    color: #4f7cff;
  }
}

.form-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.optional-label {
  display: inline-block;
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}

.classroom-selector {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
}

.classroom-selector .search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 12px;
}

.classroom-selector .search-box i {
  color: #909399;
  font-size: 14px;
}

.classroom-selector .search-box input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #606266;
  background: transparent;
}

.classroom-list {
  max-height: 200px;
  overflow-y: auto;
}

.classroom-item {
  padding: 8px 0;
}

.classroom-item ::v-deep .el-checkbox {
  display: flex;
  align-items: center;
  width: 100%;
}

.classroom-item ::v-deep .el-checkbox__label {
  flex: 1;
  display: flex;
  justify-content: space-between;
  padding-left: 8px;
}

.classroom-location {
  color: #909399;
  font-size: 13px;
}

::v-deep .el-form-item__label {
  font-size: 14px;
  color: #606266;
  padding-bottom: 8px;
  line-height: 20px;
}

::v-deep .el-form-item {
  margin-bottom: 20px;
}

::v-deep .el-form-item.is-required .el-form-item__label::before {
  content: "*";
  color: #f56c6c;
  margin-right: 4px;
}

::v-deep .el-input__inner {
  height: 36px;
  line-height: 36px;
}

::v-deep .el-select .el-input__inner {
  height: 36px;
  line-height: 36px;
}

::v-deep .el-date-editor.el-input {
  width: 100%;
}

::v-deep .el-date-editor .el-input__inner {
  height: 36px;
  line-height: 36px;
}
</style>
