<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    width="560px"
    :show-close="false"
    custom-class="new-schedule-modal"
    @close="handleClose"
    top="10vh"
  >
    <div slot="title" class="modal-header">
      <h2 class="modal-title">{{ dialogTitle }}</h2>
      <button class="close-btn" @click="handleClose">
        <i class="el-icon-close"></i>
      </button>
    </div>

    <div class="modal-body">
      <el-form ref="form" :model="form" :rules="rules" label-position="top">
        <el-form-item label="上课时间" prop="lessonDate">
          <el-date-picker
            v-model="form.lessonDate"
            type="date"
            placeholder="年/月/日"
            class="full-width"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>

        <el-form-item label="上课老师" prop="teacherId" class="teacher-form-item">
          <div class="search-select-wrapper" v-click-outside="closeTeacherDropdown">
            <div class="search-input-box">
              <i class="el-icon-search"></i>
              <input
                type="text"
                v-model="teacherSearchText"
                placeholder="搜索教师姓名、学校或学段..."
                @input="handleTeacherSearchInput"
                @focus="showTeacherDropdown = true"
              />
              <i v-if="form.teacherId" class="el-icon-circle-close clear-icon" @click="clearTeacher"></i>
            </div>
            <div v-if="showTeacherDropdown" class="search-dropdown">
              <template v-if="filteredTeacherList.length > 0">
                <div
                  v-for="item in filteredTeacherList"
                  :key="item.id"
                  class="dropdown-item"
                  @click="handleTeacherSelect(item)"
                >
                  <div class="dropdown-item-main">
                    <span class="teacher-name">{{ item.teacherName }}</span>
                    <span class="teacher-stage-badge">{{ item.stageName }}</span>
                  </div>
                  <div class="dropdown-item-sub">{{ item.schoolName }}</div>
                </div>
              </template>
              <div v-else class="dropdown-empty">未找到匹配的教师</div>
            </div>
            <div class="search-hint">支持按教师姓名、学校或学段搜索</div>
          </div>
        </el-form-item>

        <el-form-item label="课程" prop="courseId">
          <el-select
            v-model="form.courseId"
            placeholder="请选择课程"
            class="full-width"
            :disabled="!form.teacherId"
          >
            <el-option
              v-for="item in courseList"
              :key="item.id"
              :label="item.courseName"
              :value="item.id"
            ></el-option>
          </el-select>
          <div v-if="!form.teacherId" class="form-hint">请先选择上课老师</div>
        </el-form-item>

        <el-form-item label="课时" prop="periodId">
          <el-select
            v-model="form.periodId"
            placeholder="请选择课时"
            class="full-width"
            :disabled="!form.teacherId"
          >
            <el-option
              v-for="item in periodList"
              :key="item.id"
              :label="`${item.periodName} (${item.startTime}-${item.endTime})`"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="上课地点" prop="location">
          <el-input v-model="form.location" placeholder="请输入上课地点，如：教学楼A-101" class="full-width"></el-input>
        </el-form-item>

        <div class="category-tag-section">
          <div class="category-row">
            <label class="category-label">分类</label>
            <el-select
              v-model="form.tagCategoryId"
              placeholder="请选择课程分类"
              class="category-select"
              style="flex: 1; min-width: 0;"
              @change="handleCategoryChange"
            >
              <el-option
                v-for="item in categoryList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </div>
          <div v-if="form.tagCategoryId && tagList.length > 0" class="tag-section">
            <div class="tag-checkbox-group">
              <label
                v-for="tag in tagList"
                :key="tag.id"
                class="tag-checkbox-item"
              >
                <el-checkbox
                  :value="isTagSelected(tag.id)"
                  @change="(val) => handleTagChange(tag, val)"
                ></el-checkbox>
                <span class="tag-name">{{ tag.name }}</span>
              </label>
            </div>
            <div class="tag-hint">
              <i class="el-icon-circle-check"></i>
              <span>已根据所选分类智能推荐相关标签</span>
            </div>
          </div>
        </div>

        <el-form-item label="主讲教室" prop="mainClassroomAccountId" class="classroom-form-item">
          <div class="classroom-container" v-click-outside="closeMainClassroomDropdown">
            <div v-if="form.mainClassroomAccountId" class="selected-classroom">
              <span class="classroom-badge">
                {{ getDeviceName(form.mainClassroomAccountId) }}
                <span v-if="getDeviceDept(form.mainClassroomAccountId)" class="badge-location">
                  ({{ getDeviceDept(form.mainClassroomAccountId) }})
                </span>
                <i class="el-icon-close badge-close" @click="clearMainClassroom"></i>
              </span>
            </div>
            <div class="search-input-box">
              <i class="el-icon-search"></i>
              <input
                type="text"
                v-model="mainClassroomSearch"
                placeholder="搜索教室名称或地点..."
                @input="handleMainClassroomSearchInput"
                @focus="showMainClassroomDropdown = true"
              />
            </div>
            <div v-if="showMainClassroomDropdown" class="search-dropdown">
              <template v-if="filteredMainClassroomList.length > 0">
                <div
                  v-for="item in filteredMainClassroomList"
                  :key="item.id"
                  class="dropdown-item"
                  @click="handleMainClassroomSelect(item)"
                >
                  <div class="dropdown-item-main">
                    <span>{{ item.name }}</span>
                    <span v-if="item.deptNamePath" class="dropdown-item-location">{{ item.deptNamePath }}</span>
                  </div>
                </div>
              </template>
              <div v-else class="dropdown-empty">未找到匹配的教室</div>
            </div>
          </div>
        </el-form-item>

        <el-form-item class="assist-form-item">
          <div class="assist-classroom-header" slot="label">
            <span>辅讲教室</span>
            <span class="assist-hint">(选择教室后需关联辅讲教师)</span>
          </div>
          <div class="classroom-container" v-click-outside="closeAssistClassroomDropdown">
            <div v-if="form.assistClassrooms.length > 0" class="selected-assist-list">
              <div v-for="(assist, index) in form.assistClassrooms" :key="assist.accountId" class="assist-item">
                <div class="assist-item-header">
                  <span class="classroom-badge">
                    {{ getDeviceName(assist.accountId) }}
                    <span v-if="getDeviceDept(assist.accountId)" class="badge-location">
                      ({{ getDeviceDept(assist.accountId) }})
                    </span>
                  </span>
                  <i class="el-icon-close assist-remove" @click="removeAssistClassroom(index)"></i>
                </div>
                <div class="assist-teacher-row">
                  <span class="assist-teacher-label">辅讲教师：</span>
                  <el-select
                    v-model="assist.teacherId"
                    placeholder="请选择辅讲教师"
                    class="assist-teacher-select"
                  >
                    <el-option
                      v-for="t in assistTeacherList"
                      :key="t.id"
                      :label="t.teacherName"
                      :value="t.id"
                    ></el-option>
                  </el-select>
                </div>
              </div>
            </div>
            <div class="search-input-box">
              <i class="el-icon-search"></i>
              <input
                type="text"
                v-model="assistClassroomSearch"
                placeholder="搜索教室名称..."
                @input="handleAssistClassroomSearchInput"
                @focus="showAssistClassroomDropdown = true"
              />
            </div>
            <div v-if="showAssistClassroomDropdown" class="search-dropdown">
              <template v-if="filteredAssistClassroomList.length > 0">
                <div
                  v-for="item in filteredAssistClassroomList"
                  :key="item.id"
                  class="dropdown-item"
                  @click="handleAssistClassroomSelect(item)"
                >
                  <div class="dropdown-item-main">
                    <span>{{ item.name }}</span>
                    <span v-if="item.deptNamePath" class="dropdown-item-location">{{ item.deptNamePath }}</span>
                  </div>
                </div>
              </template>
              <div v-else class="dropdown-empty">未找到匹配的教室</div>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <div slot="footer" class="modal-footer">
      <el-button class="cancel-btn" @click="handleClose">取消</el-button>
      <el-button type="primary" class="submit-btn" v-loading="loading" @click="handleSubmit">
        {{ mode === 'edit' ? '保存修改' : '确认新增' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import teacher from '@/api/teacher';
import course from '@/api/course';
import classPeriod from '@/api/classPeriod';
import resourceTag from '@/api/resourceTag';
import device from '@/api/device';
import schedule from '@/api/schedule';

export default {
  name: 'NewScheduleModal',
  directives: {
    clickOutside: {
      bind(el, binding) {
        el._clickOutside = function (e) {
          if (!el.contains(e.target)) {
            binding.value();
          }
        };
        document.addEventListener('click', el._clickOutside);
      },
      unbind(el) {
        document.removeEventListener('click', el._clickOutside);
      },
    },
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: 'create',
      validator: value => ['create', 'edit', 'copy'].includes(value),
    },
    scheduleData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      form: {
        lessonDate: '',
        teacherId: null,
        courseId: null,
        periodId: null,
        location: '',
        tagCategoryId: null,
        tagInfoList: [],
        mainClassroomAccountId: '',
        assistClassrooms: [],
      },
      teacherList: [],
      courseList: [],
      periodList: [],
      categoryList: [],
      tagList: [],
      deviceList: [],
      allTeacherPageList: [],
      teacherSearchText: '',
      showTeacherDropdown: false,
      mainClassroomSearch: '',
      showMainClassroomDropdown: false,
      assistClassroomSearch: '',
      showAssistClassroomDropdown: false,
      selectedTeacherData: null,
      loading: false,
      rules: {
        lessonDate: [{ required: true, message: '请选择上课时间', trigger: 'change' }],
        teacherId: [{ required: true, message: '请选择上课老师', trigger: 'change' }],
        courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
        periodId: [{ required: true, message: '请选择课时', trigger: 'change' }],
        location: [{ required: true, message: '请填写上课地点', trigger: 'blur' }],
        mainClassroomAccountId: [{ required: true, message: '请选择主讲教室', trigger: 'change' }],
      },
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      },
    },
    dialogTitle() {
      const titleMap = {
        create: '新增排课',
        edit: '编辑排课',
        copy: '复制排课',
      };
      return titleMap[this.mode] || '新增排课';
    },
    filteredTeacherList() {
      if (!this.teacherSearchText) return this.teacherList;
      const keyword = this.teacherSearchText.toLowerCase();
      return this.teacherList.filter(
        t =>
          (t.teacherName && t.teacherName.toLowerCase().includes(keyword)) ||
          (t.schoolName && t.schoolName.toLowerCase().includes(keyword)) ||
          (t.stageName && t.stageName.toLowerCase().includes(keyword))
      );
    },
    mainClassroomAvailableList() {
      const assistIds = this.form.assistClassrooms.map(a => a.accountId);
      return this.deviceList.filter(d => !assistIds.includes(d.id));
    },
    filteredMainClassroomList() {
      let list = this.mainClassroomAvailableList;
      if (this.mainClassroomSearch) {
        const keyword = this.mainClassroomSearch.toLowerCase();
        list = list.filter(
          d =>
            (d.name && d.name.toLowerCase().includes(keyword)) ||
            (d.deptNamePath && d.deptNamePath.toLowerCase().includes(keyword))
        );
      }
      return list;
    },
    assistClassroomAvailableList() {
      const list = this.deviceList.filter(d => d.id !== this.form.mainClassroomAccountId);
      const existingIds = this.form.assistClassrooms.map(a => a.accountId);
      return list.filter(d => !existingIds.includes(d.id));
    },
    filteredAssistClassroomList() {
      let list = this.assistClassroomAvailableList;
      if (this.assistClassroomSearch) {
        const keyword = this.assistClassroomSearch.toLowerCase();
        list = list.filter(
          d =>
            (d.name && d.name.toLowerCase().includes(keyword)) ||
            (d.deptNamePath && d.deptNamePath.toLowerCase().includes(keyword))
        );
      }
      return list;
    },
    assistTeacherList() {
      return this.allTeacherPageList.filter(t => t.id !== this.form.teacherId);
    },
  },
  watch: {
    visible: {
      handler(newVal) {
        if (newVal) {
          this.initModal();
        }
      },
    },
  },
  methods: {
    async initModal() {
      this.resetForm();
      await Promise.all([
        this.loadTeacherList(),
        this.loadDeviceList(),
        this.loadCategoryList(),
        this.loadAllTeacherPageList(),
      ]);
      if ((this.mode === 'edit' || this.mode === 'copy') && this.scheduleData && this.scheduleData.id) {
        await this.populateFormData();
      }
    },
    async loadTeacherList() {
      try {
        const res = await teacher.list();
        if (res.code === 200 && res.data) {
          this.teacherList = res.data;
        }
      } catch (error) {
        console.error('加载教师列表失败:', error);
      }
    },
    async loadCourseList(stageId) {
      try {
        const res = await course.page({ stageId, pageNum: 1, pageSize: 200 });
        if (res.code === 200 && res.data) {
          this.courseList = res.data.list || [];
        }
      } catch (error) {
        console.error('加载课程列表失败:', error);
      }
    },
    async loadPeriodList(stageId) {
      try {
        const res = await classPeriod.list(stageId);
        if (res.code === 200 && res.data) {
          this.periodList = res.data;
        }
      } catch (error) {
        console.error('加载课时列表失败:', error);
      }
    },
    async loadCategoryList() {
      try {
        const res = await resourceTag.categoryList();
        if (res.code === 200 && res.data) {
          this.categoryList = res.data.filter(c => c.status === 1);
        }
      } catch (error) {
        console.error('加载分类列表失败:', error);
      }
    },
    async loadTagList(categoryId) {
      try {
        const res = await resourceTag.tagList(categoryId);
        if (res.code === 200 && res.data) {
          this.tagList = res.data.filter(t => t.status === 1);
        }
      } catch (error) {
        console.error('加载标签列表失败:', error);
      }
    },
    async loadDeviceList() {
      try {
        const res = await device.allMembers();
        if (res.code === 200 && res.data) {
          this.deviceList = res.data;
        }
      } catch (error) {
        console.error('加载设备列表失败:', error);
      }
    },
    async loadAllTeacherPageList() {
      try {
        const res = await teacher.page({ pageNum: 1, pageSize: 200, status:1 });
        if (res.code === 200 && res.data) {
          this.allTeacherPageList = res.data.list || [];
        }
      } catch (error) {
        console.error('加载全部教师列表失败:', error);
      }
    },
    async populateFormData() {
      const data = this.scheduleData;
      this.form.lessonDate = data.lessonDate || '';
      this.form.teacherId = data.teacherId || null;
      this.form.courseId = data.courseId || null;
      this.form.periodId = data.periodId || null;
      this.form.location = data.location || '';
      this.form.tagCategoryId = data.tagCategoryId || null;

      const selectedTeacher = this.teacherList.find(t => t.id === data.teacherId);
      if (selectedTeacher) {
        this.selectedTeacherData = selectedTeacher;
        this.teacherSearchText = `${selectedTeacher.teacherName} - ${selectedTeacher.schoolName} - ${selectedTeacher.stageName}`;
        await this.loadCourseList(selectedTeacher.stageId);
        await this.loadPeriodList(selectedTeacher.stageId);
      }

      if (data.tagCategoryId) {
        await this.loadTagList(data.tagCategoryId);
      }

      if (data.tagInfoList && data.tagInfoList.length > 0) {
        this.form.tagInfoList = data.tagInfoList.map(t => ({ tagId: t.tagId, tagName: t.tagName }));
      }

      if (data.accountInfoList && data.accountInfoList.length > 0) {
        const mainAccount = data.accountInfoList.find(a => a.teachType === 1);
        const assistAccounts = data.accountInfoList.filter(a => a.teachType === 2);

        if (mainAccount) {
          this.form.mainClassroomAccountId = mainAccount.accountId;
          const mainDevice = this.deviceList.find(d => d.id === mainAccount.accountId);
          if (mainDevice) {
            this.mainClassroomSearch = '';
          }
        }

        this.form.assistClassrooms = assistAccounts.map(a => ({
          accountId: a.accountId,
          teacherId: a.teacherId,
        }));
      }
    },
    handleTeacherSearchInput() {
      this.showTeacherDropdown = true;
      if (!this.teacherSearchText) {
        this.form.teacherId = null;
        this.selectedTeacherData = null;
        this.courseList = [];
        this.periodList = [];
        this.form.courseId = null;
        this.form.periodId = null;
      }
    },
    async handleTeacherSelect(item) {
      this.form.teacherId = item.id;
      this.selectedTeacherData = item;
      this.teacherSearchText = `${item.teacherName} - ${item.schoolName} - ${item.stageName}`;
      this.showTeacherDropdown = false;
      this.form.courseId = null;
      this.form.periodId = null;
      this.courseList = [];
      this.periodList = [];
      await this.loadCourseList(item.stageId);
      await this.loadPeriodList(item.stageId);
    },
    clearTeacher() {
      this.form.teacherId = null;
      this.selectedTeacherData = null;
      this.teacherSearchText = '';
      this.form.courseId = null;
      this.form.periodId = null;
      this.courseList = [];
      this.periodList = [];
    },
    closeTeacherDropdown() {
      this.showTeacherDropdown = false;
    },
    async handleCategoryChange(categoryId) {
      this.form.tagInfoList = [];
      this.tagList = [];
      if (categoryId) {
        await this.loadTagList(categoryId);
      }
    },
    isTagSelected(tagId) {
      return this.form.tagInfoList.some(t => t.tagId === tagId);
    },
    handleTagChange(tag, checked) {
      if (checked) {
        if (!this.form.tagInfoList.some(t => t.tagId === tag.id)) {
          this.form.tagInfoList.push({ tagId: tag.id, tagName: tag.name });
        }
      } else {
        this.form.tagInfoList = this.form.tagInfoList.filter(t => t.tagId !== tag.id);
      }
    },
    handleMainClassroomSearchInput() {
      this.showMainClassroomDropdown = true;
    },
    handleMainClassroomSelect(item) {
      this.form.mainClassroomAccountId = item.id;
      this.showMainClassroomDropdown = false;
      this.mainClassroomSearch = '';
    },
    clearMainClassroom() {
      this.form.mainClassroomAccountId = '';
      this.mainClassroomSearch = '';
    },
    closeMainClassroomDropdown() {
      this.showMainClassroomDropdown = false;
    },
    handleAssistClassroomSearchInput() {
      this.showAssistClassroomDropdown = true;
    },
    handleAssistClassroomSelect(item) {
      this.form.assistClassrooms.push({
        accountId: item.id,
        teacherId: null,
      });
      this.showAssistClassroomDropdown = false;
      this.assistClassroomSearch = '';
    },
    removeAssistClassroom(index) {
      this.form.assistClassrooms.splice(index, 1);
    },
    closeAssistClassroomDropdown() {
      this.showAssistClassroomDropdown = false;
    },
    getDeviceName(accountId) {
      const device = this.deviceList.find(d => d.id === accountId);
      return device ? device.name : '';
    },
    getDeviceDept(accountId) {
      const device = this.deviceList.find(d => d.id === accountId);
      return device && device.deptNamePath ? device.deptNamePath : '';
    },
    buildAccountInfoList() {
      const list = [];
      if (this.form.mainClassroomAccountId) {
        const mainDevice = this.deviceList.find(d => d.id === this.form.mainClassroomAccountId);
        list.push({
          teacherId: this.form.teacherId,
          teachType: 1,
          accountId: this.form.mainClassroomAccountId,
          name: mainDevice ? mainDevice.name : '',
          deptNamePath: mainDevice ? mainDevice.deptNamePath : '',
          number: mainDevice ? mainDevice.number || '' : '',
          thirdAccount: mainDevice ? mainDevice.thirdAccount || '' : '',
          type: mainDevice ? mainDevice.type : '',
          location: mainDevice && mainDevice.deptNamePath ? mainDevice.deptNamePath : '',
        });
      }
      this.form.assistClassrooms.forEach(assist => {
        const assistDevice = this.deviceList.find(d => d.id === assist.accountId);
        list.push({
          teacherId: assist.teacherId,
          teachType: 2,
          accountId: assist.accountId,
          name: assistDevice ? assistDevice.name : '',
          deptNamePath: assistDevice ? assistDevice.deptNamePath : '',
          number: assistDevice ? assistDevice.number || '' : '',
          thirdAccount: assistDevice ? assistDevice.thirdAccount || '' : '',
          type: assistDevice ? assistDevice.type : '',
          location: assistDevice && assistDevice.deptNamePath ? assistDevice.deptNamePath : '',
        });
      });
      return list;
    },
    handleClose() {
      this.dialogVisible = false;
      this.resetForm();
    },
    resetForm() {
      this.form = {
        lessonDate: '',
        teacherId: null,
        courseId: null,
        periodId: null,
        location: '',
        tagCategoryId: null,
        tagInfoList: [],
        mainClassroomAccountId: '',
        assistClassrooms: [],
      };
      this.teacherSearchText = '';
      this.mainClassroomSearch = '';
      this.assistClassroomSearch = '';
      this.showTeacherDropdown = false;
      this.showMainClassroomDropdown = false;
      this.showAssistClassroomDropdown = false;
      this.selectedTeacherData = null;
      this.courseList = [];
      this.periodList = [];
      this.tagList = [];
      this.$refs.form && this.$refs.form.resetFields();
    },
    handleSubmit() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          try {
            this.loading = true;
            const requestData = {
              lessonDate: this.form.lessonDate,
              teacherId: this.form.teacherId,
              courseId: this.form.courseId,
              periodId: this.form.periodId,
              location: this.form.location,
              accountInfoList: this.buildAccountInfoList(),
            };

            if (this.selectedTeacherData) {
              requestData.stageId = this.selectedTeacherData.stageId;
            }

            const selectedCourse = this.courseList.find(c => c.id === this.form.courseId);
            if (selectedCourse) {
              requestData.subjectId = selectedCourse.subjectId;
            }

            if (this.form.tagCategoryId) {
              requestData.tagCategoryId = this.form.tagCategoryId;
            }
            if (this.form.tagInfoList.length > 0) {
              requestData.tagInfoList = this.form.tagInfoList;
            }

            let res;
            if (this.mode === 'edit') {
              res = await schedule.update(this.scheduleData.id, requestData);
            } else {
              res = await schedule.add(requestData);
            }

            if (res.code === 200) {
              this.loading = false;
              const successMessage = this.mode === 'edit' ? '编辑成功' : '排课成功';
              this.$message.success(successMessage);
              this.$emit('submit', { ...this.form, mode: this.mode });
              this.handleClose();
            } else {
              this.$message.error(res.message || '操作失败');
            }
          } catch (error) {
            console.error('操作失败:', error);
            this.$message.error('操作失败，请稍后重试');
          } finally {
            this.loading = false;
          }
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.new-schedule-modal {
  ::v-deep .el-dialog__header {
    padding: 0;
  }

  ::v-deep .el-dialog__body {
    padding: 0;
  }

  ::v-deep .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
// padding: 16px 24px;
 // background: linear-gradient(to right, #2563eb, #1d4ed8);
  border-radius: 8px 8px 0 0;
}

.modal-title {
  font-size: 17px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.modal-body {
  padding: 24px;
  max-height: 65vh;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  padding: 9px 20px;
  border-color: #d1d5db;
  color: #6b7280;

  &:hover {
    color: #2563eb;
    border-color: #2563eb;
  }
}

.submit-btn {
  padding: 9px 24px;
  background: #2563eb;
  border-color: #2563eb;

  &:hover {
    background: #1d4ed8;
    border-color: #1d4ed8;
  }
}

.full-width {
  width: 100%;
}

.form-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.search-select-wrapper {
  position: relative;
}

.search-input-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;

  i:first-child {
    color: #9ca3af;
    font-size: 14px;
    flex-shrink: 0;
  }

  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
    color: #374151;
    background: transparent;

    &::placeholder {
      color: #9ca3af;
    }
  }

  .clear-icon {
    color: #9ca3af;
    cursor: pointer;
    font-size: 14px;
    flex-shrink: 0;

    &:hover {
      color: #6b7280;
    }
  }
}

