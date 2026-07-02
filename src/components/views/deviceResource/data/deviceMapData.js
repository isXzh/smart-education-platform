const DEVICE_MAP_DETAILS = [
  {
    province: '四川省',
    schools: [
      {
        name: '第一实验小学',
        lat: 30.67,
        lng: 104.06,
        devices: [
          { id: 'SC-001', name: '保障箱#01', sip: '+99111233458230946', school: '第一实验小学', status: 'online' },
          { id: 'SC-002', name: '保障箱#02', sip: '+99111233458230947', school: '第一实验小学', status: 'online' },
          { id: 'SC-003', name: '保障箱#03', sip: '+99111233458230948', school: '第一实验小学', status: 'offline' },
          { id: 'SC-004', name: '保障箱#04', sip: '+99111233458230949', school: '第一实验小学', status: 'abnormal' },
          { id: 'SC-005', name: '保障箱#05', sip: '+99111233458230950', school: '第一实验小学', status: 'online' },
        ],
      },
      {
        name: '第二实验小学',
        lat: 30.58,
        lng: 104.25,
        devices: [
          { id: 'SC-006', name: '保障箱#06', sip: '+99111233458230951', school: '第二实验小学', status: 'online' },
          { id: 'SC-007', name: '保障箱#07', sip: '+99111233458230952', school: '第二实验小学', status: 'online' },
          { id: 'SC-008', name: '保障箱#08', sip: '+99111233458230953', school: '第二实验小学', status: 'offline' },
          { id: 'SC-009', name: '保障箱#09', sip: '+99111233458230954', school: '第二实验小学', status: 'online' },
        ],
      },
    ],
  },
  {
    province: '湖北省',
    schools: [
      {
        name: '第三实验中学',
        lat: 30.59,
        lng: 114.31,
        devices: [
          { id: 'HB-001', name: '保障箱#10', sip: '+99111233458230955', school: '第三实验中学', status: 'online' },
          { id: 'HB-002', name: '保障箱#11', sip: '+99111233458230956', school: '第三实验中学', status: 'abnormal' },
          { id: 'HB-003', name: '保障箱#12', sip: '+99111233458230957', school: '第三实验中学', status: 'online' },
          { id: 'HB-004', name: '保障箱#13', sip: '+99111233458230958', school: '第三实验中学', status: 'offline' },
        ],
      },
    ],
  },
  {
    province: '北京市',
    schools: [
      {
        name: '兴图新科高中部',
        lat: 39.9,
        lng: 116.41,
        devices: [
          { id: 'BJ-001', name: '保障箱#14', sip: '+99111233458230959', school: '兴图新科高中部', status: 'online' },
          { id: 'BJ-002', name: '保障箱#15', sip: '+99111233458230960', school: '兴图新科高中部', status: 'online' },
          { id: 'BJ-003', name: '保障箱#16', sip: '+99111233458230961', school: '兴图新科高中部', status: 'online' },
        ],
      },
    ],
  },
  {
    province: '广东省',
    schools: [
      {
        name: '深圳南山实验学校',
        lat: 22.54,
        lng: 113.94,
        devices: [
          { id: 'GD-001', name: '保障箱#17', sip: '+99111233458230962', school: '深圳南山实验学校', status: 'online' },
          { id: 'GD-002', name: '保障箱#18', sip: '+99111233458230963', school: '深圳南山实验学校', status: 'online' },
          { id: 'GD-003', name: '保障箱#19', sip: '+99111233458230964', school: '深圳南山实验学校', status: 'offline' },
        ],
      },
    ],
  },
  {
    province: '浙江省',
    schools: [
      {
        name: '杭州育才小学',
        lat: 30.25,
        lng: 120.16,
        devices: [
          { id: 'ZJ-001', name: '保障箱#20', sip: '+99111233458230965', school: '杭州育才小学', status: 'online' },
          { id: 'ZJ-002', name: '保障箱#21', sip: '+99111233458230966', school: '杭州育才小学', status: 'abnormal' },
          { id: 'ZJ-003', name: '保障箱#22', sip: '+99111233458230967', school: '杭州育才小学', status: 'online' },
          { id: 'ZJ-004', name: '保障箱#23', sip: '+99111233458230968', school: '杭州育才小学', status: 'online' },
        ],
      },
    ],
  },
];

export const DEVICE_STATUS_META = {
  online: { label: '在线', color: '#52C41A', bg: '#F6FFED' },
  offline: { label: '离线', color: '#8C8C8C', bg: '#F5F5F5' },
  abnormal: { label: '异常', color: '#FA8C16', bg: '#FFF7E6' },
};

export const DEVICE_STATUS_KEYS = ['online', 'offline', 'abnormal'];

export const DEVICE_MAP_DATA = DEVICE_MAP_DETAILS.map(detail => ({
  name: detail.province,
  value: detail.schools.reduce((sum, school) => sum + school.devices.length, 0),
  detail,
}));

export function countDeviceMapStats(devices) {
  const counts = { total: 0, online: 0, offline: 0, abnormal: 0 };
  devices.forEach(d => {
    counts.total++;
    if (counts[d.status] !== undefined) counts[d.status]++;
  });
  return {
    ...counts,
    onlineRate: counts.total > 0 ? ((counts.online / counts.total) * 100).toFixed(1) : '0.0',
  };
}

export function getDeviceMapSchools(regionName) {
  const region = DEVICE_MAP_DETAILS.find(d => d.province === regionName);
  if (!region) return [];
  return region.schools.map(school => ({
    name: school.name,
    value: school.devices.length,
    lat: school.lat,
    lng: school.lng,
    region: regionName,
    detail: school,
    level: 'school',
  }));
}

export function getDeviceOverviewStats() {
  const devices = DEVICE_MAP_DETAILS.reduce((list, region) => {
    return list.concat(region.schools.reduce((acc, school) => acc.concat(school.devices), []));
  }, []);
  return countDeviceMapStats(devices);
}

export function getDeviceRegionStats(regionName) {
  const region = DEVICE_MAP_DETAILS.find(d => d.province === regionName);
  if (!region) return { total: 0, online: 0, offline: 0, abnormal: 0, onlineRate: '0.0' };
  return countDeviceMapStats(region.schools.reduce((list, school) => list.concat(school.devices), []));
}

function mapDeviceStatusToConfirmStatus(status) {
  const map = { online: 1, offline: 0, abnormal: 3 };
  return map[status] === undefined ? 0 : map[status];
}

export function buildDeviceFromMapItem(region, mapDevice) {
  return {
    id: mapDevice.id,
    deviceName: mapDevice.name,
    number: mapDevice.sip,
    deptNamePath: `${region}/${mapDevice.school}`,
    deptName: mapDevice.school,
    confirmStatus: mapDeviceStatusToConfirmStatus(mapDevice.status),
    activeTime: '2026-03-15',
    expireDate: '2027-03-15',
    lastHeartbeatAt: new Date().toISOString(),
  };
}
