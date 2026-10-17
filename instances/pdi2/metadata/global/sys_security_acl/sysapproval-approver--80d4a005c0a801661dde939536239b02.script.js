if (gs.getProperty("glide.approvals.restrict_by_record", "false") == "true")
	answer = gs.hasRole('approval_admin') || gs.hasRole('itil') || gs.hasRole('catalog') || gs.hasRole('sn_request_write') || ((new ApprovalDelegationUtil().isMyApproval(current)) && hasAccessToDocument(current));
else
	answer = gs.hasRole('approval_admin') || gs.hasRole('itil') || gs.hasRole('catalog') || gs.hasRole('sn_request_write') || (new ApprovalDelegationUtil().isMyApproval(current)) || hasAccessToDocument(current);
