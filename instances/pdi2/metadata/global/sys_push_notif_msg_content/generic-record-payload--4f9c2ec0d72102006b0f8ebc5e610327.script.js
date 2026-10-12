(function buildJSON(/*GlideRecord*/ current, /*String*/ message, /*Object*/ attributes) {
	
	var json = {};
	
	json = {
		"aps" : {
			"sound" : "default"
		},
		"record" : {
			"table" : current.getTableName(),
			"sys_id" : current.sys_id
		}
	};
	
	return json;
	
})(current, message, attributes);
