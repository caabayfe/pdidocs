(function buildJSON(/*GlideRecord*/ current, /*String*/ message, /*Object*/ attributes) {
	
	var json = {};
	
	json = {
		"aps" : {
			"sound" : "default",
			"category" : "approve_reject_foreground"
		},
		"record" : {
			"table" : current.getTableName(),
			"sys_id" : current.sys_id
		},
		"scripts" : {"approve_foreground" : "333ecc6253020200601fa3fc9ec58727",
					 "reject_foreground" : "632ecc6253020200601fa3fc9ec58708" }
	};
	
	return json;
	
})(current, message, attributes);
