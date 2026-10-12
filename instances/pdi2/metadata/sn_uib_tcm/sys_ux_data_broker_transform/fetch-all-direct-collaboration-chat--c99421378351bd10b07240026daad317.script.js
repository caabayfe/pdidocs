function transform(input) {
    var table = input.table;
    var sysId = input.sysId;
    if (!table || !sysId)
        return;

    var chatUtil = new CommunicationManagementUXFChatUtil();

    var sidebarChat = chatUtil.fetchSidebarChatForRecord(table, sysId, 0, null, null, null, true) || [];
    var teamsChat = chatUtil.fetchTeamsChatForRecord(sysId, null, null, null, true) || [];
    var totalChat = teamsChat.concat(sidebarChat);
    return {
        "chat": totalChat,
        "isSidebarSupported": chatUtil.isSidebarSupported(table, sysId),
        "isTeamsPluginActive": chatUtil.isTeamsPluginActive()
    };
}
