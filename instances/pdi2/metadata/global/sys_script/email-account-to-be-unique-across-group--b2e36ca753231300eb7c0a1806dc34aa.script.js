(function executeRule(current, previous /*null when async*/) {
	
	var emailAccountArray = current.getValue('email_accounts').split(',');
	var emailAccountGrp = new GlideRecord('sys_email_account_group');
	emailAccountGrp.addNotNullQuery('email_accounts');
	emailAccountGrp.addActiveQuery();
	emailAccountGrp.query();
	var hasAccountBeenAdded = false;
	
	//Iterate through existing email account groups
	while (emailAccountGrp.next()) {
		if (emailAccountGrp.getUniqueValue() == current.sys_id)
			continue;
		var otherEmailAccounts = emailAccountGrp.getValue('email_accounts');
		//Iterate through the email accounts added in current and validate whether any one of them exists in other groups
		for (var i = 0; i < emailAccountArray.length; i ++) {
			if ( otherEmailAccounts.indexOf(emailAccountArray[i]) >= 0) {
				hasAccountBeenAdded = true;
				var emailAccount = new GlideRecord('sys_email_account');
				if (emailAccount.get(emailAccountArray[i]))
					gs.addErrorMessage(gs.getMessage("'{0}' has already been added in '{1}' group.Please select a different Email Account",[GlideStringUtil.escapeHTML(emailAccount.getValue('name')), GlideStringUtil.escapeHTML(emailAccountGrp.getValue('name'))]));
			}
		}
	}
	//skip the BR if the email account in current is added in any other email account group
	if (hasAccountBeenAdded)
		current.setAbortAction(true);

})(current, previous);
