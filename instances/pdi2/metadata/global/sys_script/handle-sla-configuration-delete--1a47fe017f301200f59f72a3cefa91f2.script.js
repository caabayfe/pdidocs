(function executeRule(current, previous /*null when async*/) {
	
	var slaConfigurationManager = new SNC.SlaConfigurationManager();
	slaConfigurationManager.deleteCiTasksAndAssocRelatedToDeletedConfiguration(current.getUniqueValue());

})(current, previous);
