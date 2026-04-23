const MCPTool_scrollPage = {
  name: 'scroll_page',
  description: 'Scroll the current page up, down, or to top/bottom',
  parameters: {
    direction: { type: 'string',  description: 'up | down | top | bottom', required: true },
    amount:    { type: 'number',  description: 'Pixels to scroll (default 400)', required: false },
  },
  async execute({ direction, amount = 400 }) {
    try {
      const wv = document.querySelector('webview.vortex-wv.active');
      if (!wv) return { success: false, error: 'No active tab' };
      const scripts = {
        up:     `window.scrollBy(0, -${amount})`,
        down:   `window.scrollBy(0, ${amount})`,
        top:    `window.scrollTo(0, 0)`,
        bottom: `window.scrollTo(0, document.body.scrollHeight)`,
      };
      const script = scripts[direction];
      if (!script) return { success: false, error: `Unknown direction: ${direction}` };
      await wv.executeJavaScript(script);
      return { success: true, result: `Scrolled ${direction}` };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
