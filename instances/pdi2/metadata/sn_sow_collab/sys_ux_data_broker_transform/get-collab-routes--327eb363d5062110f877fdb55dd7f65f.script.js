function transform(input) {
    var output = [];
    var sowCollabUtils = new sn_sow_collab.SowCollabUtils();
    var table = input.table;
    var sysId = input.sysId;

    if (gs.nil(table) || gs.nil(sysId)) {
        return output;
    }

    if (sowCollabUtils.canViewChats(table, sysId)) {
        output.push({
            "route": "collab-chat-tab",
            "fields": {
                "table": table,
                "sysId": sysId
            },
            "label": gs.getMessage("Chat")
        });
    }

    if (sowCollabUtils.canViewCalls(table, sysId)) {
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
