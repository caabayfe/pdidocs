(function runAction(/*Optional GlideRecord*/ current) {
	
	if (current.state == 'approved') {
		return;
	}
	
	if (current.state == 'requested' && (gs.hasRole('admin') || gs.hasRole('approval_admin') || (new ApprovalDelegationUtil().isMyApproval(current)))) {
		current.state = 'approved';
		current.update();
	} else {
		var number = current.sysapproval.number;
		var errorMessage;

		if (typeof number === "undefined" || number === null) {
			errorMessage = gs.getMessage("There was an error approving this request.");
		} else {
			errorMessage = gs.getMessage("There was an error approving {0}.", number);
		}

		return new Error(errorMessage);
	}
	
})(current);
