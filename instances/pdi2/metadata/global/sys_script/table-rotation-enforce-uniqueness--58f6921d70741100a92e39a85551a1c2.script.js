preventDuplicate();

function preventDuplicate() {
	var rot = new GlideRecord("sys_table_rotation");
	var sanitizedName = GlideStringUtil.escapeHTML(current.name);
	rot.addQuery("name", sanitizedName);
	rot.query();
	if (rot.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Rotation group already exists for table: {0}", sanitizedName));
	}
}
