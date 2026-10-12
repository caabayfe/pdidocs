function transform(input) {
    var table = input.table;
    var sysId = input.sysId;
    if (!table || !sysId)
        return;

    var sidebarChatUtils = null,
        isSidebarSupportedOnSOW = false;
    if (GlidePluginManager.isActive('sn_oe_sfs')) {
        sidebarChatUtils = new SOWSidebarChatUtils();
        isSidebarSupportedOnSOW = sidebarChatUtils.isSidebarSupportedOnSOW(table, sysId);
    }

    var maxChats = gs.getProperty('sn_sow_collab.max_chats_in_collaboration_tab', 500);

    var totalSidebarChats = isSidebarSupportedOnSOW ? parseInt(sidebarChatUtils.getNumberOfChats(table, sysId, input.commTaskIds)) : 0;
    var sowCollabUtils = new SowCollabUtils();
    var totalTeamsChats = parseInt(sowCollabUtils.getNumberOfChats(table, sysId, input.commTaskIds));
    var limitsMap = distributeEvenly({
        sidebarLimit: totalSidebarChats,
        teamsLimit: totalTeamsChats,
    }, maxChats);
    var sidebarLimit = limitsMap.sidebarLimit;
    var teamsLimit = limitsMap.teamsLimit;
    var sidebarChats = isSidebarSupportedOnSOW ? sidebarChatUtils.getChatsForRecord(table, sysId, input.participantsLimit, null, sidebarLimit, input.commTaskIds) : [];
    var teamsChats = sowCollabUtils.getPanelCardProps(sysId, null, input.commTaskIds, teamsLimit);
    var chats = sidebarChats.concat(teamsChats);

    // Sort chats based on last updated on
    chats.sort(function(chat1, chat2) {
        var dt1 = new GlideDateTime(chat1.updatedOn);
        var dt2 = new GlideDateTime(chat2.updatedOn);
        return dt2.compareTo(dt1);
    });

    return {
        "isTeamsPluginActive": sowCollabUtils.isTeamsITPluginActive(),
        "isSidebarSupportedOnSOW": isSidebarSupportedOnSOW,
        "chats": chats,
        "numberOfSidebarChats": sidebarChats.length,
        "numberOfTeamsChats": teamsChats.length
    };

    function distributeEvenly(map, maxLimit) {
        var keys = Object.keys(map);
        var total = 0;
        keys.forEach(function(key) {
            total = total + map[key];
        });

        if (total < maxLimit)
            return map;
        else {
            var extraChatsSize = total - maxLimit;
            var chatLimit = parseInt(maxLimit / keys.length);
            keys.forEach(function(key) {
                if (extraChatsSize > 0) {
                    if (map[key] > chatLimit) {
                        var extraChatsInItem = map[key] - chatLimit;
                        if (extraChatsInItem > extraChatsSize) {
                            map[key] = map[key] - extraChatsSize;
                            extraChatsSize = 0;
                        } else {
                            extraChatsSize = extraChatsSize - (map[key] - chatLimit);
                            map[key] = chatLimit;
                        }
                    }
                }
            });
        }
        return map;
    }
}
