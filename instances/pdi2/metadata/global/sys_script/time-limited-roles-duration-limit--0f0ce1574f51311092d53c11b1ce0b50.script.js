(function executeRule(current, previous /*null when async*/) {

var max_days = gs.getProperty('glide.security.timelimited.roles.allowed_max_days', 5);
var maxDaysInMillis =  max_days * 24 * 60 * 60 * 1000;

var startTime = new GlideDateTime(current.getValue('start_time'));
var endTime = new GlideDateTime(current.getValue('end_time'));

var dt = endTime.getNumericValue() - startTime.getNumericValue();
if (dt > maxDaysInMillis) {
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage('Role cannot be assigned to user for more than {0} days.', max_days));
	return;
}

})(current, previous);
