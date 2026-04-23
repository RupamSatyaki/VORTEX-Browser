const MCPTool_muteTab = {
  name: 'mute_tab',
  description: 'Mute or unmute a tab',
  parameters: {
    tabId: { type: 'string',  description: 'Tab ID (omit for current)', required: false },
    mute:  { type: 'boolean', description: 'true to mute, false to unmute', required: false },
  },
  execute({ tabId, mute = true } = {}) {
    try {
      const id = tabId || Tabs.getActiveId();
      vortexAPI.invoke('tab:setMuted', id, mute);
      return { success: true, result: `Tab ${mute ? 'muted' : 'unmuted'}` };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
