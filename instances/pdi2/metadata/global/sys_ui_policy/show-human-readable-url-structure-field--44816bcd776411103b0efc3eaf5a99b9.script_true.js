function onCondition() {
	var rec = new GlideRecord('sys_properties');
	rec.addQuery('name', '=', 'glide.service_portal.enable_human_readable_urls');
	rec.query(queryResponse);
	
	function queryResponse(rec) {
		var globalProp = "true";
		if(rec.next())
			globalProp = rec.value;

		if(globalProp == "false")
			g_form.setDisplay('human_readable_url_structure', false);
	}
}
