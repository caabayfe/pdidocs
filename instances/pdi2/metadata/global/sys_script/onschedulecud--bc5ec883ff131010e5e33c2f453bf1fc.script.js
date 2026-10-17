(function executeRule(current, previous /*null when async*/ ) {

    var ERROR_TYPES = {
        EXCEEDED_DATA_POINTS: gs.getMessage('The selection exceeds the number of allowed data points'),
        LONGEST_PERIOD: gs.getMessage('The longest sampling period is limited to 1 day'),
        LONGEST_DURATION: gs.getMessage('The longest retention duration is limited to 26 months (794 days)'),
		DURATION_PERIOD_INVALID: gs.getMessage('The duration must be a multiple of period, and period must have second resolution')
    };
	var ERROR_TYPE_NONE = 'NONE';

    if (!(current.duration || current.period)) {
        current.setAbortAction(true);
        var message = gs.getMessage('Invalid input');
        gs.addErrorMessage(message);
        return;
    }

    var metricEditUtil = new sn_clotho.MetricEditUtil();

    var schedValidator = metricEditUtil.getScheduleValidation(current.duration, current.period, current.operation());

    var result = schedValidator.getErrorType();
    if (result == ERROR_TYPE_NONE)
        return;

	var msg = ERROR_TYPES[result] == undefined? result: ERROR_TYPES[result];
    gs.addErrorMessage(msg);
    current.setAbortAction(true);

})(current, previous);
