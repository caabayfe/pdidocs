function clickPreview() {
	// the following is what we have to do to make this client
	// script work from a list and form, with today's code
	var sysId = typeof rowSysId == 'undefined' ? gel('sys_uniqueValue').value : rowSysId;
	var msg = getMessage("Preview Email");
	var gr = new GlideRecord("sys_email");
	gr.addQuery("sys_id", sysId);
	gr.query();
	if (gr.next()) {
		var dd = new GlideModal("preview_email");
		dd.setTitle(msg);
		dd.setWidth(800);
		dd.setPreference('sysparm_id', sysId);
		dd.render();
	} else {
		alert("Email not found: " + sysId);
	}
}
