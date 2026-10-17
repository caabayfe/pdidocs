check();

function check() {
	if (current.auto_gen_password == 1) {
		if ((current.send_email == 0) && (current.display_password == 0)) {
			var errMsg = gs.getMessage("If you select 'Auto-generate password', then you must select 'Display password', 'Email password', or both options");
			gs.addErrorMessage(errMsg);
			current.setAbortAction(true);
		}
		if (current.password_needs_reset == 0) {
			var warningMsg = gs.getMessage("If you select 'Auto-generate password', then it is recommended to select 'User must reset password' option");
			gs.addInfoMessage(warningMsg);
		}
	} else {
		// Turn off any properties depending on Auto-generate password
		current.password_needs_reset = 0;
		current.send_email = 0;
		current.display_password = 0;
	}
}
