(function runAction(/*Optional GlideRecord*/ current) {
	
	if (current.state == 'rejected') {
		return;
	}
	
	if (current.state == 'requested' && (gs.hasRole('approval_admin') || (new ApprovalDelegationUtil().isMyApproval(current)))) {
		current.state = 'rejected';
		current.update();
	} else {
		var number = current.sysapproval.number;
		var errorMessage;

		if (typeof number === "undefined" || number === null) {
			errorMessage = gs.getMessage("There was an error rejecting this request.");
		} else {
			errorMessage = gs.getMessage("There was an error rejecting {0}.", number);
		}

		return new Error(errorMessage);
	}
	
})(current);
