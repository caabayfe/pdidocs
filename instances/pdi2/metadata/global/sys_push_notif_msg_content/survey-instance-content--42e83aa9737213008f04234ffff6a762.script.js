(function buildJSON(/*GlideRecord*/ current, /*String*/ message, /*Object*/ attributes) {
	
	var json = {};
	
	json = {
		"aps" : {
			"sound" : "default"
		},
		"web_path" : "sp?id=take_survey&instance_id=" + current.sys_id
	};
	
	return json;
	
})(current, message, attributes);
