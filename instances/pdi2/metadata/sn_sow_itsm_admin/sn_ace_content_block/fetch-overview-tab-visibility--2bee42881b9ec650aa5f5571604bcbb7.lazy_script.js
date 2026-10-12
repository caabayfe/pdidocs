(function(context, pageParams, blockcontext) {
    var applicabilityGA = new GlideAggregate('sys_ux_applicability_m2m_screen');
    // OOB Incident Overview tab screen -> bddf0e1f43932110361dff53e9b8f2aa
    applicabilityGA.addEncodedQuery('screen=bddf0e1f43932110361dff53e9b8f2aa^active=true');
    applicabilityGA.addAggregate('COUNT');
    applicabilityGA.query();

    var isApplicabilityActive = false;
    if (applicabilityGA.next()) {
        isApplicabilityActive = applicabilityGA.getAggregate('COUNT') > 0;
    }

    return {
        hideOverviewTab: !isApplicabilityActive,
        isUserCriteriaPropEnabled: gs.getProperty('glide.ux.user_criteria_enabled', false) == "true",
        userCriteriaPropLink: gs.getProperty('glide.servlet.uri') + "sys_properties.do?sys_id=623a47da73205010fd843c78caf6a772",
        userCriteriaPropChecked: false
    };
})(context, pageParams, blockcontext);
