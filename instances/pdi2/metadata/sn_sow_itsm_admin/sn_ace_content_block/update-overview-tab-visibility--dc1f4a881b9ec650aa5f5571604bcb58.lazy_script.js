(function(context, pageParams, blockcontext) {
    var applicabilitiesGR = new GlideRecord('sys_ux_applicability_m2m_screen');
    // OOB Incident Overview tab screen -> bddf0e1f43932110361dff53e9b8f2aa
    applicabilitiesGR.addQuery('screen', 'bddf0e1f43932110361dff53e9b8f2aa');
    applicabilitiesGR.query();

    while (applicabilitiesGR.next()) {
        applicabilitiesGR.setValue('active', blockcontext.hideOverviewTab == "false");
        applicabilitiesGR.update();
    }
    return {
        isUserCriteriaPropEnabled: gs.getProperty('glide.ux.user_criteria_enabled', false) == "true",
        userCriteriaPropChecked: false
    };
})(context, pageParams, blockcontext);
