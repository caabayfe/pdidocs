function transform(input) {
    var type = input.type;
    var chatSysId = input.chatSysId;
    var table = input.table;
    var sysId = input.sysId;
    var participantSysId = input.participantSysId;
    if (!table || !sysId || !type || (!chatSysId && !participantSysId))
        return;

    var isSidebarPluginActive = GlidePluginManager.isActive('sn_oe_sfs');
    if (isSidebarPluginActive && type == "sidebar_discussion" && gs.nil(chatSysId)) {
        var member = new GlideRecord('sys_cs_collab_member');
        if (member.get(participantSysId))
            chatSysId = member.getValue('collab_chat');
    }

    if (gs.nil(chatSysId))
        return [];

    if (isSidebarPluginActive && type == "sidebar_discussion")
        return new SOWSidebarChatUtils().getChatsForRecord(table, sysId, input.participantsLimit, chatSysId);
    if (type == "microsoft_teams_chat")
        return new SowCollabUtils().getPanelCardProps(sysId, chatSysId);
}
