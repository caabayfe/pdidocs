(function executeRule(current, previous /*null when async*/) {	
	if (current.isActionAborted()) {
		return;
	}

	var totalDuration = 0;
	var sGr = new GlideRecord('interaction_wrap_up_segment');
	sGr.addQuery('interaction', current.interaction);
	sGr.addQuery('state', 'closed');
	sGr.query();
	while (sGr.next()) {
		if (sGr.opened_on.nil() || (sGr.submitted_on.nil() && sGr.confirmed_on.nil()))
			continue;
		var start = sGr.opened_on.dateNumericValue();
		var end = sGr.confirmed_on.nil() ? sGr.submitted_on.dateNumericValue() : sGr.confirmed_on.dateNumericValue();
		totalDuration = totalDuration + end - start;
	}

	var intGr = new GlideRecord('interaction');
	if (intGr.get(current.interaction)) {
		intGr.setValue('wrap_up_duration', new GlideDuration(totalDuration));

		// Turn off workflow on this update in non-external case because an
		// interaction update has already occurred along with wrap up segment update.
		if (!current.external)
			intGr.setWorkflow(false);

		intGr.update();
	}

})(current, previous);
