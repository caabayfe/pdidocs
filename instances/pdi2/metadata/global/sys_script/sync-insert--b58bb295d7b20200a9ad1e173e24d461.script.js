(function executeRule(current, previous /*null when async*/) {

	// Autocreate a CSS Include paired to this new sp_css record,
	// but only if this record wasn't created *from* the CSS Include form.
	// Check sysparm_referring_url to detect this

	var refURL = GlideTransaction.get().getRequestParameter("sysparm_referring_url");
	if (!GlideStringUtil.nil(refURL) && refURL.indexOf("sysparm_target=sp_css_include.") > -1)
		return; // don't create orphaned CSS Include
	
	var include = new GlideRecord("sp_css_include");
	include.name = current.name;
	include.sp_css = current.sys_id;
	include.source = "local";
	include.insert();

})(current, previous);
