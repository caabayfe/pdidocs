(function executeRule(current, previous /*null when async*/) {

		var util = new sn_ex_sp.TodosFilterUtil();
		var filter = current.filter;

		if (current.isNewRecord() || current.filter != previous.filter) {

			if (util.alreadyAddedToCategory(filter)) {
				gs.addErrorMessage(gs.getMessage('Filter is already mapped to a category'));
				current.setAbortAction(true);
			} else if (util.alreadyAddedToFilterGroup(filter)) {
				gs.addErrorMessage(gs.getMessage('Filter is already mapped to a Filter Group'));
				current.setAbortAction(true);
			}
		}

	})(current, previous);
