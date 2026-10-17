(function buildJSON(/*GlideRecord*/ current, /*String*/ message, /*Object*/ attributes) {
	
	// SLA push notications link back to the associated task record	
	var json = {
		"aps" : {
			"sound" : "default"
		},
		"record" : {
			"table" : current.task.sys_class_name + "",
			"sys_id" : current.task.sys_id + ""
		},		
	};
	
	return json;
	
})(current, message, attributes);
