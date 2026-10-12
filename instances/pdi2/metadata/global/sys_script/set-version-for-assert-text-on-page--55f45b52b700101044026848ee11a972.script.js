(function executeRule(current, previous /*null when async*/) {

	// Custom UI versions are only ever set on the server so clients can't tamper with them
	// If the mugshot_version property is null or deleted it registers as the original custom UI version (15.0)
	current.inputs.mugshot_version = GlideProperties.get("sn_atf.custom_ui.mugshot_version");

})(current, previous);