.search-dropdown {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 100;
  margin-top: 4px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  max-height: 240px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 10px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #eff6ff;
  }
}

.dropdown-item-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.teacher-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.teacher-stage-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.dropdown-item-sub {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.dropdown-item-location {
  font-size: 12px;
  color: #6b7280;
}

.dropdown-empty {
  padding: 12px 16px;
  font-size: 14px;
  color: #9ca3af;
  text-align: center;
}

.search-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.category-tag-section {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  background: #fff;
}

.category-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 0;
}

.category-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.category-select {
  flex: 1;
}

.tag-section {
  padding-top: 12px;
}

.tag-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  padding-left: 8px;
}

.tag-checkbox-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.15s;

  &:hover {
    background: #f9fafb;
  }
}

.tag-name {
  font-size: 14px;
  color: #374151;
}

.tag-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 8px;
  font-size: 12px;
  color: #9ca3af;

  i {
    color: #9ca3af;
  }
}

.classroom-container {
  position: relative;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 12px;
  background: #fff;
}

.selected-classroom {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.classroom-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  background: #dbeafe;
  color: #1d4ed8;
  border: 1px solid #93c5fd;
}

.badge-location {
  color: #60a5fa;
}

.badge-close {
  margin-left: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #93c5fd;

  &:hover {
    color: #1d4ed8;
  }
}

