(function executeRule(current, previous /*null when async*/) {
	var jobName = current.name;
	if(!gs.nil(jobName))
		jobName = GlideStringUtil.escapeHTML(current.name);
	var userTz = gs.getSession().getTimeZoneName();
	var runAsTz = GlideUser.getSysTimeZone();
	if (current.run_as_tz)
		runAsTz = current.run_as_tz;

	if (current.score_operator == 'relative') {
		var startIntervalMsg = getIntervalMessage(current.score_relative_start_interval, current.score_relative_start);
		var endIntervalMsg = getIntervalMessage(current.score_relative_end_interval, current.score_relative_end);
		gs.addInfoMessage(gs.getMessage('The job {0} will collect scores starting from {1} {2} ago to {3} {4} ago as specified in the <b>Relative start</b> and <b>Relative end</b> fields. The collection time is based on the {5} timezone as defined in the <b>Run as tz</b> field.', [jobName, current.score_relative_start, startIntervalMsg, current.score_relative_end, endIntervalMsg, runAsTz]));
	} else
		gs.addInfoMessage(gs.getMessage('The job {0} will collect scores for the period {1} to {2}.', [jobName, current.score_fixed_start.getDisplayValue(), current.score_fixed_end.getDisplayValue()]));

	if (current.run_type != 'daily' && current.run_type != 'weekly' && current.run_type != 'monthly')
		return;

	if (!current.isNewRecord()) {
		var gr = new GlideRecord('sys_trigger');
		gr.addQuery('document_key',current.getValue('sys_id'));
		//ignore sys_trigger record for execute now
		gr.addQuery('trigger_type', '!=', 0);
		gr.setLimit(1);
		gr.query();
		gr.next();
		var nextExecution = gr.next_action;

		gs.addInfoMessage(gs.getMessage('The next execution of job {0} is at {1} {2} ({3} UTC).', [jobName, nextExecution.getDisplayValue(), userTz, nextExecution]));
	}

})(current, previous);

function getIntervalMessage(interval, value) {
	if (interval == 'days') {
		if (value == 1)
			return gs.getMessage('day');
		else
			return gs.getMessage('days');
	}
	if (interval == 'weeks') {
		if (value == 1)
			return gs.getMessage('week');
		else
			return gs.getMessage('weeks');
	}
	if (interval == 'months') {
		if (value == 1)
			return gs.getMessage('month');
		else
			return gs.getMessage('months');
	}
	if (interval == 'periods') {
		if (value == 1)
			return gs.getMessage('period');
		else
			return gs.getMessage('periods');
	}
}
