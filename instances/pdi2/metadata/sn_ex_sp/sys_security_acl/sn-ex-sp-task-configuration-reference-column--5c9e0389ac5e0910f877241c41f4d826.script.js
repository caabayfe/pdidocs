if (current.isNewRecord())
		answer = true;
	else
		answer = new sn_ex_sp.ApprovalHubUtil().canEditTableColumn(current.getUniqueValue());
