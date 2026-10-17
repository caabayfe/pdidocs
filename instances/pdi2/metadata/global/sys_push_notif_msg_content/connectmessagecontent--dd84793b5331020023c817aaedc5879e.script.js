(function buildJSON(/*GlideRecord*/ current, /*String*/ message, /*Object*/ attributes) {
	
	var json = {};
	
	json = {
		"aps" : {
			"sound" : "default",
			"category" : "reply_background",
			"alert" : message
		},
		"type" : "message",
		"x" : {
			"profile_id" : current.getValue('profile'),
			"group" : current.getValue('group')

		}
	};
	
	return json;
	
})(current, message, attributes);
