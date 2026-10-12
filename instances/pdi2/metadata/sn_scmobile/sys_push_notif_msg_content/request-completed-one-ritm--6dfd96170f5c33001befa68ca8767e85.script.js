(function buildJSON(/*GlideRecord*/ current, /*String*/ message, /*Object*/ attributes) {

    var layoutFieldGenerator = new global.NotificationLayoutFieldGenerator();
    var identifier = layoutFieldGenerator.layoutField(current.sys_class_name, current.sys_id, "number");
    var description = layoutFieldGenerator.layoutField(current.sys_class_name, current.sys_id, "short_description");
    var state = layoutFieldGenerator.layoutField(current.sys_class_name, current.sys_id, "state");
    var json = {};
    
    json = {
        "aps" : {
            "sound" : "default"
        },
        "Redirection" : {
            "Title" : gs.getMessage("Request Completed"),
            "To" : "Embedded",
            "Destination": {
                "DocumentId": "7516f9d787232300e0ef0cf888cb0b4d",
                "ItemId": current.sys_id
            },
			"Context" : {
				"ContextType": "RECORD",
				"TableName": "sc_req_item",
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
