(function buildJSON(/*GlideRecord*/ current, /*String*/ message, /*Object*/ attributes) {

    var layoutFieldGenerator = new global.NotificationLayoutFieldGenerator();
    var identifier = layoutFieldGenerator.layoutField(current.sys_class_name, current.sys_id, "number");
    var description = layoutFieldGenerator.layoutField(current.sys_class_name, current.sys_id, "short_description");
    var state = layoutFieldGenerator.layoutField(current.sys_class_name, current.sys_id, "request_state");
    var json = {};
	var gr = new GlideRecord("sc_req_item");
	gr.addQuery("request", current.sys_id);
	gr.query();
  var count = gr.getRowCount();
	var documentId = "276dd3edb79033001befcd58de11a9c7";
	var sys_id = current.sys_id;
	var tableName = "sc_request";
	if (count == 1) {
		documentId = "7516f9d787232300e0ef0cf888cb0b4d";
		gr.next();
		sys_id = gr.getValue("sys_id");
		tableName = "sc_req_item";
	}
    json = {
        "aps" : {
            "sound" : "default"
        },
        "Redirection" : {
            "Title" : gs.getMessage("Request not processed"),
            "To" : "Embedded",
            "Destination": {
                "DocumentId": documentId,
                "ItemId": sys_id
            },
			"Context" : {
				"ContextType": "RECORD",
				"TableName": tableName,
				"RecordId": sys_id
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
