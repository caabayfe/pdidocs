function script({api, event}) {
    const {isHidden, activeHoistedContent, hasHoistedContent} = event.payload;
    const showUtilityPanel = !isHidden && !!activeHoistedContent && hasHoistedContent;
    
    const newResizePaneConfig = {
      ...api.state.resizePaneConfig,
      defaultDisplayedPane: showUtilityPanel ? 'both' : 'right',
    };

    const enableResizeChatShellContainer = api.context.app.enable_resize_shell_container;
    // If resize is enabled then don't do a separate call for lookup user prefrences for a utility panel page
    if (!enableResizeChatShellContainer) {
      // Call the User Pref lookup DB only when showUtilityPanel is true
      if (showUtilityPanel) {
          const appId = api.context.app.appId ? api.context.app.appId : api.context.props.appId;
          const userPrefKey = `workspace.preferences.${appId}`;
          
          api.setState('userPrefKey', ({api}) => {
            if (api.state.userPrefKey === userPrefKey) {
              api.data.look_up_user_preferences_1.refresh();
            }
            return userPrefKey;
          });
      }
    }

    if (showUtilityPanel)
        api.setState('dividerPosition', api.state.savedDividerPosition);

    api.setState('resizePaneConfig', newResizePaneConfig);
}
