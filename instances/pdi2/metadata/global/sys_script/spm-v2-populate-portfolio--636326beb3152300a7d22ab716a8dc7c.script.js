(function executeRule(current, previous /*null when async*/) {
	
	if (current.spm_taxonomy_node)
		current.spm_service_portfolio = current.spm_taxonomy_node.spm_service_portfolio;	

})(current, previous);
