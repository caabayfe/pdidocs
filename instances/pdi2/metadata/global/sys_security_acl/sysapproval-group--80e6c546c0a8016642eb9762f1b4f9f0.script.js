answer = gs.hasRole('approval_admin') || gs.hasRole('itil') || gs.hasRole('catalog') || (new ApprovalDelegationUtil().isMyApproval(current));
