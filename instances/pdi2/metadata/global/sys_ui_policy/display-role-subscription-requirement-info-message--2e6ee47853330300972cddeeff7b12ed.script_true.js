function onCondition() {
	
	var targetDisplay = g_form.getDisplayBox('user_role'); 
	var usrRole = targetDisplay.getValue();
	
	if ((usrRole != '') && (usrRole != null) || (typeof usrRole != 'undefined')) {
		
		var gR = new GlideRecord("sys_user_role");
		gR.addQuery("name", usrRole);
		gR.query();
		
			if (gR.next()) {
				if (gR.getValue("requires_subscription") == "1") {
					g_form.hideFieldMsg('user_role', true);
					g_form.showFieldMsg('user_role', getMessage('This role is linked to a subscription requirement'), 'info');
			}
		}
	}
}
