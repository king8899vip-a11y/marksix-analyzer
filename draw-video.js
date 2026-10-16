const drawVideoDialog = document.getElementById('drawVideoDialog');
const drawVideo = document.getElementById('hkjcDrawVideo');
document.getElementById('drawVideoOpen').addEventListener('click', () => {
  drawVideoDialog.showModal();
  drawVideo.play().catch(() => {});
});
document.getElementById('drawVideoClose').addEventListener('click', () => drawVideoDialog.close());
drawVideoDialog.addEventListener('close', () => {
  drawVideo.pause();
  document.getElementById('drawVideoOpen').focus();
});

const drawPlayer = document.getElementById('drawLandscapePlayer');
drawVideo.removeAttribute('poster');
drawVideo.addEventListener('loadedmetadata', () => {
  const w = drawVideo.videoWidth, h = drawVideo.videoHeight;
  const screen = drawPlayer.querySelector('.draw-landscape-screen');
  screen.style.aspectRatio = h + '/' + w;
  drawVideo.style.width = (w / h * 100) + '%';
  drawVideo.style.height = (h / w * 100) + '%';
});
document.getElementById('drawPlay').addEventListener('click', () => {
  if (drawVideo.paused) drawVideo.play().catch(() => {}); else drawVideo.pause();
});
document.getElementById('drawMute').addEventListener('click', e => {
  drawVideo.muted = !drawVideo.muted;
  e.target.textContent = drawVideo.muted ? '取消静音' : '静音';
});
document.getElementById('drawFullscreen').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  else if (drawPlayer.requestFullscreen) drawPlayer.requestFullscreen().catch(() => {});
});

const nextSchedule = document.getElementById('nextDrawSchedule');
if (nextSchedule && new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Hong_Kong',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()) > nextSchedule.dataset.drawDate) nextSchedule.textContent = '下期开奖时间：等待官方更新';
