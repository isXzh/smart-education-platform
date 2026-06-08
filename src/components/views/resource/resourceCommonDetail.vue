<template>
  <div class="video-detail-page">
    <!-- 顶部导航栏 -->
    <div class="top-navbar">
      <div class="navbar-left">
        <div class="back-btn" @click="goBack">
          <i class="el-icon-arrow-left"></i>
          <span>返回资源列表</span>
        </div>
        <span class="file-name">{{ detailData.title || detailData.fileName || '未知资源' }}</span>
      </div>
      <div class="navbar-right">
        <div class="action-btn" @click="downloadVideo">
          <i class="el-icon-download"></i>
          <span>下载</span>
        </div>
      </div>
    </div>

    <!-- 编目未完成时的界面：只显示视频和进度 -->
    <div v-if="catalogStatus !== 2" class="analyzing-overlay">
      <!-- 左侧：视频播放器 -->
      <div class="left-section" style="width: 100%; max-width: 800px; margin: 0 auto">
        <div class="video-player-wrapper">
          <!-- 封面图（始终显示封面，未播放时隐藏视频） -->
          <div v-if="!isPlaying" class="video-cover-wrapper">
            <img
              v-if="detailData.coverUrl"
              class="video-cover"
              :src="getVideoPoster(detailData.coverUrl)"
              alt="视频封面"
              loading="eager"
              fetchpriority="high"
            />
            <div v-else class="video-cover video-cover-default"></div>
            <!-- 播放按钮覆盖层 -->
            <div class="video-play-overlay" @click="playVideo">
              <div class="play-button"><div class="play-icon"></div></div>
            </div>
          </div>
          <!-- 视频元素：点击播放后才加载 -->
          <video
            v-if="loadedVideoUrl && isPlaying"
            ref="videoPlayer"
            class="video-player"
            :src="loadedVideoUrl"
            controls
            autoplay
            preload="auto"
          >
            您的浏览器不支持视频播放
          </video>
          <div v-else-if="!detailData.videoUrl" class="video-placeholder">
            <i class="el-icon-video-camera" style="font-size: 64px; margin-bottom: 16px; opacity: 0.5"></i>
            <p>视频文件不存在</p>
          </div>
        </div>
      </div>

      <!-- 进度提示 -->
      <div class="analyzing-hint">
        <div class="analyzing-hint__icon">
          <i class="el-icon-loading" style="font-size: 48px; color: #409eff"></i>
        </div>
        <p class="analyzing-hint__text">AI编目进行中</p>
        <p class="analyzing-hint__sub">
          <el-progress
            :percentage="catalogProgress"
            :stroke-width="8"
            :show-text="true"
            style="width: 300px; margin: 0 auto"
          />
          <span style="margin-top: 12px; display: block">正在分析视频内容，请稍候...</span>
        </p>
      </div>
    </div>

    <!-- 编目完成时的界面：完整布局 -->
    <div v-else class="main-container">
      <!-- 左侧视频区域 -->
      <div class="left-section">
        <div class="video-player-wrapper">
          <!-- 封面图（始终显示封面，未播放时隐藏视频） -->
          <div v-if="!isPlaying" class="video-cover-wrapper">
            <img
              v-if="detailData.coverUrl"
              class="video-cover"
              :src="getVideoPoster(detailData.coverUrl)"
              alt="视频封面"
              loading="eager"
              fetchpriority="high"
            />
            <div v-else class="video-cover video-cover-default"></div>
            <!-- 播放按钮覆盖层 -->
            <div class="video-play-overlay" @click="playVideo">
              <div class="play-button"><div class="play-icon"></div></div>
            </div>
          </div>
          <!-- 视频元素：点击播放后才加载 -->
          <video
            v-if="loadedVideoUrl && isPlaying"
            ref="videoPlayer"
            class="video-player"
            :src="loadedVideoUrl"
            controls
            autoplay
            preload="auto"
          >
            您的浏览器不支持视频播放
          </video>
          <div v-else-if="!detailData.videoUrl" class="video-placeholder">
            <i class="el-icon-video-camera" style="font-size: 64px; margin-bottom: 16px; opacity: 0.5"></i>
            <p>视频文件不存在</p>
          </div>
        </div>

        <!-- 编目完成时才显示关键帧时间轴 -->
        <div v-if="catalogStatus === 2" class="keyframe-timeline">
          <div class="timeline-header">
            <span>智能拆条 ({{ keyframes.length }} 个片段)</span>
            <button v-if="selectedFrameIndex >= 0" class="collapse-btn" @click="collapseSceneDetail">收起详情</button>
          </div>
          <div class="timeline-content">
            <div class="keyframes-row">
              <div
                v-for="(frame, index) in keyframes"
                :key="index"
                class="keyframe-item"
                :class="{ active: selectedFrameIndex === index }"
              >
                <div class="keyframe-thumb" @click="selectKeyframe(frame, index)">
                  <img
                    v-if="frame.thumbnail && !failedImages[index]"
                    :src="getProxiedImageUrl(frame.thumbnail)"
                    alt=""
                    @error="onImageError($event, index)"
                  />
                  <div v-else class="keyframe-placeholder">
                    <span class="placeholder-text">{{ formatTime(frame.timestamp || 0) }}</span>
                  </div>
                  <div v-if="selectedFrameIndex === index" class="selected-indicator">✓</div>
                </div>
                <div class="keyframe-time">片段 {{ index + 1 }}</div>
              </div>
              <div v-if="keyframes.length === 0" class="keyframes-empty">
                <p>暂无关键帧数据</p>
              </div>
            </div>
            <!-- 统一详情面板 -->
            <div v-if="selectedFrame && selectedFrame.scene" class="scene-detail-panel">
              <div class="detail-header">
                <span class="detail-time"
                  >{{ formatTime(selectedFrame.scene.startTime) }} - {{ formatTime(selectedFrame.scene.endTime) }}</span
                >
                <span class="detail-tip">点击其他帧可切换</span>
              </div>
              <div v-if="selectedFrame.scene.sceneSummary" class="detail-row">
                <span class="detail-label">画面描述：</span>
                <span class="detail-text">{{ selectedFrame.scene.sceneSummary }}</span>
              </div>
              <div v-if="selectedFrame.scene.smartRead" class="detail-row">
                <span class="detail-label">语音内容：</span>
                <span class="detail-text">{{ selectedFrame.scene.smartRead }}</span>
              </div>
              <div
                v-if="
                  !selectedFrame.scene.sceneSummary && !selectedFrame.scene.smartRead && selectedFrame.scene.description
                "
                class="detail-row"
              >
                <span class="detail-text">{{ selectedFrame.scene.description }}</span>
              </div>
              <div v-if="selectedFrame.scene.tags && selectedFrame.scene.tags.length > 0" class="detail-tags">
                <el-tag v-for="tag in selectedFrame.scene.tags" :key="tag" size="small" type="info">{{ tag }}</el-tag>
              </div>
            </div>
            <div v-else-if="selectedFrameIndex >= 0" class="scene-detail-panel scene-detail-empty">
              <span class="empty-text">该片段暂无详细描述</span>
            </div>
          </div>
        </div>

        <!-- 编目未完成时的提示 -->
        <div v-else class="keyframe-timeline" style="text-align: center; padding: 40px; color: #909399">
          <i class="el-icon-loading" style="font-size: 32px; margin-bottom: 16px"></i>
          <p>AI编目进行中，完成后将显示智能拆条内容</p>
        </div>
      </div>

      <!-- 右侧Tab面板 -->
      <div class="right-section">
        <div class="tabs-header">
          <div
            v-for="tab in tabs"
            :key="tab.name"
            :class="['tab-item', { active: activeTab === tab.name }]"
            @click="activeTab = tab.name"
          >
            {{ tab.label }}
          </div>
        </div>
        <div :class="['tabs-content', { 'tabs-content--mindmap': activeTab === 'mindmap' }]">
          <!-- 编目 Tab -->
          <div v-show="activeTab === 'catalog'">
            <div v-if="catalogStatus !== 2" class="loading-container">
              <i class="el-icon-loading"></i>
              <span>{{ catalogStatus === 1 ? 'AI编目进行中...' : '暂无编目数据' }}</span>
            </div>
            <div v-else-if="catalogLoading" class="loading-container">
              <i class="el-icon-loading"></i>
              <span>加载中...</span>
            </div>
            <div v-else class="catalog-container">
              <div class="catalog-content">
                <!-- 视频描述区域 -->
                <div class="section description-section">
                  <div class="description-content">
                    {{ catalogData.introSummary || '暂无描述信息' }}
                    <span v-if="showExpandBtn" class="expand-btn" @click="toggleExpand">{{
                      isExpanded ? '收起' : '展开'
                    }}</span>
                  </div>
                </div>
                <!-- 人物识别区域 -->
                <div class="section">
                  <div class="section-header">
                    <span class="section-title">人物识别</span>
                  </div>
                  <div class="faces-content">
                    <div v-if="!catalogData.faceTags || catalogData.faceTags.length === 0" class="empty-state">
                      暂无
                    </div>
                    <div v-else class="faces-grid">
                      <div v-for="(face, index) in catalogData.faceTags" :key="index" class="face-item">
                        <div class="face-thumbnail">
                          <img v-if="face.imageUrl" :src="getProxiedImageUrl(face.imageUrl)" alt="人脸" />
                        </div>
                        <div class="face-info">
                          <span class="face-name">{{ face.tagValue || '未知' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 物体识别区域 -->
                <div class="section">
                  <div class="section-header">
                    <span class="section-title">物体识别</span>
                  </div>
                  <div class="object-recognition">
                    <div
                      v-for="(obj, index) in catalogData.objectTags || defaultObjects"
                      :key="index"
                      :class="['object-item', { active: index === 0 }]"
                    >
                      <div class="object-thumbnail">
                        <img v-if="obj.imageUrl" :src="getProxiedImageUrl(obj.imageUrl)" :alt="obj.tagValue" />
                        <div v-else class="thumbnail-placeholder">
                          <i class="el-icon-picture"></i>
                        </div>
                      </div>
                      <div class="object-label">{{ obj.tagValue || obj.name || '未知' }}</div>
                    </div>
                  </div>
                </div>
                <!-- 视频标签区域 -->
                <div class="section tags-section">
                  <div class="section-header">
                    <span class="section-title">视频标签</span>
                    <!-- <el-button type="primary" size="small" class="edit-tag-btn" @click="showAddTagDialog"
                      >编辑标签</el-button
                    > -->
                  </div>
                  <div class="tags-container">
                    <div class="tags-row">
                      <span v-for="(tag, index) in allTags" :key="index" class="video-tag">{{ tag }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 导读 Tab -->
          <div v-show="activeTab === 'guide'">
            <div v-if="catalogLoading" class="loading-container">
              <i class="el-icon-loading"></i>
              <span>加载中...</span>
            </div>
            <div v-else class="guide-container">
              <div class="guide-content">
                <!-- AI概览区块 -->
                <div :class="['guide-overview', { collapsed: !guideOverviewExpanded }]">
                  <div class="guide-overview-header">
                    <span class="guide-overview-title">AI概览</span>
                    <span class="guide-overview-collapse" @click="guideOverviewExpanded = !guideOverviewExpanded">
                      {{ guideOverviewExpanded ? '收起' : '展开' }}
                    </span>
                  </div>
                  <div v-if="catalogData.introSummary" class="guide-overview-text">
                    {{ catalogData.introSummary }}
                  </div>
                  <div v-else class="guide-overview-text" style="color: #999; font-style: italic">暂无AI概览信息</div>
                </div>

                <!-- 导读子Tab - 圆角按钮 -->
                <div class="guide-tabs">
                  <div
                    v-for="tab in guideTabs"
                    :key="tab.name"
                    :class="['guide-tab-item', { active: activeGuideTab === tab.name }]"
                    @click="activeGuideTab = tab.name"
                  >
                    {{ tab.label }}
                  </div>
                </div>
                <!-- 子Tab内容 -->
                <div class="guide-tab-content">
                  <!-- 分段智读 -->
                  <div v-show="activeGuideTab === 'segments'">
                    <div
                      v-if="catalogData.sceneSegments && catalogData.sceneSegments.length > 0"
                      class="scene-segments-list"
                    >
                      <div
                        v-for="(segment, index) in catalogData.sceneSegments"
                        :key="index"
                        :class="['scene-segment-item', { 'is-expanded': expandedSegments.indexOf(index) !== -1 }]"
                      >
                        <div class="segment-header" @click="toggleSegmentExpand(index)">
                          <span class="segment-title">场景 {{ index + 1 }}</span>
                          <div style="display: flex; align-items: center">
                            <span class="segment-time"
                              >{{ formatTime(segment.startTime) }} - {{ formatTime(segment.endTime) }}</span
                            >
                            <span :class="['segment-toggle-icon', { expanded: expandedSegments.indexOf(index) !== -1 }]"
                              >∨</span
                            >
                          </div>
                        </div>
                        <div
                          :class="[
                            'segment-body',
                            { 'segment-body-collapsed': expandedSegments.indexOf(index) === -1 },
                          ]"
                        >
                          <div v-if="segment.sceneSummary || segment.description" class="segment-summary">
                            <span v-if="segment.sceneSummary">{{ segment.sceneSummary }}</span>
                            <span v-else>{{ segment.description }}</span>
                          </div>
                          <div v-if="segment.smartRead" class="segment-smart-read">
                            {{ segment.smartRead }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-else class="empty-state">
                      <p>暂无分段智读数据</p>
                    </div>
                  </div>
                  <!-- 重点解析 -->
                  <div v-show="activeGuideTab === 'keypoints'">
                    <div v-if="displayKeyPoints.length > 0" class="key-points-list">
                      <div
                        v-for="(point, index) in displayKeyPoints"
                        :key="index"
                        :class="['key-point-item', { 'is-expanded': expandedKeypoints.indexOf(index) !== -1 }]"
                      >
                        <div class="kp-header" @click="toggleKeypointExpand(index)">
                          <span class="kp-title">{{ point.title || point.point || '重点' + (index + 1) }}</span>
                          <span :class="['segment-toggle-icon', { expanded: expandedKeypoints.indexOf(index) !== -1 }]"
                            >∨</span
                          >
                        </div>
                        <div :class="['kp-body', { 'kp-body-collapsed': expandedKeypoints.indexOf(index) === -1 }]">
                          <p>{{ point.description || point.content || '' }}</p>
                        </div>
                      </div>
                    </div>
                    <div v-else class="empty-state">
                      <p>暂无重点解析数据</p>
                    </div>
                  </div>
                  <!-- 发言人总结 -->
                  <div v-show="activeGuideTab === 'speakers'">
                    <div
                      v-if="catalogData.speakerSummaries && catalogData.speakerSummaries.length > 0"
                      class="speaker-summaries-list"
                    >
                      <div
                        v-for="(summary, index) in catalogData.speakerSummaries"
                        :key="index"
                        :class="['speaker-summary-item', { 'is-expanded': expandedSpeakers.indexOf(index) !== -1 }]"
                      >
                        <div class="speaker-header" @click="toggleSpeakerExpand(index)">
                          <div class="speaker-info">
                            <i class="el-icon-user-solid"></i>
                            <span class="speaker-name">{{ summary.speaker || '发言人' + (index + 1) }}</span>
                          </div>
                          <span :class="['segment-toggle-icon', { expanded: expandedSpeakers.indexOf(index) !== -1 }]"
                            >∨</span
                          >
                        </div>
                        <div
                          :class="[
                            'speaker-body',
                            { 'speaker-body-collapsed': expandedSpeakers.indexOf(index) === -1 },
                          ]"
                        >
                          <p>{{ summary.summary || summary.content || '' }}</p>
                        </div>
                      </div>
                    </div>
                    <div v-else class="empty-state">
                      <p>暂无发言人总结数据</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 脑图 Tab -->
          <div v-show="activeTab === 'mindmap'" class="mindmap-container">
            <div v-if="catalogLoading" class="loading-container">
              <i class="el-icon-loading"></i>
              <span>加载中...</span>
            </div>
            <div v-else class="mindmap-content">
              <!-- 脑图信息栏 -->
              <div class="mindmap-info-section">
                <div class="info-row">
                  <span class="info-label">生成时间</span>
                  <span class="info-value">{{ catalogData.catalogTime || '-' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">节点数量</span>
                  <span class="info-value">{{ mindmapNodeCount }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">深度层级</span>
                  <span class="info-value">{{ mindmapDepth || '-' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">数据状态</span>
                  <el-tag type="success" size="small">已完成</el-tag>
                </div>
              </div>
              <div class="mindmap-toolbar">
                <div>
                  <el-button-group>
                    <el-button size="mini" @click="zoomOut"><i class="el-icon-zoom-out"></i></el-button>
                    <el-button size="mini" @click="zoomIn"><i class="el-icon-zoom-in"></i></el-button>
                    <el-button size="mini" @click="resetView"><i class="el-icon-refresh"></i></el-button>
                  </el-button-group>
                </div>
                <div class="zoom-display">
                  <el-select
                    v-model="currentZoomPercent"
                    size="small"
                    class="zoom-select"
                    @change="onZoomSelect"
                    placeholder="选择比例"
                  >
                    <el-option v-for="p in zoomOptions" :key="p" :label="p + '%'" :value="p" />
                  </el-select>
                </div>
              </div>
              <div class="mindmap-viz" ref="mindmapContainer"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <!-- <div class="page-footer">
      <span>V1.0 | 版权所有</span>
    </div> -->
  </div>
</template>

<script>
  import publicResourceApi from '@/api/publicResource.js';
  import * as d3 from 'd3';

  export default {
    name: 'ResourceCommonDetail',
    data() {
      return {
        resourceId: null,
        detailData: {},
        aiStatus: null,
        aiProgress: 0,
        pollTimer: null,
        catalogData: {
          introSummary: '',
          faceTags: [],
          objectTags: [],
          tags: [],
          catalogTime: '',
          keyPoints: [],
          timeline: [],
          mindMap: null,
          sceneSegments: [],
          speakerSummaries: [],
        },
        catalogLoading: false,
        isPlaying: false,
        loadedVideoUrl: '',
        keyframes: [],
        selectedFrameIndex: -1,
        selectedFrame: null,
        segmentMode: false,
        _segmentWatchActive: false,
        failedImages: {},
        activeTab: 'catalog',
        activeGuideTab: 'segments',
        guideOverviewExpanded: true,
        expandedSegments: [],
        expandedKeypoints: [],
        expandedSpeakers: [],
        isExpanded: false,
        allTags: [],
        defaultObjects: [{ name: '人', imageUrl: '' }],
        guideContent: '',
        tabs: [
          { name: 'catalog', label: '编目' },
          { name: 'guide', label: '导读' },
          { name: 'mindmap', label: '脑图' },
        ],
        guideTabs: [
          { name: 'segments', label: '片段智读' },
          { name: 'keypoints', label: '重点解析' },
          { name: 'speakers', label: '发言人总结' },
        ],
        currentZoom: 1.0,
        currentZoomPercent: 50,
        zoomOptions: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        mindmapRendered: false,
        zoomBehavior: null,
        lastVideoFileName: '',
        lastVideoFileSize: 0,
      };
    },
    computed: {
      catalogStatus() {
        const status = this.aiStatus !== undefined ? this.aiStatus : -1;
        return status !== undefined ? status : -1;
      },
      catalogProgress() {
        const progress = this.aiProgress !== undefined ? this.aiProgress : 0;
        return progress !== undefined ? progress : 0;
      },
      showExpandBtn() {
        const desc = this.catalogData.introSummary || '';
        return desc.length > 150;
      },
      displayKeyPoints() {
        const kp = this.catalogData.keyPoints || [];
        if (kp.length > 0) return kp;
        return [];
      },
      displayTimeline() {
        return this.catalogData.timeline || [];
      },
      mindmapNodeCount() {
        const tree = this.catalogData.mindMap || this.catalogData.mindmap;
        if (!tree) return 0;
        return this.countMindmapNodes(tree);
      },
      mindmapDepth() {
        const tree = this.catalogData.mindMap || this.catalogData.mindmap;
        if (!tree) return 0;
        if (tree.depth) return tree.depth;
        return this.calculateMindmapDepth(tree);
      },
    },
    watch: {
      activeTab(newVal) {
        if (newVal === 'mindmap') {
          this.$nextTick(() => {
            const container = this.$refs.mindmapContainer;
            if (container) {
              const treeData = this.catalogData.mindMap || this.catalogData.mindmap;
              this.renderMindMap(treeData);
            }
          });
        }
      },
    },
    created() {
      this.resourceId = this.$route.query.id;
      if (this.resourceId) {
        this.loadVideoDetail();
      }
    },
    beforeDestroy() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    },
    methods: {
      getVideoUrl(filePath) {
        if (!filePath) return '';
        // if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        //   return filePath;
        // }
        // const normalizedPath = filePath.replace(/\\/g, '/');
        // const fileName = normalizedPath.split('/').pop();
        // return '/uploads/resource/' + fileName;
        return window.businessURL + filePath;
      },
      getVideoPoster(coverUrl) {
        if (!coverUrl) return '';
        // if (coverUrl.startsWith('http://') || coverUrl.startsWith('https://')) {
        //   if (coverUrl.includes('192.168.100.20:9000')) {
        //     return this.getProxiedImageUrl(coverUrl);
        //   }
        //   return coverUrl;
        // }
        // if (coverUrl.startsWith('/uploads/')) {
        //   return coverUrl;
        // }
        // return coverUrl;
        return window.businessURL + coverUrl;
      },
      getProxiedImageUrl(originalUrl) {
        if (!originalUrl) return '';
        // if (!originalUrl.includes('192.168.100.20:9000')) {
        //   return originalUrl;
        // }
        // try {
        //   const encoded = encodeURIComponent(originalUrl);
        //   return '/api/base/resource/public/proxy/image?url=' + encoded;
        // } catch (e) {
        //   return originalUrl;
        // }
        return originalUrl;
      },
      goBack() {
        this.$router.go(-1);
      },
      playVideo() {
        if (!this.detailData.videoUrl) {
          this.$message.warning('视频文件不存在');
          return;
        }
        this.loadedVideoUrl = this.getVideoUrl(this.detailData.videoUrl);
        this.isPlaying = true;
        this.$nextTick(() => {
          const videoEl = this.$refs.videoPlayer;
          if (videoEl) {
            videoEl.play().catch(err => {
              console.warn('自动播放失败:', err);
            });
          }
        });
      },
      async downloadVideo() {
        if (!this.resourceId) {
          this.$message.warning('视频信息不存在');
          return;
        }
        try {
          const res = await publicResourceApi.download(this.resourceId);
          const blob = new Blob([res]);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = this.detailData.fileName || 'video.mp4';
          link.click();
          window.URL.revokeObjectURL(url);
          this.$message.success('开始下载视频');
        } catch (err) {
          this.$message.error('下载失败');
          console.error(err);
        }
      },
      async loadVideoDetail() {
        if (!this.resourceId) return;

        const storageKey = 'video_info_' + this.resourceId;
        const storedInfoStr = localStorage.getItem(storageKey);

        try {
          const res = await publicResourceApi.getById(this.resourceId);
          if (res.code === 200 && res.data) {
            const newFileName = res.data.fileName || '';
            const newFileSize = res.data.fileSize || 0;

            let oldFileName = '';
            let oldFileSize = 0;

            if (storedInfoStr) {
              try {
                const storedInfo = JSON.parse(storedInfoStr);
                oldFileName = storedInfo.fileName || '';
                oldFileSize = storedInfo.fileSize || 0;
              } catch (e) {
                console.warn('解析localStorage失败:', e);
              }
            }

            const isVideoReplaced =
              (oldFileName && oldFileName !== newFileName) || (oldFileSize && oldFileSize !== newFileSize);

            if (isVideoReplaced) {
              this.catalogData = {
                introSummary: '',
                faceTags: [],
                objectTags: [],
                tags: [],
                catalogTime: '',
                keyPoints: [],
                timeline: [],
                sceneSegments: [],
                speakerSummaries: [],
                mindMap: null,
              };
              this.keyframes = [];
              this.selectedFrameIndex = -1;
              this.selectedFrame = null;
              this.mindmapRendered = false;

              if (this.pollTimer) {
                clearInterval(this.pollTimer);
                this.pollTimer = null;
              }
            }

            this.detailData = res.data;
            this.aiStatus = res.data.aiStatus !== undefined ? res.data.aiStatus : res.data.catalogStatus;
            this.aiProgress = res.data.aiProgress !== undefined ? res.data.aiProgress : res.data.catalogProgress;
            this.lastVideoFileName = newFileName;
            this.lastVideoFileSize = newFileSize;

            const currentInfo = {
              fileName: newFileName,
              fileSize: newFileSize,
              updateTime: new Date().getTime(),
            };
            localStorage.setItem(storageKey, JSON.stringify(currentInfo));

            if (isVideoReplaced) {
              if (this.pollTimer) {
                clearInterval(this.pollTimer);
                this.pollTimer = null;
              }
              this.$message.info('视频已更换，正在重新加载...');
              setTimeout(() => {
                window.location.reload();
              }, 500);
              return;
            } else if (this.aiStatus === 2) {
              this.loadCatalogData();
            } else if (this.aiStatus === 1 || this.aiStatus === 0) {
              this.pollCatalogStatus();
            } else if (this.aiStatus === 3) {
              this.$message.warning('AI编目处理失败');
            }
          }
        } catch (err) {
          console.error('加载视频详情失败', err);
          this.$message.error('加载视频详情失败: ' + err.message);
        }
      },
      loadKeyframes() {
        if (this.catalogData.sceneSegments && this.catalogData.sceneSegments.length > 0) {
          this.keyframes = this.catalogData.sceneSegments.map(seg => {
            return {
              timestamp: seg.startTime || 0,
              thumbnail: seg.imageUrl || seg.thumbnail || '',
              scene: seg,
            };
          });
        }
      },
      selectKeyframe(frame, index) {
        const videoEl = this.$refs.videoPlayer;
        const startTime = frame.timestamp || frame.startTime || 0;

        if (videoEl) {
          videoEl.currentTime = startTime;
          videoEl.play().catch(err => {
            console.warn('播放失败:', err);
          });
        }

        this.selectedFrameIndex = index;
        this.selectedFrame = frame;
        this.segmentMode = true;

        this._bindSegmentWatch();
      },
      _bindSegmentWatch() {
        if (this._segmentWatchActive) return;
        this._segmentWatchActive = true;

        const videoEl = this.$refs.videoPlayer;
        if (!videoEl) {
          this._segmentWatchActive = false;
          return;
        }

        const onTimeUpdate = () => {
          if (!this.segmentMode) {
            videoEl.removeEventListener('timeupdate', onTimeUpdate);
            this._segmentWatchActive = false;
            return;
          }
          const currentSeg = this.keyframes[this.selectedFrameIndex];
          if (!currentSeg) return;
          const endTime = currentSeg.endTime || (currentSeg.scene ? currentSeg.scene.endTime : null);
          const nextSeg = this.keyframes[this.selectedFrameIndex + 1];

          if (endTime && videoEl.currentTime >= endTime - 0.3 && nextSeg) {
            const nextStart = nextSeg.timestamp || nextSeg.startTime || 0;
            videoEl.currentTime = nextStart;
            this.selectedFrameIndex = this.selectedFrameIndex + 1;
            this.selectedFrame = nextSeg;
          } else if (endTime && videoEl.currentTime >= endTime - 0.3 && !nextSeg) {
            this.segmentMode = false;
          }
        };

        const onEnded = () => {
          this.segmentMode = false;
        };

        videoEl.addEventListener('timeupdate', onTimeUpdate);
        videoEl.addEventListener('ended', onEnded);
      },
      collapseSceneDetail() {
        this.selectedFrameIndex = -1;
        this.selectedFrame = null;
        this.segmentMode = false;
      },
      onImageError(event, index) {
        this.$set(this.failedImages, index, true);
      },
      toggleExpand() {
        this.isExpanded = !this.isExpanded;
      },
      toggleSegmentExpand(index) {
        const pos = this.expandedSegments.indexOf(index);
        if (pos !== -1) {
          this.expandedSegments.splice(pos, 1);
        } else {
          this.expandedSegments.push(index);
        }
      },
      toggleKeypointExpand(index) {
        const pos = this.expandedKeypoints.indexOf(index);
        if (pos !== -1) {
          this.expandedKeypoints.splice(pos, 1);
        } else {
          this.expandedKeypoints.push(index);
        }
      },
      toggleSpeakerExpand(index) {
        const pos = this.expandedSpeakers.indexOf(index);
        if (pos !== -1) {
          this.expandedSpeakers.splice(pos, 1);
        } else {
          this.expandedSpeakers.push(index);
        }
      },
      formatTime(seconds) {
        if (!seconds && seconds !== 0) return '-';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
      },
      pollCatalogStatus() {
        if (this.pollTimer) {
          clearInterval(this.pollTimer);
          this.pollTimer = null;
        }

        this.pollTimer = setInterval(async () => {
          try {
            const res = await publicResourceApi.getById(this.resourceId);
            if (res.code === 200 && res.data) {
              const status = res.data.aiStatus !== undefined ? res.data.aiStatus : res.data.catalogStatus;
              const progress = res.data.aiProgress !== undefined ? res.data.aiProgress : res.data.catalogProgress;

              this.aiStatus = status;
              this.aiProgress = progress;
              this.detailData = { ...this.detailData, ...res.data };

              if (status === 2) {
                clearInterval(this.pollTimer);
                this.pollTimer = null;
                this.loadCatalogData();
              } else if (status === 3) {
                clearInterval(this.pollTimer);
                this.pollTimer = null;
                this.$message.warning('AI编目处理失败');
              }
            }
          } catch (err) {
            console.error('轮询请求失败:', err);
            clearInterval(this.pollTimer);
            this.pollTimer = null;
          }
        }, 3000);
      },
      async loadCatalogData() {
        this.catalogLoading = true;
        try {
          const res = await publicResourceApi.getCatalogData(this.resourceId);
          if (res.code === 200 && res.data) {
            const data = res.data;

            this.catalogData.introSummary = data.introSummary || '';
            this.catalogData.faceTags = data.faceTags || [];
            this.catalogData.objectTags = data.objectTags || [];
            this.catalogData.tags = data.tags || [];
            this.catalogData.catalogTime = data.catalogTime || '';
            this.catalogData.keyPoints = data.keyPoints || [];
            this.catalogData.timeline = data.sceneSegments || [];
            this.catalogData.sceneSegments = data.sceneSegments || [];
            this.catalogData.speakerSummaries = data.speakerSummaries || [];

            let mindMapData = data.mindMap || data.mindmap;
            if (typeof mindMapData === 'string') {
              try {
                mindMapData = JSON.parse(mindMapData);
              } catch (e) {
                mindMapData = null;
              }
            }
            this.catalogData.mindMap = mindMapData;

            this.allTags = data.tags || [];

            this.loadKeyframes();
            this.loadGuideData(data);

            if (mindMapData && this.activeTab === 'mindmap') {
              this.$nextTick(() => {
                this.renderMindMap(mindMapData);
              });
            }
          }
        } catch (err) {
          console.error('加载编目数据失败', err);
        } finally {
          this.catalogLoading = false;
        }
      },
      loadGuideData(catalogData) {
        const rawKeyPoints = catalogData.keyPoints || [];
        const rawSceneSegments = catalogData.sceneSegments || [];
        const rawSpeakerSummaries = catalogData.speakerSummaries || [];

        let keyPoints = rawKeyPoints;
        if (keyPoints.length > 0 && typeof keyPoints[0] === 'string') {
          keyPoints = keyPoints.map((title, i) => {
            return { title: '关键点 ' + (i + 1), description: title };
          });
        }
        this.catalogData.keyPoints = keyPoints;

        let timeline = [];
        if (rawSceneSegments.length > 0) {
          timeline = rawSceneSegments.map(seg => {
            return { startTime: seg.startTime || 0, event: seg.sceneSummary || '' };
          });
        }
        this.catalogData.timeline = timeline;

        let guideContent = '';
        if (rawSpeakerSummaries.length > 0) {
          guideContent = rawSpeakerSummaries
            .map(s => {
              return (s.speaker || '发言人') + ': ' + (s.summary || '') + '\n';
            })
            .join('');
        }
        this.guideContent = guideContent || catalogData.guideContent || '';
      },
      showAddTagDialog() {
        this.$prompt('请输入标签名称', '编辑标签', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        })
          .then(input => {
            if (input.value && input.value.trim()) {
              if (this.allTags.indexOf(input.value) === -1) {
                this.allTags.push(input.value);
                this.$message.success('标签添加成功');
              } else {
                this.$message.warning('标签已存在');
              }
            }
          })
          .catch(() => {});
      },
      zoomIn() {
        const svg = d3.select(this.$refs.mindmapContainer).select('svg');
        if (svg.empty()) return;
        svg.transition().duration(300).call(this.zoomBehavior.scaleBy, 1.3);
      },
      zoomOut() {
        const svg = d3.select(this.$refs.mindmapContainer).select('svg');
        if (svg.empty()) return;
        svg.transition().duration(300).call(this.zoomBehavior.scaleBy, 0.77);
      },
      resetView() {
        const svg = d3.select(this.$refs.mindmapContainer).select('svg');
        if (svg.empty()) return;
        svg.transition().duration(300).call(this.zoomBehavior.transform, d3.zoomIdentity.scale(0.5));
        this.currentZoom = 0.5;
        this.currentZoomPercent = 50;
      },
      onZoomSelect(pct) {
        const svg = d3.select(this.$refs.mindmapContainer).select('svg');
        if (svg.empty()) return;
        svg
          .transition()
          .duration(300)
          .call(this.zoomBehavior.scaleTo, pct / 100);
        this.currentZoom = pct / 100;
      },
      renderMindMap(treeData) {
        const self = this;

        if (typeof d3 === 'undefined') {
          self.$message.error('脑图组件加载失败，请刷新页面重试');
          return;
        }

        const container = this.$refs.mindmapContainer;
        if (!container) return;
        container.innerHTML = '';

        const defaultTree = {
          name: '思维导图',
          children: [
            { name: '节点1', children: [{ name: '子节点1' }] },
            { name: '节点2', children: [{ name: '子节点2' }] },
          ],
        };
        const data = treeData || defaultTree;

        const CFG = {
          rootFontSize: 15,
          rootFontWeight: '700',
          nodeFontSize: 13,
          nodeFontWeight: '500',
          levelGap: 60,
          paddingX: 14,
          paddingY: 8,
          lineHeight: 1.4,
          linkWidth: 2,
          branchColors: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#b37feb'],
          rootBgColor: '#409eff',
          rootTextColor: '#ffffff',
          nodeBgColor: '#ffffff',
          nodeTextColor: '#303133',
          nodeBorderColor: '#dcdfe6',
          maxNodeWidth: 160,
          minNodeWidth: 80,
          rootMaxWidth: 200,
          nodeVGap: 12,
        };

        function getTextWidth(str, fontSize) {
          let w = 0;
          for (let i = 0; i < str.length; i++) {
            const ch = str[i];
            if (/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(ch)) {
              w += fontSize;
            } else {
              w += fontSize * 0.6;
            }
          }
          return w;
        }

        function wrapText(text, maxWidth, fontSize) {
          const lines = [];
          let line = '';
          for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            const test = line + ch;
            if (line && getTextWidth(test, fontSize) > maxWidth) {
              lines.push(line);
              line = ch;
            } else {
              line = test;
            }
          }
          if (line) lines.push(line);
          return lines.length > 0 ? lines : [''];
        }

        function calcNodeSize(name, isRoot) {
          const fontSize = isRoot ? CFG.rootFontSize : CFG.nodeFontSize;
          const maxW = isRoot ? CFG.rootMaxWidth : CFG.maxNodeWidth;
          const minW = CFG.minNodeWidth;
          const paddingX = CFG.paddingX;
          const paddingY = CFG.paddingY;

          const rawW = getTextWidth(name || '', fontSize) + paddingX * 2;
          if (rawW <= maxW) {
            const w = Math.max(rawW, minW);
            const h = fontSize + paddingY * 2;
            return { w: w, h: h, lines: [name || ''] };
          }

          const innerW = maxW - paddingX * 2;
          const lines = wrapText(name || '', innerW, fontSize);
          const lineH = fontSize * CFG.lineHeight;
          const h = lines.length * lineH + paddingY * 2;
          return { w: maxW, h: h, lines: lines };
        }

        const tempDiv = document.createElement('div');
        container.appendChild(tempDiv);
        const tempSvg = d3.select(tempDiv).append('svg').attr('width', 1).attr('height', 1);
        const tempG = tempSvg.append('g').attr('class', 'mm-root');

        const root = d3.hierarchy(data);

        root.each(function (d) {
          const isRoot = d.depth === 0;
          const size = calcNodeSize(d.data.name || '', isRoot);
          d._w = size.w;
          d._h = size.h;
          d._lines = size.lines;
        });

        let maxNodeH = 0;
        root.each(function (d) {
          if (d._h > maxNodeH) maxNodeH = d._h;
        });
        let maxNodeW = 0;
        root.each(function (d) {
          if (d._w > maxNodeW) maxNodeW = d._w;
        });

        const treeLayout = d3
          .tree()
          .nodeSize([maxNodeH + CFG.nodeVGap, maxNodeW + CFG.levelGap])
          .separation(function (a, b) {
            const gap = (a._h + b._h) / 2 + CFG.nodeVGap;
            const unit = maxNodeH + CFG.nodeVGap;
            return Math.max(gap / unit, a.parent === b.parent ? 1.1 : 1.6);
          });

        treeLayout(root);

        let minX = Infinity,
          maxX = -Infinity,
          minY = Infinity,
          maxY = -Infinity;
        root.each(function (d) {
          const x = d.y;
          const y = d.x;
          if (x < minX) minX = x;
          if (x + d._w > maxX) maxX = x + d._w;
          if (y - d._h / 2 < minY) minY = y - d._h / 2;
          if (y + d._h / 2 > maxY) maxY = y + d._h / 2;
        });

        const padding = 60;
        const contentWidth = maxX - minX + padding * 2;
        const contentHeight = maxY - minY + padding * 2;
        const containerWidth = container.getBoundingClientRect().width || 900;
        const svgWidth = Math.min(contentWidth, containerWidth);

        tempDiv.remove();

        const svg = d3
          .select(container)
          .append('svg')
          .attr('width', svgWidth)
          .attr('height', contentHeight)
          .attr('viewBox', '0 0 ' + svgWidth + ' ' + contentHeight)
          .style('background', '#fafbfc')
          .style('display', 'block')
          .style('max-width', '100%');

        const g = svg
          .append('g')
          .attr('class', 'mm-root')
          .attr('transform', 'translate(' + padding + ',' + (padding - minY) + ')');

        self.zoomBehavior = d3
          .zoom()
          .scaleExtent([0.1, 3])
          .on('zoom', function (event) {
            if (g && !g.empty()) {
              g.attr('transform', event.transform);
              self.currentZoom = event.transform.k;
              const pct = Math.round(event.transform.k * 100);
              const zoomOptions = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
              const nearest = zoomOptions.reduce(function (prev, curr) {
                return Math.abs(curr - pct) < Math.abs(prev - pct) ? curr : prev;
              });
              self.currentZoomPercent = nearest;
            }
          });

        svg.call(self.zoomBehavior);

        if (root.children) {
          root.children.forEach(function (child, i) {
            const color = CFG.branchColors[i % CFG.branchColors.length];
            child._color = color;
            child.each(function (d) {
              d._color = color;
            });
          });
        }

        g.selectAll('.mm-link')
          .data(root.links())
          .enter()
          .append('path')
          .attr('class', 'mm-link')
          .attr('fill', 'none')
          .attr('stroke', function (d) {
            return d.target._color || '#a0c4ff';
          })
          .attr('stroke-width', CFG.linkWidth)
          .attr('stroke-opacity', 0.65)
          .attr('d', function (d) {
            const sx = d.source.y + d.source._w;
            const sy = d.source.x;
            const tx = d.target.y;
            const ty = d.target.x;
            const mx = sx + (tx - sx) * 0.5;
            return 'M' + sx + ',' + sy + ' C' + mx + ',' + sy + ' ' + mx + ',' + ty + ' ' + tx + ',' + ty;
          });

        const nodes = g
          .selectAll('.mm-node')
          .data(root.descendants())
          .enter()
          .append('g')
          .attr('class', 'mm-node')
          .attr('transform', function (d) {
            return 'translate(' + d.y + ',' + (d.x - d._h / 2) + ')';
          });

        nodes
          .append('rect')
          .attr('width', function (d) {
            return d._w;
          })
          .attr('height', function (d) {
            return d._h;
          })
          .attr('rx', function (d) {
            return d.depth === 0 ? 8 : 6;
          })
          .attr('ry', function (d) {
            return d.depth === 0 ? 8 : 6;
          })
          .attr('fill', function (d) {
            return d.depth === 0 ? CFG.rootBgColor : CFG.nodeBgColor;
          })
          .attr('stroke', function (d) {
            return d.depth === 0 ? CFG.rootBgColor : d._color || CFG.nodeBorderColor;
          })
          .attr('stroke-width', function (d) {
            return d.depth === 0 ? 2 : 1.5;
          })
          .style('filter', function (d) {
            return d.depth === 0 ? 'none' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))';
          });

        nodes.each(function (d) {
          const el = d3.select(this);
          const isRoot = d.depth === 0;
          const fontSize = isRoot ? CFG.rootFontSize : CFG.nodeFontSize;
          const fontWeight = isRoot ? CFG.rootFontWeight : CFG.nodeFontWeight;
          const fillColor = isRoot ? CFG.rootTextColor : CFG.nodeTextColor;
          const lines = d._lines;
          const lineH = fontSize * CFG.lineHeight;
          const totalTextH = lines.length * lineH;
          const startY = (d._h - totalTextH) / 2 + fontSize * 0.85;

          lines.forEach(function (line, i) {
            el.append('text')
              .attr('x', d._w / 2)
              .attr('y', startY + i * lineH)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'alphabetic')
              .style('font-size', fontSize + 'px')
              .style('font-weight', fontWeight)
              .style('fill', fillColor)
              .style('pointer-events', 'none')
              .style('user-select', 'none')
              .text(line);
          });
        });

        try {
          const contentCenterX = (minX + maxX) / 2;
          const contentCenterY = (minY + maxY) / 2;
          const viewCenterX = svgWidth / 2;
          const viewCenterY = contentHeight / 2;

          const translateX = viewCenterX - contentCenterX;
          const translateY = viewCenterY - contentCenterY;

          svg
            .transition()
            .duration(300)
            .call(self.zoomBehavior.transform, d3.zoomIdentity.translate(translateX, translateY).scale(0.5));
          self.currentZoom = 0.5;
          self.currentZoomPercent = 50;
        } catch (e) {
          console.error('[脑图] 初始缩放失败:', e);
        }

        self.mindmapRendered = true;
      },
      countMindmapNodes(node) {
        if (!node) return 0;
        let count = 1;
        const children = node.children;
        if (children && children.length > 0) {
          for (let i = 0; i < children.length; i++) {
            count += this.countMindmapNodes(children[i]);
          }
        }
        return count;
      },
      calculateMindmapDepth(node) {
        if (!node) return 0;
        let maxDepth = 1;
        const children = node.children;
        if (children && children.length > 0) {
          for (let i = 0; i < children.length; i++) {
            const childDepth = this.calculateMindmapDepth(children[i]);
            if (childDepth + 1 > maxDepth) {
              maxDepth = childDepth + 1;
            }
          }
        }
        return maxDepth;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .video-detail-page {
    min-height: 100vh;
    height: auto !important;
    background: #f5f5fa;
    color: #303133;
    display: flex;
    flex-direction: column;
    overflow: visible !important;
  }

  /* 顶部导航栏 */
  .top-navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    background: #ffffff;
    border-bottom: 1px solid #e4e7ed;
    flex-shrink: 0;
  }
  .navbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .back-btn {
    background: transparent;
    border: none;
    color: #606266;
    font-size: 14px;
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .back-btn:hover {
    color: #409eff;
    background: #ecf5ff;
  }
  .file-name {
    font-size: 15px;
    color: #303133;
    font-weight: 500;
  }
  .navbar-right {
    display: flex;
    gap: 8px;
  }
  .action-btn {
    background: #ffffff;
    border: 1px solid #dcdfe6;
    color: #606266;
    font-size: 14px;
    padding: 8px 16px;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .action-btn:hover {
    color: #409eff;
    border-color: #c6e2ff;
    background: #ecf5ff;
  }

  /* 主体内容区域 */
  .main-container {
    flex: 1 1 auto;
    display: flex;
    flex-direction: row;
    gap: 20px;
    padding: 20px 24px;
    min-height: 0;
    width: 100%;
    box-sizing: border-box;
  }
  .left-section {
    width: 60%;
    max-width: 60%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex-shrink: 0;
  }
  .right-section {
    width: 40%;
    max-width: 40%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  /* 视频播放器 */
  .video-player-wrapper {
    background: #000000 !important;
    border-radius: 8px !important;
    overflow: hidden !important;
    position: relative !important;
    width: 100% !important;
    padding-bottom: 56.25%;
    height: 0;
    flex-shrink: 0;
  }
  .video-player {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
    display: block !important;
  }
  .video-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #000000;
    color: #909399;
    position: absolute;
    top: 0;
    left: 0;
  }
  .video-cover-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #1a1a1a;
  }
  .video-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .video-cover-default {
    background: linear-gradient(135deg, #2c3e50, #1a1a2e);
  }
  .video-play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    cursor: pointer;
  }
  .play-button {
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    transition: all 0.3s;
  }
  .play-button:hover {
    transform: scale(1.1);
    background: #fff;
  }
  .play-icon {
    width: 0;
    height: 0;
    border-left: 30px solid #409eff;
    border-top: 18px solid transparent;
    border-bottom: 18px solid transparent;
    margin-left: 8px;
  }
  .video-play-overlay:hover .play-button {
    background: #fff;
    transform: scale(1.1);
  }

  /* 关键帧时间轴 */
  .keyframe-timeline {
    background: #ffffff;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
  }
  .timeline-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
    border-bottom: 1px solid #e4e7ed;
    flex-shrink: 0;
  }
  .timeline-header span {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }
  .collapse-btn {
    background: #f5f7fa;
    border: 1px solid #dcdfe6;
    color: #606266;
    font-size: 12px;
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .collapse-btn:hover {
    background: #ecf5ff;
    border-color: #c6e2ff;
    color: #409eff;
  }
  .timeline-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .keyframes-row {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 4px 0;
    flex-shrink: 0;
  }
  .keyframes-row::-webkit-scrollbar {
    height: 6px;
  }
  .keyframes-row::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  .keyframes-row::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;
  }
  .keyframe-item {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .keyframe-item:hover .keyframe-thumb {
    border-color: #409eff;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  .keyframe-item.active .keyframe-thumb {
    border-color: #409eff;
    border-width: 2px;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }
  .keyframe-thumb {
    width: 100px;
    height: 56px;
    background: #f5f7fa;
    border-radius: 4px;
    overflow: hidden;
    border: 2px solid #e4e7ed;
    transition: all 0.2s;
    position: relative;
  }
  .keyframe-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .keyframe-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #e8ecf1, #f5f7fa);
    color: #909399;
    border-radius: 4px;
  }
  .placeholder-text {
    font-size: 11px;
    font-weight: 600;
    color: #606266;
  }
  .selected-indicator {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 18px;
    height: 18px;
    background: #409eff;
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: bold;
  }
  .keyframe-time {
    font-size: 11px;
    color: #909399;
    transition: color 0.2s;
  }
  .keyframe-item.active .keyframe-time {
    color: #409eff;
    font-weight: 500;
  }
  .keyframes-empty {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: #909399;
    font-size: 13px;
  }

  /* 片段详情面板 */
  .scene-detail-panel {
    flex-shrink: 0;
    min-height: 60px;
    overflow-y: auto;
    background: #f5f7fa;
    border-radius: 6px;
    border-left: 3px solid #409eff;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    animation: slideDown 0.3s ease;
  }
  .scene-detail-empty {
    align-items: center;
    justify-content: center;
  }
  .empty-text {
    color: #909399;
    font-size: 13px;
  }
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
  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
    border-bottom: 1px dashed #dcdfe6;
    flex-shrink: 0;
  }
  .detail-time {
    font-size: 13px;
    color: #409eff;
    font-weight: 500;
  }
  .detail-tip {
    font-size: 11px;
    color: #909399;
  }
  .detail-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    line-height: 1.6;
  }
  .detail-label {
    color: #409eff;
    font-weight: 500;
    font-size: 13px;
    flex-shrink: 0;
  }
  .detail-text {
    color: #606266;
    font-size: 13px;
    line-height: 1.6;
    word-break: break-all;
  }
  .detail-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 4px;
  }

  /* 右侧 Tabs */
  .tabs-header {
    display: flex;
    background: #ffffff;
    border-radius: 8px 8px 0 0;
    border-bottom: 1px solid #e4e7ed;
    flex-shrink: 0;
  }
  .tab-item {
    flex: 1;
    text-align: center;
    padding: 14px 0;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.3s;
  }
  .tab-item:hover {
    color: #409eff;
  }
  .tab-item.active {
    color: #409eff;
    border-bottom-color: #409eff;
    font-weight: 500;
  }
  .tabs-content {
    background: #ffffff;
    border-radius: 0 0 8px 8px;
    padding: 20px;
    flex: 1;
    min-height: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    overflow-y: auto;
  }
  .tabs-content--mindmap {
    padding: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  /* 编目 Tab */
  .catalog-container {
    min-height: 100%;
  }
  .catalog-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .section {
    background: #ffffff;
    border-radius: 8px;
  }
  .description-section {
    padding: 0;
    background: transparent;
  }
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
  }
  .description-content {
    font-size: 14px;
    line-height: 1.8;
    color: #606266;
    position: relative;
  }
  .expand-btn {
    color: #409eff;
    cursor: pointer;
    margin-left: 8px;
    font-size: 13px;
  }
  .expand-btn:hover {
    text-decoration: underline;
  }
  .faces-content {
    min-height: 60px;
  }
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
    font-size: 14px;
    min-height: 60px;
  }
  .faces-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 16px;
  }
  .face-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .face-thumbnail {
    width: 80px;
    height: 80px;
    background: #f5f7fa;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    overflow: hidden;
  }
  .face-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .face-info {
    text-align: center;
  }
  .face-name {
    display: block;
    font-size: 13px;
    color: #303133;
    font-weight: 500;
  }
  .face-time {
    display: block;
    font-size: 12px;
    color: #909399;
  }
  .object-recognition {
    display: flex;
    gap: 20px;
    padding: 10px 0;
  }
  .object-item {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .object-item.active {
    position: relative;
  }
  .object-item.active .object-thumbnail {
    border-color: #409eff;
  }
  .object-thumbnail {
    width: 120px;
    height: 80px;
    background: #f5f7fa;
    border-radius: 6px;
    border: 2px solid #e4e7ed;
    overflow: hidden;
  }
  .object-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .thumbnail-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #c0c4cc;
  }
  .object-label {
    font-size: 14px;
    color: #303133;
    font-weight: 500;
  }
  .tags-section {
    border: none;
  }
  .edit-tag-btn {
    background: #409eff;
    border-color: #409eff;
    font-size: 13px;
    padding: 6px 14px;
    color: #fff;
    border-radius: 4px;
    cursor: pointer;
  }
  .tags-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .video-tag {
    background: #ecf5ff;
    border: 1px solid #d9ecff;
    color: #409eff;
    padding: 5px 12px;
    font-size: 13px;
    border-radius: 4px;
    cursor: default;
    transition: all 0.2s;
  }
  .video-tag:hover {
    background: #d9ecff;
  }

  /* 导读 Tab - AI源站风格 */
  .guide-container {
    min-height: 100%;
  }
  .guide-content {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* AI概览区块 */
  .guide-overview {
    background: linear-gradient(135deg, #e8f4fc 0%, #f0e6f6 50%, #e8f0fe 100%);
    border-radius: 10px;
    padding: 20px 24px;
    margin-bottom: 20px;
    position: relative;
    transition: all 0.3s ease;
  }
  .guide-overview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    cursor: default;
  }
  .guide-overview-title {
    font-size: 17px;
    font-weight: 700;
    color: #1a1a2e;
  }
  .guide-overview-collapse {
    font-size: 13px;
    color: #909399;
    cursor: pointer;
    padding: 4px 12px;
    border-radius: 4px;
    transition: all 0.2s;
    user-select: none;
  }
  .guide-overview-collapse:hover {
    color: #409eff;
    background: rgba(255, 255, 255, 0.6);
  }
  .guide-overview-text {
    font-size: 14px;
    line-height: 2;
    color: #555;
    text-align: justify;
    word-break: break-all;
  }
  .guide-overview.collapsed .guide-overview-text {
    display: none;
  }
  .guide-overview.collapsed {
    padding-bottom: 16px;
  }

  /* 导读子Tab - 圆角按钮风格 */
  .guide-tabs {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    padding: 0 4px;
  }
  .guide-tab-item {
    padding: 10px 28px;
    font-size: 14px;
    color: #fff;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.3s;
    text-align: center;
    background: #333;
    font-weight: 500;
    letter-spacing: 0.5px;
  }
  .guide-tab-item:hover {
    background: #444;
    transform: translateY(-1px);
  }
  .guide-tab-item.active {
    background: #409eff;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.35);
    font-weight: 600;
  }
  .guide-tab-item.active:hover {
    transform: translateY(-1px);
    background: #409eff;
  }

  .guide-tab-content {
    padding: 0;
  }

  /* =============================================
   导读三组卡片 - 统一配色体系
   展开态：浅蓝底 + 深蓝标题 + 蓝色箭头
   收起态：白底 + 灰色标题 + 浅灰箭头
   ============================================= */

  /* --- 片段智读 --- */
  .scene-segments-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .scene-segment-item {
    background: #ffffff;
    border-radius: 10px;
    border: 1px solid #e4e9f0;
    overflow: hidden;
    transition: all 0.25s ease;
  }
  .scene-segment-item:hover {
    box-shadow: 0 2px 10px rgba(64, 158, 255, 0.1);
    border-color: #b3d8fd;
  }
  .scene-segment-item.is-expanded {
    border-color: #a0cfff;
    box-shadow: 0 2px 10px rgba(64, 158, 255, 0.15);
  }
  .segment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    cursor: pointer;
    user-select: none;
    transition:
      background 0.2s,
      border-left 0.2s;
    border-left: 3px solid transparent;
    background: #ffffff;
  }
  .segment-header:hover {
    background: #f5f8ff;
    border-left-color: #b3d8fd;
  }
  .is-expanded .segment-header {
    background: #f0f7ff;
    border-left-color: #409eff;
  }
  .segment-title {
    font-size: 15px;
    font-weight: 600;
    color: #707484;
    transition: color 0.2s;
  }
  .is-expanded .segment-title {
    color: #1a5db0;
  }
  .segment-time {
    font-size: 13px;
    color: #909399;
    font-family: 'Courier New', monospace;
  }
  .segment-toggle-icon {
    font-size: 12px;
    color: #b4bcc8;
    transition:
      transform 0.3s,
      color 0.2s;
    margin-left: 8px;
  }
  .segment-toggle-icon.expanded {
    transform: rotate(180deg);
    color: #409eff;
  }
  .segment-body {
    padding: 0 20px 18px 20px;
    border-top: 1px solid #f0f2f5;
    animation: slideDown 0.3s ease;
  }
  .segment-body-collapsed {
    display: none;
  }
  .segment-summary {
    margin-top: 14px;
    font-size: 14px;
    line-height: 1.85;
    color: #50555c;
  }
  .segment-label {
    color: #409eff;
    font-weight: 500;
  }
  .segment-smart-read {
    margin-top: 12px;
    font-size: 14px;
    line-height: 1.85;
    color: #50555c;
  }
  .segment-content {
    margin-top: 8px;
    padding-left: 14px;
    border-left: 3px solid #409eff;
    background: #f5f9ff;
    padding: 10px 14px;
    border-radius: 0 6px 6px 0;
  }

  /* --- 重点解析 --- */
  .key-points-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .key-point-item {
    background: #ffffff;
    border-radius: 10px;
    border: 1px solid #e4e9f0;
    overflow: hidden;
    transition: all 0.25s ease;
  }
  .key-point-item:hover {
    box-shadow: 0 2px 10px rgba(64, 158, 255, 0.1);
    border-color: #b3d8fd;
  }
  .key-point-item.is-expanded {
    border-color: #a0cfff;
    box-shadow: 0 2px 10px rgba(64, 158, 255, 0.15);
  }
  .kp-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    cursor: pointer;
    user-select: none;
    transition:
      background 0.2s,
      border-left 0.2s;
    border-left: 3px solid transparent;
    background: #ffffff;
  }
  .kp-header:hover {
    background: #f5f8ff;
    border-left-color: #b3d8fd;
  }
  .is-expanded .kp-header {
    background: #f0f7ff;
    border-left-color: #409eff;
  }
  .kp-title {
    font-size: 15px;
    font-weight: 600;
    color: #707484;
    transition: color 0.2s;
  }
  .is-expanded .kp-title {
    color: #1a5db0;
  }
  .kp-body {
    padding: 0 20px 18px 20px;
    border-top: 1px solid #f0f2f5;
    animation: slideDown 0.3s ease;
  }
  .kp-body-collapsed {
    display: none;
  }
  .kp-body p {
    font-size: 14px;
    line-height: 1.85;
    color: #50555c;
    margin: 14px 0 0 0;
  }

  /* --- 发言人总结 --- */
  .speaker-summaries-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .speaker-summary-item {
    background: #ffffff;
    border-radius: 10px;
    border: 1px solid #e4e9f0;
    overflow: hidden;
    transition: all 0.25s ease;
  }
  .speaker-summary-item:hover {
    box-shadow: 0 2px 10px rgba(64, 158, 255, 0.1);
    border-color: #b3d8fd;
  }
  .speaker-summary-item.is-expanded {
    border-color: #a0cfff;
    box-shadow: 0 2px 10px rgba(64, 158, 255, 0.15);
  }
  .speaker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    cursor: pointer;
    border-left: 3px solid transparent;
    transition:
      background 0.2s,
      border-left 0.2s;
    background: #ffffff;
  }
  .speaker-header:hover {
    background: #f5f8ff;
    border-left-color: #b3d8fd;
  }
  .is-expanded .speaker-header {
    background: #f0f7ff;
    border-left-color: #409eff;
  }
  .speaker-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .speaker-info i {
    color: #b4bcc8;
    font-size: 16px;
    transition: color 0.2s;
  }
  .is-expanded .speaker-info i {
    color: #409eff;
  }
  .speaker-name {
    font-size: 14px;
    font-weight: 500;
    color: #707484;
    transition: color 0.2s;
  }
  .is-expanded .speaker-name {
    color: #1a5db0;
  }
  .speaker-body {
    padding: 0 20px 18px 20px;
    border-top: 1px solid #f0f2f5;
    animation: slideDown 0.3s ease;
  }
  .speaker-body-collapsed {
    display: none;
  }
  .speaker-body p {
    font-size: 14px;
    line-height: 1.85;
    color: #50555c;
    margin: 14px 0 0 0;
  }
  .timeline-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .timeline-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 12px 16px;
    background: #f5f7fa;
    border-radius: 6px;
  }
  .timeline-time {
    font-size: 14px;
    color: #409eff;
    font-weight: 500;
    min-width: 50px;
    padding-top: 2px;
  }
  .timeline-event {
    flex: 1;
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
  }

  /* 脑图 Tab */
  .mindmap-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }
  .mindmap-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }
  .mindmap-info-section {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 8px 16px;
    background: #ffffff;
    border-bottom: 1px solid #e4e7ed;
    flex-shrink: 0;
  }
  .info-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .info-label {
    font-size: 13px;
    color: #909399;
  }
  .info-value {
    font-size: 13px;
    color: #303133;
    font-weight: 500;
  }
  .mindmap-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 16px;
    background: #ffffff;
    border-bottom: 1px solid #e4e7ed;
    flex-shrink: 0;
  }
  .zoom-display {
    display: flex;
    align-items: center;
  }
  .zoom-select {
    width: 90px;
  }
  .mindmap-viz {
    background: #fafbfc;
    overflow: hidden;
    flex: 1;
    min-height: 400px;
    width: 100%;
    position: relative;
  }

  /* 页脚 */
  .page-footer {
    padding: 12px 24px;
    background: #ffffff;
    border-top: 1px solid #e4e7ed;
    text-align: center;
    font-size: 12px;
    color: #909399;
    flex-shrink: 0;
  }

  /* 加载态 */
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #909399;
    padding: 60px;
  }

  /* 编目未完成时的进度提示 */
  .analyzing-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
    padding: 20px 0;
  }
  .analyzing-overlay .left-section {
    width: 100%;
    max-width: 800px;
  }
  .analyzing-hint {
    background: #ffffff;
    border-radius: 8px;
    padding: 24px 48px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    max-width: 800px;
    width: 100%;
  }
  .analyzing-hint__icon {
    margin-bottom: 16px;
  }
  .analyzing-hint__text {
    font-size: 18px;
    font-weight: 500;
    color: #409eff;
    margin: 0 0 8px 0;
  }
  .analyzing-hint__sub {
    font-size: 13px;
    color: #909399;
    margin: 0;
  }

  /* 响应式 */
  @media (max-width: 1200px) {
    .main-container {
      flex-direction: column;
    }
    .left-section,
    .right-section {
      width: 100%;
      max-width: 100%;
    }
    .video-player-wrapper {
      position: relative !important;
      width: 100% !important;
      padding-bottom: 56.25% !important;
    }
  }

  /* D3脑图节点样式 */
  ::v-deep .mm-node rect {
    cursor: pointer;
  }
  ::v-deep .mm-link {
    fill: none;
  }
</style>
