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
