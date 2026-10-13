(function executeRule(current, previous /*null when async*/ ) {

    if (!current.sys_id) {
        current.setAbortAction(true);
        var message = gs.getMessage('Invalid policy.');
        gs.addErrorMessage(message);
        return;
    }

    var metricEditUtil = new sn_clotho.MetricEditUtil();

    var hasMetric = metricEditUtil.checkPolicyHasMetrics(current.sys_id);
    if (hasMetric) {
        var message = gs.getMessage('Retention policy cannot be deleted as it is in use by one or more metrics.');
        gs.addErrorMessage(message);
        current.setAbortAction(true);
		var url = gs.generateURL(current.getTableName(), current.sys_id);
		gs.setRedirect(url);
        return;
    }

})(current, previous);
