(function buildJSON(/*GlideRecord*/ current, /*String*/ message, /*Object*/ attributes) {

    var layoutFieldGenerator = new global.NotificationLayoutFieldGenerator();
    var identifier = layoutFieldGenerator.layoutField(current.getTableName(), current.sys_id, "sysapproval");
    var description = layoutFieldGenerator.layoutField(current.getTableName(), current.sys_id, "sysapproval.short_description");
    var status = layoutFieldGenerator.layoutField(current.getTableName(), current.sys_id, "state");
    var json = {};
    
    json = {
        "aps" : {
            "sound" : "default"
        },
        "Redirection" : {
            "Title" : gs.getMessage("Approval Requested"),
            "To" : "Embedded",
            "Destination": {
                "DocumentId": "c6f277b687fb2300e0ef0cf888cb0bd6",
                "ItemId": current.sys_id
            },
			"Context" : {
				"ContextType": "RECORD",
				"TableName": "sysapproval_approver",
				"RecordId": current.sys_id
			}
        },
        "Layout" : {
            "Status": status,
            "Identifier" : identifier,
            "Description" : description
        }
    };
    
    return json;
    
})(current, message, attributes);
