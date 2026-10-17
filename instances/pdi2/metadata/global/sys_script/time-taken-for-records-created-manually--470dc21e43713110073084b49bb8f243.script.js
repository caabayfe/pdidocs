(function executeRule(current, previous /*null when async*/) {
	if (current.started_at < current.completed_at) {
        var startedAt = new GlideDateTime(current.started_at.getDisplayValue());
        var completedAt = new GlideDateTime(current.completed_at.getDisplayValue());
        current.setValue('time_taken', completedAt.getNumericValue() - startedAt.getNumericValue());
    }
})(current, previous);
