(function executeRule(current, previous) {
	var isDuplicatePresent = new global.GlideQuery('sn_itam_recomm_dashboard')
		.where('id', current.id)
		.where('sys_id', '!=', current.getUniqueValue())
		.selectOne()
		.isPresent();
	if (isDuplicatePresent) {
		gs.addErrorMessage(gs.getMessage('A dashboard with the same ID already exists.'));
		current.setAbortAction(true);
	}
}(current, previous));
