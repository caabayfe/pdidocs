(function buildJSON(/*GlideRecord*/ current, /*String*/ message, /*Object*/ attributes) {
	var json = {};
	
	json = {
		"aps" : {
			"sound" : "default"
		},
		"record" : {
			"table" : current.table,
			"sys_id" : current.document
		}
	};
	
	return json;
	
})(current, message, attributes);
