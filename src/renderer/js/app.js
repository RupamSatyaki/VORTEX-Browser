document.addEventListener('DOMContentLoaded', async () => {
  TabPreview.init();
  ContextMenu.init();
  Navigation.render();
  await WebView.init();
  Tabs.createTab('https://www.google.com');
});
