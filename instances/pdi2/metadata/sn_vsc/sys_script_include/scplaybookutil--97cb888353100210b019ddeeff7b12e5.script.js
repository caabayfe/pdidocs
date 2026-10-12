var SCPlaybookUtil = Class.create();
SCPlaybookUtil.prototype = {
	constants: new sn_vsc.SecurityCenterConstants(),
    initialize: function() {},

    updateStepActivity: function(recordId, stepState, stepLabel) {
        recordId.state = stepState;
        recordId.update();
        var bp_context = "";
        var gr = new GlideRecord(this.constants.TABLE_PD_ACTIVITY_CONTEXT);
        gr.addQuery('associated_record', recordId.sys_id);
        gr.query();
        if (gr.next()) {
            bp_context = gr.context;
            var bestPracticeRecord = "";
            var gr_context = new GlideRecord(this.constants.TABLE_PD_CONTEXT);
            if (gr_context.get(bp_context)) {
                bestPracticeRecord = gr_context.input_record;
                var grBP = new GlideRecord(this.constants.BEST_PRACTICES_CONFIG);
                if (grBP.get(bestPracticeRecord)) {
                    grBP.comment = "Step : " + gr.label + "\n State : " + stepLabel;
                    grBP.update();
                }
            }
        }
    },
    getBPStepData: function(bpId) {
        var returnObj = {};
        var completedStepsCount = 0;
        var totalSteps = 0;
        var lastUpdatedBy = "";
        var lastUpdated = "";
        var gr = new GlideRecord('sys_pd_context');
        gr.addQuery('input_record', bpId);
        gr.orderByDesc('sys_created_on');
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            var contextId = gr.sys_id;
            var grActivityContext = new GlideRecord('sys_pd_activity_context');
            grActivityContext.addQuery('context', contextId);
            grActivityContext.addQuery('activity_type', '!=', '');
            grActivityContext.query();
            totalSteps = grActivityContext.getRowCount();
            while (grActivityContext.next()) {
                var sysFlowId = grActivityContext.associated_record.sys_id;

                if (sysFlowId) {
                    var state = grActivityContext.associated_record.state;
                    if (state == 'COMPLETE') {
                        completedStepsCount++;
                        lastUpdatedBy = grActivityContext.associated_record.sys_updated_by;
                        lastUpdated = grActivityContext.associated_record.sys_updated_on;
                    }
                }
            }
        }

        return returnObj = {
            'totalSteps': totalSteps,
            'completedSteps': completedStepsCount,
            'lastUpdatedBy': lastUpdatedBy,
            'lastUpdated': lastUpdated
        };
    },
    type: 'SCPlaybookUtil'
};
