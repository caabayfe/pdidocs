(function(context, pageParams, blockcontext) {
    var workspaceId = 'aa881cad73c4301045216238edf6a716';
    var isActive = blockcontext.isSessionTabEnabled;
    var firstColorThreshold = blockcontext.firstColorThreshold;
    var secondColorThreshold = blockcontext.secondColorThreshold;
    var response = null;
    if (!gs.hasRole("sn_sow_interaction.sn_interaction_sow_admin"))
        return response;

    var infoSessionGR = new GlideRecord('information_session_tab_workspace_setting');

    infoSessionGR.addQuery('workspace', workspaceId);
    infoSessionGR.query();

    if (infoSessionGR.next()) {
        if (infoSessionGR.getValue('is_active') !== isActive || infoSessionGR.getValue('first_color_threshold') !== firstColorThreshold || infoSessionGR.getValue('second_color_threshold') !== secondColorThreshold) {
            infoSessionGR.setValue('is_active', isActive);
            infoSessionGR.setValue('first_color_threshold', firstColorThreshold);
            infoSessionGR.setValue('second_color_threshold', secondColorThreshold);
            response = infoSessionGR.update();

        }

        response = "record already updated";
    } else {
        infoSessionGR.workspace = workspaceId;
        infoSessionGR.is_active = isActive;
        infoSessionGR.first_color_threshold = firstColorThreshold;
        infoSessionGR.second_color_threshold = secondColorThreshold;
        response = infoSessionGR.insert();
    }


    return {
        updateResponse: response
    };
})(context, pageParams, blockcontext);
