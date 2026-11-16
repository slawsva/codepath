const map = document.getElementById('contact-map');
const mapWidth = 1000;
const mapHeight = 620;
const startZoom = 1.25;
let zoom = startZoom;
let centerX = mapWidth / 2;
let centerY = mapHeight / 2;
let visibleWidth;
let visibleHeight;
let pointer;

function clampPosition(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function showMap() {
  const ratio = map.clientWidth / map.clientHeight;
  if (!Number.isFinite(ratio) || ratio <= 0) return;
  visibleWidth = Math.min(mapWidth, mapHeight * ratio) / zoom;
  visibleHeight = Math.min(mapHeight, mapWidth / ratio) / zoom;
  centerX = clampPosition(centerX, visibleWidth / 2, mapWidth - visibleWidth / 2);
  centerY = clampPosition(centerY, visibleHeight / 2, mapHeight - visibleHeight / 2);
  map.setAttribute('viewBox', [centerX - visibleWidth / 2, centerY - visibleHeight / 2, visibleWidth, visibleHeight].join(' '));
  byId('map-in').disabled = zoom >= 4;
  byId('map-out').disabled = zoom <= 1;
}
function changeZoom(factor) {
  zoom = clampPosition(zoom * factor, 1, 4);
  showMap();
}
byId('map-in').addEventListener('click', () => changeZoom(1.32));
byId('map-out').addEventListener('click', () => changeZoom(1 / 1.32));
byId('map-reset').addEventListener('click', () => {
  zoom = startZoom;
  centerX = mapWidth / 2;
  centerY = mapHeight / 2;
  showMap();
});
map.addEventListener('pointerdown', (event) => {
  if (!event.isPrimary || event.button !== 0) return;
  pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
  map.setPointerCapture(event.pointerId);
  map.classList.add('is-dragging');
});
map.addEventListener('pointermove', (event) => {
  if (!pointer || pointer.id !== event.pointerId) return;
  centerX -= (event.clientX - pointer.x) * visibleWidth / map.clientWidth;
  centerY -= (event.clientY - pointer.y) * visibleHeight / map.clientHeight;
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  showMap();
});
map.addEventListener('lostpointercapture', () => {
  pointer = null;
  map.classList.remove('is-dragging');
});
map.addEventListener('keydown', (event) => {
  const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  if (event.key === '+' || event.key === '=') changeZoom(1.32);
  else if (event.key === '-') changeZoom(1 / 1.32);
  else if (moves[event.key]) {
    centerX += moves[event.key][0] * visibleWidth * 0.12;
    centerY += moves[event.key][1] * visibleHeight * 0.12;
    showMap();
  } else return;
  event.preventDefault();
});
new ResizeObserver(showMap).observe(map);
showMap();
