var pr = current.addQuery("sys_id", "javascript:new global.ApprovalDelegationUtil().getOnlyDelegatedApprovals()");
pr.addOrCondition("approver", "javascript:new global.ApprovalDelegationUtil().getApprovers()");
