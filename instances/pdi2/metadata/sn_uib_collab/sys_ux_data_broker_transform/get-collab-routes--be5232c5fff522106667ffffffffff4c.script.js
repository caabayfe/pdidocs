function transform(input) {
    var output = [];
    var collabUtils = new sn_uib_collab.CollabUtils();
    var table = input.table;
    var sysId = input.sysId;

    if (gs.nil(table) || gs.nil(sysId)) {
        return output;
    }

    if (collabUtils.canViewChats(table, sysId)) {
        output.push({
            "route": "collab-chat-tab",
            "fields": {
                "table": table,
                "sysId": sysId
            },
            "label": gs.getMessage("Chat")
        });
    }

    if (collabUtils.canViewCalls(table, sysId)) {
        output.push({
            "route": "notify-call",
            "fields": {
                "table": table,
                "sysId": sysId
            },
            "label": gs.getMessage("Calls")
        });
    }
    return output;
}
