// don't allow user to assigne snc_read_only role to himself:
function onBefore(current, previous) {
	var gr = new GlideRecord("sys_user_role");
	gr.get(current.role);
	
	if (gr.getValue("name") == "snc_read_only") {
	      gs.addErrorMessage(gs.getMessage("You cannot assign snc_read_only role to yourself!"));
	      current.setAbortAction(true);
	}
}
