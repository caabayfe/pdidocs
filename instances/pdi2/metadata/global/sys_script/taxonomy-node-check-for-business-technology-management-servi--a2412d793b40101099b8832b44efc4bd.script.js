(function executeRule(current, previous /*null when async*/) {

	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("{0} or {1} can only be set for business or technology management services",[current.spm_service_portfolio.getLabel(), current.spm_taxonomy_node.getLabel().toLowerCase()]));
})(current, previous);
