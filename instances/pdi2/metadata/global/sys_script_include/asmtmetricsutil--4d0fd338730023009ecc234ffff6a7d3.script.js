var AsmtMetricsUtil = Class.create();
AsmtMetricsUtil.prototype = {
    initialize: function() {
    },

    hasListNewAccess: function() {
        return gs.action.getGlideURI().get('sysparm_view') != 'survey' &&
            !gs.action.getGlideURI().get('sysparm_target').includes('sample_metric') &&
            !gs.action.getGlideURI().get('sysparm_target').includes('asmt_metric.depends_on');
    },

    showAssignAssessment: function() {
        return (gs.hasRole('assessment_admin') || (gs.hasRole('survey_creator') && g_scratchpad.isOwner)) &&
            current.schedule_type == 'on_demand' &&
            current.evaluation_method == 'assessment' &&
            current.active &&
            current.publish_state != 'draft' &&
            current.sys_class_name != 'change_risk_asmt';
    },

    type: 'AsmtMetricsUtil'
};
