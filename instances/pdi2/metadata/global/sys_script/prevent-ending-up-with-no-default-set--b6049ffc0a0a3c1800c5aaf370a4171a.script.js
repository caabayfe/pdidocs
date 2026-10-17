
			if (current.operation() == "delete" && current.is_default) {
				current.setAbortAction(true);
				gs.addErrorMessage(gs.getMessage('You cannot delete a default update set'));
			} else if (previous.is_default == true && current.is_default == false) {
				current.setAbortAction(true);
				current.is_default = previous.is_default;
				gs.addErrorMessage(gs.getMessage('You cannot clear the default flag from an update set. Create a new default update set instead'));
			} else if (current.is_default == true && !(current.state == "in progress") && (current.is_default.changes() || !current.isValidRecord())) {
				current.setAbortAction(true);
				gs.addErrorMessage(gs.getMessage('You cannot make an update set a default update set unless it is In progress'));
			}
			