.selected-assist-list {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.assist-item {
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.assist-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.assist-remove {
  color: #9ca3af;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    color: #ef4444;
  }
}

.assist-teacher-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.assist-teacher-label {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
}

.assist-teacher-select {
  flex: 1;
}

.assist-classroom-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.assist-hint {
  font-size: 12px;
  color: #9ca3af;
}

::v-deep .el-form-item__label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  padding-bottom: 8px;
  line-height: 20px;
}

::v-deep .el-form-item {
  margin-bottom: 20px;
}

::v-deep .el-form-item.is-required .el-form-item__label::before {
  content: '*';
  color: #ef4444;
  margin-right: 4px;
}

::v-deep .el-input__inner {
  height: 38px;
  line-height: 38px;
  border-radius: 8px;
  border-color: #d1d5db;

  &:focus {
    border-color: #2563eb;
  }
}

::v-deep .el-select .el-input__inner {
  height: 38px;
  line-height: 38px;
}

::v-deep .el-date-editor.el-input {
  width: 100%;
}

::v-deep .el-date-editor .el-input__inner {
  height: 38px;
  line-height: 38px;
}

::v-deep .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #2563eb;
  border-color: #2563eb;
}

::v-deep .el-checkbox__inner:hover {
  border-color: #2563eb;
}
</style>
