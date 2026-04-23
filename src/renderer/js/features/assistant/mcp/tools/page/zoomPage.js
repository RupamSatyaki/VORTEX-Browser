const MCPTool_zoomPage = {
  name: 'zoom_page',
  description: 'Set the zoom level of the current page',
  parameters: {
    level: { type: 'number', description: 'Zoom level: 0.5 to 3.0 (1.0 = 100%)', required: true },
  },
  execute({ level }) {
    try {
      const wv = document.querySelector('webview.vortex-wv.active');
      if (!wv) return { success: false, error: 'No active tab' };
      const clamped = Math.min(3.0, Math.max(0.5, level));
      wv.setZoomFactor(clamped);
      return { success: true, result: `Zoom set to ${Math.round(clamped * 100)}%` };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
