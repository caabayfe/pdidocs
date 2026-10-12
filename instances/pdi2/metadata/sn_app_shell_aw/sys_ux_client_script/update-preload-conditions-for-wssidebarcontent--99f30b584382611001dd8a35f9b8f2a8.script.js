/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    //This is for CONDITIONAL (wsConditionalChatShellResize and wsConditionalChatShellNonResize) render which can only accept state binding for the condition section
    const enableResizeChatShellContainer = api.context.app.enable_resize_shell_container;
    api.setState("enableResizeChatShellContainer", enableResizeChatShellContainer);
    api.setState("enableNonResizeChatShellContainer", !enableResizeChatShellContainer);

   const { hoistedContentConfiguration } = api.elements.wsLayout;

   let showUtilityPanel = false;

    // Check if hoistedContentConfiguration is available in wsLayout
    if (!!hoistedContentConfiguration) {
        const { isHidden, activeHoistedContent, hasHoistedContent } = hoistedContentConfiguration;
        showUtilityPanel = !isHidden && !!activeHoistedContent && hasHoistedContent;
    }

   const isResizePaneMode = enableResizeChatShellContainer || showUtilityPanel;
   // Call the User Pref lookup DB only when Resize Mode is ON
    if (isResizePaneMode) {
        const appId = api.context.app.appId ? api.context.app.appId : api.context.props.appId;
        const userPrefKey = `workspace.preferences.${appId}`;
        api.setState('userPrefKey', userPrefKey);
    }
    
    if (api.context.app.dividerStyles && Object.keys(api.context.app.dividerStyles).length) {
        const newResizePaneConfig = {
            ...api.state.resizePaneConfig,
            dividerStyles: api.context.app.dividerStyles
        }
        api.setState('resizePaneConfig', newResizePaneConfig);
    }

    const toolbarItems = api.data.uxr_app_shell_data_source_1.uxPropertiesAndAuthRoutes?.chrome_toolbar?.global || [];
    for (let i = 0; i < toolbarItems.length; i++) {
        const viewportElementId = toolbarItems[i].viewportInfo?.viewportElementId;
        if (viewportElementId === 'wsInboxSidebar') {
            api.setState('preloadInbox', true);
        }
        if (viewportElementId === 'wsOngoingSidebar') {
            api.setState('preloadOngoing', true);
        }
    }

}
