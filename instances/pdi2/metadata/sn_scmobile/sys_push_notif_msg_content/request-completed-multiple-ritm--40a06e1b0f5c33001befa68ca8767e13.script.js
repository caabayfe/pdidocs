(function buildJSON(/*GlideRecord*/ current, /*String*/ message, /*Object*/ attributes) {

    var layoutFieldGenerator = new global.NotificationLayoutFieldGenerator();
    var identifier = layoutFieldGenerator.layoutField(current.sys_class_name, current.sys_id, "number");
    var description = layoutFieldGenerator.layoutField(current.sys_class_name, current.sys_id, "short_description");
    var state = layoutFieldGenerator.layoutField(current.sys_class_name, current.sys_id, "request_state");
    var json = {};
    
    json = {
        "aps" : {
            "sound" : "default"
        },
        "Redirection" : {
            "Title" : gs.getMessage("Request Completed"),
            "To" : "Embedded",
            "Destination": {
                "DocumentId": "276dd3edb79033001befcd58de11a9c7",
                "ItemId": current.sys_id
            },
			"Context" : {
				"ContextType": "RECORD",
				"TableName": "sc_request",
				"RecordId": current.sys_id
			}
        },
        "Layout" : {
            "Status": state,
            "Identifier" : identifier,
            "Description" : description
        }
    };
    
    return json;
    
})(current, message, attributes);
