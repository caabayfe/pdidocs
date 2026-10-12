(function executeRule(current, previous) {
	if (current.isActionAborted()) {
		return;
	}
	if (current.state != 'closed_complete' && current.state != 'closed_abandoned') {
		current.closed_at = null;
		current.duration = null;
	}
	else {
		var opened_at = current.opened_at.dateNumericValue();
		if (current.closed_at.nil() || current.state.changes()) {
			current.closed_at = new GlideDateTime();
		}
		var closed_at = current.closed_at.dateNumericValue();
		current.duration = new GlideDuration(closed_at-opened_at);
	}
})(current, previous);
