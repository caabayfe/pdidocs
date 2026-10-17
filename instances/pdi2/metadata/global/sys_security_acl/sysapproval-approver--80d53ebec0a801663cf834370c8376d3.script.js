if (gs.hasRole('approval_admin')) {
	//admins can do anything
	answer = true;
} else if ((gs.hasRole('itil') || gs.hasRole('catalog') || gs.hasRole('sn_request_write')) && !GlideProperties.getBoolean("glide.approvals.restrict_delete", false)) {
	//itil and catalog can delete if strict_delete prop is not true
	answer = true 
} else {
	//delegates can change approvals delegated to them
	answer = new ApprovalDelegationUtil().isMyApproval(current);
}
