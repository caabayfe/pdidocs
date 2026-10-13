(function executeRule(current, previous /*null when async*/ ) {

    var ERROR_TYPES = {
		POLICY_MUST_HAVE_SCHEDULE: gs.getMessage('Retention Policy must have a schedule'),
		POLICY_IN_USE: gs.getMessage('Retention Policy is associated with a metric and can\'t be modified '),
		EXCEEDED_MAX_SCHEDULE_COUNT:  gs.getMessage('Retention Policy has exceeded maximum of 3 schedules '),
        EXCEEDED_DATA_POINTS: gs.getMessage('Selection exceeds the number of allowed data points'),
        DUPLICATE_SCHEDULE_PERIOD: gs.getMessage('Duplicate sampling period'),
        DUPLICATE_SCHEDULE_DURATION: gs.getMessage('Duplicate retention duration'),
 		MUST_BE_INCREASING_ORDER: gs.getMessage('Schedule retention durations and sampling periods must be increasing'),
		MUST_BE_MULTIPLE_OF_PREVIOUS: gs.getMessage('Sampling period must be a multiple of the previous schedule\'s period')
    };
	var ERROR_TYPE_NONE = 'NONE';

    if (!current.retention_policy || !current.schedule) {
        current.setAbortAction(true);
        var message = gs.getMessage('Invalid selection.');
        gs.addErrorMessage(message);
        return;
    }

    var metricEditUtil = new sn_clotho.MetricEditUtil();

    var schedValidator = metricEditUtil.getPolicyScheduleValidation(current.retention_policy, previous.schedule, current.schedule, current.operation());
	
    var result = schedValidator.getErrorType();

    if (result == ERROR_TYPE_NONE)
        return;

	var msg = ERROR_TYPES[result] == undefined? result: ERROR_TYPES[result];
    gs.addErrorMessage(msg);
    current.setAbortAction(true);

})(current, previous);
