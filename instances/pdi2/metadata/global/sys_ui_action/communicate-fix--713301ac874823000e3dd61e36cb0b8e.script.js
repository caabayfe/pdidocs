function onCommunicateFix() {
	if (g_form.modified) {
		getMessage("You have unsaved changes. Please save them to continue", function(msg) {
			g_form.addErrorMessage(msg);
		});
		return false;
	}
	g_form.submit('communicate_fix');
}

if (typeof window == "undefined")
	communicateFix(current);

function communicateFix(current) {
	action.setRedirectURL(current);
	var time = new GlideDateTime();
	current.fix_communicated_at = time;
	current.fix_communicated_by = gs.getUserID();
	current.update();
	gs.eventQueue('communicate.fix', current, current.fix_notes);
	gs.addInfoMessage(gs.getMessage('Fix communicated'));
}
