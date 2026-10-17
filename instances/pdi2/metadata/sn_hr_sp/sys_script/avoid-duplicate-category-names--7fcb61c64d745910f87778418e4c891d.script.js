(function executeRule(current, previous /*null when async*/) {

		if(new sn_ex_sp.TodosFilterUtil().categoryWithSameNameExists(current)) {
			gs.addErrorMessage(gs.getMessage("Category with same name already exists. Please choose another name for the category."));
			current.setAbortAction(true);
		}

	})(current, previous);
