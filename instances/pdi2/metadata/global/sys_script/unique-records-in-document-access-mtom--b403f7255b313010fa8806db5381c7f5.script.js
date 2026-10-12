
		(function executeRule(current, previous /*null when async*/) {
			var d = current.document;
			var p = current.permission;
			var ug = current.user_group;
			if (DocumentUserGroupCanAccess.isDuplicate(current)) {
				gs.addErrorMessage(gs.getMessage('Record already present with document={0}, permission={1} and user_group={2} ', d, p, ug));
				current.setAbortAction(true);
			}
		})(current, previous);
