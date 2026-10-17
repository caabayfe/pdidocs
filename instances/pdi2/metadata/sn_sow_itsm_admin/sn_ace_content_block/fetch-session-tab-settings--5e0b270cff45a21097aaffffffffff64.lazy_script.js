(function(context, pageParams, blockcontext) {
 
    var infoSessionGR = new GlideRecord('information_session_tab_workspace_setting');
    var workspaceId = 'aa881cad73c4301045216238edf6a716';
    var isSessionTabEnabled;
    var firstSelectedItem;
    var secondSelectedItem;

    infoSessionGR.addQuery('workspace', workspaceId);
    infoSessionGR.query();
 
    if (infoSessionGR.next()) {
        isSessionTabEnabled = infoSessionGR.is_active;
        firstColorThreshold = Number(infoSessionGR.first_color_threshold);
        secondColorThreshold = Number(infoSessionGR.second_color_threshold);
        firstSelectedItem = Math.floor(firstColorThreshold / 60) > 10 ? 11 : Math.floor(firstColorThreshold / 60) + 1;
        secondSelectedItem = Math.floor(secondColorThreshold / 60) > 10 ? 11 : Math.floor(secondColorThreshold / 60) + 1;

    } else {
        firstColorThreshold = 30;
        secondColorThreshold = 120;
        firstSelectedItem = 1;
        secondSelectedItem = 3;
        isSessionTabEnabled = false;
    }

    return {
        isSessionTabEnabled: isSessionTabEnabled,
        firstSelectedItem: firstSelectedItem,
        secondSelectedItem: secondSelectedItem,
        firstColorThreshold: firstColorThreshold,
        secondColorThreshold: secondColorThreshold
    };
})(context, pageParams, blockcontext);
