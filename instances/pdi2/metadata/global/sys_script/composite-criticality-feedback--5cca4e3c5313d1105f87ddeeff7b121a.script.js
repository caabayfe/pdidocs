(function executeRule(current, previous /*null when async*/ ) {
	var feedbackValue = current.getValue('feedback_value');
    if (feedbackValue) {
        var services = ['HR Criticality Intent', 'criticalityDetection'];
        var feedback = {
            'customerCriticalityFeedback': feedbackValue
        };
        var sourceSysId = current.getElement('prediction.ar_context.task').toString();
        var sourceTable = current.getElement('prediction.task_table').toString();
        var predictionTable = "ml_language_x_prediction_result";
        for (var i = 0; i < services.length; i++) {
            var grp = new GlideRecord(predictionTable);
            grp.addEncodedQuery("source_sys_id=" + sourceSysId + "^source_table=" + sourceTable + "^language_x_service=" + services[i]);
            grp.orderByDesc('sys_updated_on');
            grp.setLimit(1);
            grp.query();
            if (grp.hasNext()) {
                grp.next();
                var g = new MLFeedbackAPI().saveFeedback(feedback, grp.getValue('language_x_solution'), sourceTable.toString(), sourceSysId, grp.getValue('sys_id'), null, predictionTable);
                gs.info("SaveFeedback Response: " + g);
            }
        }
    }

})(current, previous);
