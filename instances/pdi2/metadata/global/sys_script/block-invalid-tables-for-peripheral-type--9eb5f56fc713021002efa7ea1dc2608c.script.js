 (function executeRule(current, previous /*null when async*/) {
			var tables = ['sys_attachment', 'sys_audit', 'sys_journal_field'];
			if (!tables.includes(current.table_identifier.toString())) {
				gs.addErrorMessage(gs.getMessage("A peripheral condition type can only be set for the sys_attachment, sys_audit, and sys_journal_field tables."));
				current.setAbortAction(true);
			}
		})(current, previous); 
