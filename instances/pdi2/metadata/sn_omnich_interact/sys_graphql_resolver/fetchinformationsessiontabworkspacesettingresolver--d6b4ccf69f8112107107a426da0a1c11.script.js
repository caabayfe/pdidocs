(function process( /*ResolverEnvironment*/ env) {

    var workspaceId = env.getArguments().workspaceId;
    var infoSessionTabSettingGR = new GlideRecord('information_session_tab_workspace_setting');
    var firstColorThreshold;
    var secondColorThreshold;
    var active = false;
    var settings = null;

    if (infoSessionTabSettingGR.isValid()) {
        infoSessionTabSettingGR.addQuery('workspace', workspaceId);
        infoSessionTabSettingGR.query();

        firstColorThreshold = 30;
        secondColorThreshold = 60;
        if (infoSessionTabSettingGR.next()) {
          if(infoSessionTabSettingGR.getValue('is_active')!==null) {
              active = Boolean(Number(infoSessionTabSettingGR.getValue('is_active')));
          }
          if(infoSessionTabSettingGR.getValue('u_threshold_levels')!==null) {
              settings = infoSessionTabSettingGR.getValue('u_threshold_levels');
          }
          firstColorThreshold = infoSessionTabSettingGR.getValue('first_color_threshold');
          secondColorThreshold = infoSessionTabSettingGR.getValue('second_color_threshold');
        }
    }

    return {
        active: active,
        firstColorThreshold: firstColorThreshold,
        secondColorThreshold: secondColorThreshold,
        settings: settings
    };
})(env);
