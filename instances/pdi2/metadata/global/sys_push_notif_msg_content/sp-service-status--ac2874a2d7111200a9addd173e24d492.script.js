(function buildJSON(/*GlideRecord*/ current, /*String*/ message, /*Object*/ attributes) {
	
	var json = {};
	
	json = {
		"aps" : {
			"sound" : "default"
		},
		"web_path" : "sp?id=service_status&service=" + current.getValue("cmdb_ci")
	};
	
	return json;
	
})(current, message, attributes);
