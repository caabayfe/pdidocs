function onCommunicateWorkaround() {
	if (g_form.modified) {
		getMessage("You have unsaved changes. Please save them to continue", function(msg) {
			g_form.addErrorMessage(msg);
		});
		return false;
	}
	g_form.submit('communicate_workaround_new');
}

if (typeof window == "undefined")
	communicateWorkaround(current);

function communicateWorkaround(current) {
	action.setRedirectURL(current);
	var time = new GlideDateTime();
	current.workaround_communicated_at = time;
	current.workaround_communicated_by = gs.getUserID();
	current.update();
	gs.eventQueue('communicate.workaround', current, current.workaround);
	gs.addInfoMessage(gs.getMessage('Workaround communicated'));
}
