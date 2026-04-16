// utils/request.js
import axios from "axios";
import { Message, Loading } from "element-ui";
import router from "@/router";

// 创建axios实例
const service = axios.create({
  timeout: 15000,
  withCredentials: true,
  // headers: {
  //   "Content-Type": "application/json;charset=UTF-8",
  // },
});

// 是否正在刷新token
let isRefreshing = false;
// 失败队列（存储需要重试的请求）
let failedQueue = [];

/**
 * 处理队列中的请求
 * @param {Error|null} error - 错误对象，如果为null表示刷新成功
 * @param {string|null} token - 新的token
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 添加token
    const token = sessionStorage.getItem("accessToken");

    // 判断是否是登录接口
    const urlParts = config.url.split("/");
    const lastPart = urlParts[urlParts.length - 1];
    const isLoginRequest = lastPart === "accountLogin" || lastPart === "login";

    if (token && !isLoginRequest) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    // config.headers["Content-Type"] = "application/json";
    // 处理业务URL前缀
    if (!config.url.includes("http")) {
      switch (config.urlType) {
        case "businessURL":
          // if (!window.businessURL) {
          //   console.warn("window.businessURL 未初始化，使用默认值");
          //   window.businessURL = "http://120.55.72.186:8081";
          // }
          config.url = window.businessURL + config.url;
          break;
      }
    }

    // 添加自定义loading标识
    if (config.loading) {
      config.loadingInstance = Loading.service({
        fullscreen: true,
        text: "加载中...",
        background: "rgba(0, 0, 0, 0.7)",
      });
    }

    return config;
  },
  (error) => {
    console.error("请求错误:", error);
    return Promise.reject(error);
  }
);

// 响应拦截器（核心：实现无感刷新）
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    const config = response.config;

    // 关闭loading
    if (config.loadingInstance) {
      config.loadingInstance.close();
    }

    return res;
  },
  async (error) => {
    const originalRequest = error.config;

    // 关闭loading
    if (originalRequest && originalRequest.loadingInstance) {
      originalRequest.loadingInstance.close();
    }

    // 如果没有response对象，说明是网络错误
    if (!error.response) {
      Message.error("网络连接异常，请检查网络");
      return Promise.reject(error);
    }

    const { response } = error;
    const { status } = response;

    // 处理401未授权 - 双token刷新机制
    if (status === 401) {
      // 避免无限重试（已经重试过的请求直接失败）
      if (originalRequest._retry) {
        Message.error("登录已过期，请重新登录");
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        router.push("/login");
        return Promise.reject(error);
      }

      // 标记已经重试过
      originalRequest._retry = true;

      // 如果正在刷新token，将请求加入队列等待
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return service(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // 开始刷新token
      isRefreshing = true;

      try {
        const refreshTokenValue = sessionStorage.getItem("refreshToken");
        if (!refreshTokenValue) {
          throw new Error("No refresh token");
        }

        // 注意：这里必须用原生 axios，不能用 service，避免进入拦截器死循环
        const refreshResponse = await axios.post(
          `${window.businessURL}/api/auth/refresh`,
          { refreshToken: refreshTokenValue },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("刷新token响应=====", refreshResponse);

        // 检查刷新是否成功
        if (refreshResponse.data && refreshResponse.data.code === 200) {
          const { accessToken, refreshToken: newRefreshToken } =
            refreshResponse.data.data;

          // 保存新的token
          sessionStorage.setItem("accessToken", accessToken);
          sessionStorage.setItem("refreshToken", newRefreshToken);

          // 处理队列中的所有请求
          processQueue(null, accessToken);

          // 重试原始请求
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
          console.log("Token刷新成功，重试原始请求");

          return service(originalRequest);
        } else {
          throw new Error(
            refreshResponse.data?.message || "Refresh token failed"
          );
        }
      } catch (refreshError) {
        console.log("Token刷新失败", refreshError);

        // 刷新失败，处理队列中的所有请求
        processQueue(refreshError, null);

        // 清除认证信息
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");

        Message.error("登录已过期，请重新登录");
        router.push("/login");

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 处理其他HTTP错误
    if (response) {
      switch (status) {
        case 400:
          Message.error("请求错误");
          break;
        case 403:
          Message.error("拒绝访问");
          break;
        case 404:
          Message.error("请求地址出错");
          break;
        case 408:
          Message.error("请求超时");
          break;
        case 500:
          Message.error("服务器内部错误");
          break;
        case 501:
          Message.error("服务未实现");
          break;
        case 502:
          Message.error("网关错误");
          break;
        case 503:
          Message.error("服务不可用");
          break;
        case 504:
          Message.error("网关超时");
          break;
        default:
          Message.error(`连接错误${status}`);
      }
    } else {
      Message.error("网络连接异常，请检查网络");
    }

    return Promise.reject(error);
  }
);

export default service;
