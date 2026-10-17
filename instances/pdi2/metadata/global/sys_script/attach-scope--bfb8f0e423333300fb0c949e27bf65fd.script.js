(function executeRule(current, previous /*null when async*/) {

	var scope;
	
	// Check connect/AWA queues and extension point
	scope = new InteractionSecurityUtils().getScopeForInteraction(current);
	if (scope) {
		updateApplication(scope, current);
		return;
	}

	// Check workspace transaction
	var transaction = GlideTransaction.get().getRequest();
	if (transaction) {
		var url = transaction.getHeader("referer");
		scope = url ? new InteractionSecurityUtils().getScopeForWorkspaceUrl(url) : "";
		if (scope) {
			updateApplication(scope, current);
			return;
		}
	}

	// Otherwise, apply global scope
	scope = 'global';
	updateApplication(scope, current);

})(current, previous);

function updateApplication(scope, current) {
	current.setValue('application', scope);
}
