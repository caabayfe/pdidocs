function onSubmit() {
	// clear any messages that may have been left there
	g_form.clearMessages();

	var result = true;
	var sendReminders = g_form.getValue('send_reminders');
	var reminderLeadTime = g_form.getValue('reminder_lead_time');
	var reminderLeadTimeEl = closest(g_form.getElement('reminder_lead_time'), '.form-group');
	reminderLeadTimeEl.removeClassName('has-error');

	if (sendReminders == 'false')
		g_form.setValue('reminder_lead_time', '2'); // reset value

	if (sendReminders == 'true' && isNaN(reminderLeadTime)) {
		getMessage('"{0}" should be valid number', function(msg) {
			var formattedMsg = new GwtMessage().format(msg, g_form.getLabelOf("reminder_lead_time"));
			g_form.addErrorMessage(formattedMsg);
			reminderLeadTimeEl.addClassName('has-error');
		});
		result = false;
	}

	var coverageInterval = g_form.getValue('coverage_interval');
	var coverageIntervalEl = closest(g_form.getElement('coverage_interval'), '.form-group');
	coverageIntervalEl.removeClassName('has-error');
	if (isNaN(coverageInterval)) {
		getMessage('"{0}" should be valid number', function(msg) {
			var formattedMsg = new GwtMessage().format(msg, g_form.getLabelOf("coverage_interval"));
			g_form.addErrorMessage(formattedMsg);
			coverageIntervalEl.addClassName('has-error');
		});
		result = false;
	}

	return result;
}

function closest(el, selector) {
	var matchesFn;

	// find vendor prefix
	['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'].some(function(fn) {
		if (typeof document.body[fn] == 'function') {
			matchesFn = fn;
			return true;
		}
		return false;
	});

	var parent;

	// traverse parents
	while (el) {
		parent = el.parentElement;
		if (parent && parent[matchesFn](selector)) {
			return parent;
		}
		el = parent;
	}

	return null;
}
