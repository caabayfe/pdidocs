/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 */
function script({api, event}) {  
  const {
    hoistedContentConfiguration: {
      activeHoistedContent,
      hasHoistedContent
    }
  } = api.elements.wsLayout;
  const utilityPanelConfigured = !!activeHoistedContent && hasHoistedContent;

  if (!utilityPanelConfigured) {
    const chatRenderedPayload = event.payload?.chatRenderedPayload;
    const isChatShown = chatRenderedPayload.isChatShown;
    
    const newResizePaneConfig = {
      ...api.state.resizePaneConfig,
      defaultDisplayedPane: api.context.app.enable_resize_shell_container && isChatShown ? 'both' : 'right'
    };
     
    if(newResizePaneConfig.defaultDisplayedPane === 'both')
      api.setState('dividerPosition', api.state.savedDividerPosition);
        
    api.setState('resizePaneConfig', newResizePaneConfig);
  }
}
