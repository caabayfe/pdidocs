
		(function executeRule(current, previous /*null when async*/) {
			var d = current.document;
			var p = current.permission;
			var ur = current.user_role;
			if (DocumentUserRoleCanAccess.isDuplicate(current)) {
				gs.addErrorMessage(gs.getMessage('Record already present with document={0}, permission={1} and user_role={2}', d,  p, ur));
				current.setAbortAction(true);
			}
		})(current, previous);
