import request from './request';
import axios from 'axios';
const http = {
  get(url, params) {
    const config = {
      method: 'get',
      url: url,
      urlType: 'businessURL',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    };
    if (params) {
      config.params = params;
    }
    return request(config);
  },
  getFile(url, params) {
    const config = {
      method: 'get',
      url: url,
      urlType: 'businessURL',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      responseType: 'blob', // 关键：必须设置
    };
    if (params) {
      config.params = params;
    }
    return request(config);
  },
  post(url, params) {
    const config = {
      method: 'post',
      url: url,
      urlType: 'businessURL',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    };
    if (params) {
      config.data = params;
    }
    return request(config);
  },
  postFile(url, params) {
    const config = {
      method: 'post',
      url: url,
      urlType: 'businessURL',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    if (params) {
      config.data = params;
    }
    return request(config);
  },
  put(url, params) {
    const config = {
      method: 'put',
      url: url,
      urlType: 'businessURL',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    if (params) {
      config.data = params;
    }
    return request(config);
  },
  put2(url, params) {
    const config = {
      method: 'put',
      url: url,
      urlType: 'businessURL',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    };
    if (params) {
      config.data = params;
    }
    return request(config);
  },
  delete(url, params) {
    const config = {
      method: 'delete',
      url: url,
      urlType: 'businessURL',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    };
    if (params) {
      config.params = params;
    }
    return request(config);
  },
};
export default http;
