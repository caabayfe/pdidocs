
		(function executeRule(current, previous /*null when async*/) {
			var d = current.document;
			var p = current.permission;
			var uc = current.user_criteria;
			if (DocumentUserCriteriaCanAccess.isDuplicate(current)) {
				gs.addErrorMessage(gs.getMessage('Record already present with document={0}, permission={1} and user_criteria={2} ', d, p, uc));
				current.setAbortAction(true);
			}
		})(current, previous);
