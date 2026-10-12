(function executeRule(current, previous /*null when async*/) {
	if (current.source_sys_rte_eb_entity == current.target_sys_rte_eb_entity){
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Source and Target entity can not be the same entity."));
	}
})(current, previous);
