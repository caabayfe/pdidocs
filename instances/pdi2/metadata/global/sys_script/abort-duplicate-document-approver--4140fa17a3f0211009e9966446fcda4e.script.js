(function executeRule(current, previous /*null when async*/) {
	var documentApprovers = new GlideRecord('ds_document_approver');
	documentApprovers.addQuery('document',current.document);
	documentApprovers.addQuery('approver',current.approver);
	documentApprovers.addQuery('sequence',current.sequence);
	documentApprovers.addQuery('sys_id', '!=', current.sys_id);
	documentApprovers.query();
	if (documentApprovers.next()) {
		gs.addErrorMessage(gs.getMessage("This document approver with same sequence already exists"));
		current.setAbortAction(true);
	}
})(current, previous);
