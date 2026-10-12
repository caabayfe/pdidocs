var CollaborateDropdownChatOptionsSNC = Class.create();
CollaborateDropdownChatOptionsSNC.prototype = {
    initialize: function() {},

    getDropDownChoices: function(table, sysId) {
        var collabUtils = new sn_uib_collab.CollabUtils();
        if (!collabUtils.canViewChats(table, sysId))
            return {};
        var sectionPayload = {
            sectionId: 'chat',
            sectionLabel: gs.getMessage('Chat')
        };
        var sidebarSupport = new sn_uib_collab.SidebarChatUtils().isSidebarSupported(table, sysId);
        var supportedChatProviders = [];
        if (sidebarSupport)
            supportedChatProviders.push({
                id: 'start-sidebar-discussion',
                label: gs.getMessage('Start Sidebar discussion'),
                icon: 'ongoing-outline',
                sectionId: 'chat',
                sectionLabel: gs.getMessage('Chat')
            });
        var recordGr = new GlideRecord(table);
        if (recordGr.get(sysId) && GlidePluginManager.isActive('com.snc.ms_teams.it')) {
            if (new sn_tcm_collab_hook.MSTeamsChatUtil().canLaunchChat(recordGr)) {
                var teamsDropDownParams = collabUtils.getDropDownPanelContents();
                for (var i = 0; i < teamsDropDownParams.length; i++) {
                    supportedChatProviders = supportedChatProviders.concat(teamsDropDownParams[i].children);
                }
            }
        }
        sectionPayload.children = supportedChatProviders;
        if (supportedChatProviders.length == 0)
            return {};
        return sectionPayload;
    },

    type: 'CollaborateDropdownChatOptionsSNC'
};
