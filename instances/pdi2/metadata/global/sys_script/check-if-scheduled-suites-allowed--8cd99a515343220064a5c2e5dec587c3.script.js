(function executeRule(current, previous /*null when async*/) {

	if (previous.value == current.value)
		return;

	var gr = new GlideRecord('sys_properties');
	gr.addQuery('name', 'sn_atf.runner.enabled');
	gr.query();
	if (!gr.next())
		return;

    var isRunnerEnabled = gr.getValue('value');
    var runnerLastModified = gr.getValue('sys_updated_on');
	var now = new GlideDateTime();
	var secondsAgoRunnerPropertyModified = gs.dateDiff(runnerLastModified, now, true);
	if (previous.value == 'false' && current.value == 'true') {
		if (isRunnerEnabled == 'false') {
			//Check if runner property was just disabled (<5sec ago) and this property is now trying to be turned on.
		    //If so, the user was on the multiple properties page and tried to turn off just the test runner property, which
		    //automatically turned off this property. So lets not turn it right back on again.
		    if (secondsAgoRunnerPropertyModified < 5) {
			    gs.log('Not allowing scheduled suite execution property to be turned on because runner property was just turned off');
			    current.setAbortAction(true);
			} else {
			    gs.addErrorMessage(gs.getMessage('Cannot enable scheduled suites without enabling the test execution property'));
			    current.setAbortAction(true);
			}
		}
	} else if (previous.value == 'true' && current.value == 'false') {
		if (isRunnerEnabled == 'true') {
		    //Check if runner property was just enabled (<5sec ago) and this property is now trying to be turned off.
		    //If so, the user was on the multiple properties page and checked only the runner property, which
		    //automatically turned on this property. So lets not turn it right back off again.
		    if (secondsAgoRunnerPropertyModified < 5) {
		        gs.log('Not allowing scheduled suite execution property to be turned off because runner property was just turned on');
			    current.setAbortAction(true);
			}
		}
	}

})(current, previous);
