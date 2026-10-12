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
                "DocumentId": "34ad6c5673332300c0b958c234f6a70d",
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
