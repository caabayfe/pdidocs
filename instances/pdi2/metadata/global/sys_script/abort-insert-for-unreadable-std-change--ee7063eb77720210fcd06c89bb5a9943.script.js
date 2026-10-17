(function executeRule(current, previous /*null when async*/) {
	if (!current.std_change_producer_version.std_change_producer.canRead() || !GlideappCatalogItem.get(current.std_change_producer_version.std_change_producer).canView()) {
		gs.addErrorMessage(gs.getMessage("This Standard Change does not exist or you do not have access to it"));
		current.setAbortAction(true);
	}
})(current, previous);
