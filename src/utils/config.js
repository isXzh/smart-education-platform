// src/utils/config.js

/**
 * 获取当前项目的基础路径
 */
function getBaseUrl() {
  // 方法1：使用 webpack 注入的 BASE_URL（推荐）
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }

  // 方法2：从当前页面路径动态提取（兜底方案）
  const path = window.location.pathname;
  const match = path.match(/^\/[^\/]+\//);
  if (match && match[0] !== '//') {
    return match[0];
  }

  // 方法3：默认返回根路径
  return '/';
}

/**
 * 获取配置文件的完整 URL
 */
function getConfigUrl() {
  const baseUrl = getBaseUrl();
  let configUrl = baseUrl + 'static/config.json';
  // 处理路径中可能出现的双斜杠
  configUrl = configUrl.replace(/([^:]\/)\/+/g, '$1');
  return configUrl;
}

/**
 * 加载配置文件
 * @returns {Promise<Object>}
 */
export function loadConfig() {
  const configUrl = getConfigUrl();
  console.log('加载配置文件:', configUrl);

  return fetch(configUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(config => {
      console.log('配置文件加载成功:', config);
      return config;
    })
    .catch(error => {
      console.error('配置文件加载失败:', error);
      console.error('尝试的路径:', configUrl);

      // 尝试备用路径（从根目录加载）
      console.log('尝试备用路径: /static/config.json');
      return fetch('/static/config.json')
        .then(response => {
          if (!response.ok) {
            throw new Error('备用路径也失败了');
          }
          return response.json();
        })
        .then(config => {
          console.log('使用备用路径加载成功:', config);
          return config;
        })
        .catch(fallbackError => {
          console.error('所有路径都失败了:', fallbackError);
          throw error; // 抛出原始错误
        });
    });
}
