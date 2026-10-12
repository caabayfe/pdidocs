
		(function executeRule(current, previous /*null when async*/) {
			var d = current.document;
			var p = current.permission;
			var u = current.user;
			if (DocumentUserCanAccess.isDuplicate(current)) {
				gs.addErrorMessage(gs.getMessage('Record already present with document={0}, permission={1} and user={2} ', d, p, u));
				current.setAbortAction(true);
			}
		})(current, previous);
