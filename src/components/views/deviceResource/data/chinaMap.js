import echarts from 'echarts/lib/echarts';

let chinaMapPromise = null;
let cachedGeoJson = null;
let centerMap = new Map();
let boundsMap = new Map();

function collectCoordinates(geometry) {
  const coords = [];
  function walk(node) {
    if (!Array.isArray(node)) return;
    if (node.length === 2 && typeof node[0] === 'number' && typeof node[1] === 'number') {
      coords.push(node);
      return;
    }
    node.forEach(walk);
  }
  walk(geometry && geometry.coordinates);
  return coords;
}

function analyzeGeoJson(geoJson) {
  centerMap = new Map();
  boundsMap = new Map();
  if (!geoJson || !geoJson.features) return;
  geoJson.features.forEach(feature => {
    const name = feature.properties && feature.properties.name;
    const center = feature.properties && feature.properties.center;
    if (name && Array.isArray(center) && center.length === 2) {
      centerMap.set(name, center);
    }
    if (!name) return;
    const coords = collectCoordinates(feature.geometry);
    if (coords.length > 0) {
      const lons = coords.map(c => c[0]);
      const lats = coords.map(c => c[1]);
      boundsMap.set(name, {
        minLng: Math.min.apply(null, lons),
        maxLng: Math.max.apply(null, lons),
        minLat: Math.min.apply(null, lats),
        maxLat: Math.max.apply(null, lats),
      });
    }
  });
}

export function ensureChinaMap() {
  if (chinaMapPromise) return chinaMapPromise;
  chinaMapPromise = fetch('/maps/china.json')
    .then(res => res.json())
    .then(geoJson => {
      cachedGeoJson = geoJson;
      echarts.registerMap('china', geoJson);
      analyzeGeoJson(geoJson);
      return geoJson;
    })
    .catch(err => {
      chinaMapPromise = null;
      throw err;
    });
  return chinaMapPromise;
}

export function getChinaGeoJson() {
  return cachedGeoJson;
}

export function getRegionCenter(name) {
  return centerMap.get(name) || null;
}

export function getRegionBounds(name) {
  return boundsMap.get(name) || null;
}

export function computeRegionZoom(name) {
  const bounds = boundsMap.get(name);
  if (!bounds) return { zoom: 1.2, center: null };
  const boxWidth = Math.max(0.1, bounds.maxLng - bounds.minLng);
  const boxHeight = Math.max(0.1, bounds.maxLat - bounds.minLat);
  const zoomX = (62 / boxWidth) * 1.2 * 0.82;
  const zoomY = (36 / boxHeight) * 1.2 * 0.82;
  return {
    zoom: Math.max(3, Math.min(8, Math.min(zoomX, zoomY))),
    center: centerMap.get(name) || null,
  };
}
