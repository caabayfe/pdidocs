(function executeRule(current, previous /*null when async*/ ) {

    function checkAllItemsComplete(executionSysId) {
        var ga = new GlideAggregate('sys_error_action_exec_item');
        ga.addQuery('action_execution', executionSysId);
        ga.addQuery('state', 'IN', 'queued,in_progress');
        ga.addAggregate('COUNT');
        ga.query();

        return ga.next() ? parseInt(ga.getAggregate('COUNT'), 10) === 0 : true;
    }

    // Determine the aggregate parent state from terminal item outcomes.
    // Priority: failed > timeout > cancelled > completed.
    function computeParentState(executionSysId) {
		var priority = [
			EFConstants.EXECUTION_STATES.FAILED,
			EFConstants.EXECUTION_STATES.TIMEOUT,
			EFConstants.EXECUTION_STATES.CANCELLED
		];
		var states = {};
		var ga = new GlideAggregate('sys_error_action_exec_item');
		ga.addQuery('action_execution', executionSysId);
		ga.addQuery('state', 'IN', priority);
		ga.addAggregate('COUNT');
		ga.groupBy('state');
		ga.query();
		while (ga.next()) {
			if (parseInt(ga.getAggregate('COUNT'), 10) > 0) {
				states[ga.getValue('state')] = true;
			}
		}
		
		for (var i = 0; i < priority.length; i++) {
			if (states[priority[i]]) {
				return priority[i];
			}
		}
        return EFConstants.EXECUTION_STATES.COMPLETED;
    }

    function setParentExecutionState(executionSysId, state) {
        if (!executionSysId) return;

        var parent = new GlideRecord('sys_error_action_exec');
        parent.addQuery('sys_id', executionSysId);
        parent.addQuery('state', 'IN', 'queued,in_progress');
        parent.query();

        while (parent.next()) {
            var startTime = new GlideDateTime(parent.sys_created_on);
            var endTime = new GlideDateTime();
            var durationMs = endTime.getNumericValue() - startTime.getNumericValue();

            parent.execution_time_ms = durationMs;
            parent.state = state;
            parent.update();
        }
    }

    var executionSysId = current.getValue('action_execution');
    if (checkAllItemsComplete(executionSysId)) {
        var parentState = computeParentState(executionSysId);
        setParentExecutionState(executionSysId, parentState);
    }

})(current, previous);
