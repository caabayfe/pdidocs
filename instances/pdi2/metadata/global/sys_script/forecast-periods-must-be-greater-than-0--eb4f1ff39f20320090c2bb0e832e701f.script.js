(function executeRule(current, previous /*null when async*/) {

	var forecastBasePeriodsMessage = gs.getMessage('Periods should be greater than 0.');
	if (current.forecast_base_type == 2)
		allowGreaterThanZero(current.forecast_base_periods, forecastBasePeriodsMessage);
	
	var forecastPeriodsMessage = gs.getMessage('Periods to forecast should be greater than 0.');
	allowGreaterThanZero(current.forecast_periods, forecastPeriodsMessage);

})(current, previous);

function allowGreaterThanZero(value, errorMessage) {
	if (value <= 0) {
		gs.addInfoMessage(errorMessage);
		value.setError(errorMessage);
		current.setAbortAction(true);
	}
}
