(function executeRule(current, previous /*null when async*/) {

	if (current.todo_parent_filter.is_filter_group == false) {
		gs.addErrorMessage(gs.getMessage('Filters can not have Associated subfilters'));
		current.setAbortAction(true);
		return;
	} else {
		var util = new sn_ex_sp.TodosFilterUtil();
		var isNewRecord = current.isNewRecord();

		if ((isNewRecord || current.todo_parent_filter != previous.todo_parent_filter) &&
			util.getParentFiltersMappingIds(current).indexOf(current.todo_parent_filter) === -1) {
			gs.addErrorMessage(gs.getMessage('Invalid parent filter selected'));
			current.setAbortAction(true);
		}

		if ((isNewRecord || current.todo_child_filter != previous.todo_child_filter) &&
			util.getChildFiltersMappingIds(current).indexOf(current.todo_child_filter) === -1) {
			gs.addErrorMessage(gs.getMessage('Invalid child filter selected'));
			current.setAbortAction(true);
		}
    }

	})(current, previous);
