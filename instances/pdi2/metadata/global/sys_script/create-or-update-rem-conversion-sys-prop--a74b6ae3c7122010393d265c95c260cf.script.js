(function executeRule(current, previous /*null when async*/) {
	
	var prevPropName = "";
	if (current.operation() != "delete")
		prevPropName = getPropName(previous.url_suffix.toString());
	
	var currPropName = getPropName(current.url_suffix.toString()); 
	
	if (current.operation() == "update") {
		var gr = new GlideRecord("sys_properties");
		gr.addQuery("name", prevPropName);
		gr.query();

		if (gr.next()) {
			gr.setValue("name", currPropName);
			gr.update();
		}
	}

	if (current.operation() == "insert") {
		var newRec = new GlideRecord("sys_properties");
		newRec.initialize();
		newRec.setValue("name", currPropName);
		newRec.setValue("description", "If true, portal css would be in rem units");
		newRec.setValue("ignore_cache", true);
		newRec.setValue("type", "boolean");
		newRec.setValue("value", true);
		newRec.insert();
	}
	
	if (current.operation() == "delete") {
		var delRec = new GlideRecord("sys_properties");
		if (delRec.get("name", currPropName))
			delRec.deleteRecord();
	}
	
	function getPropName(urlSuffix) {
		return "glide.service_portal.resize_text." + urlSuffix + ".enable_rem_conversion";
	}
	
})(current, previous);
