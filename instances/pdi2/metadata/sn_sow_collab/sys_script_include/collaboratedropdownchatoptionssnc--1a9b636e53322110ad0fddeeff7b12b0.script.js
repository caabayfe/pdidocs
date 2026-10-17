var CollaborateDropdownChatOptionsSNC = Class.create();
CollaborateDropdownChatOptionsSNC.prototype = Object.extendsObject(sn_uib_collab.CollaborateDropdownChatOptions, {
    initialize: function() {},

    getDropDownChoices: function(table, sysId) {
        var sowCollabUtils = new sn_sow_collab.SowCollabUtils();
        if (!sowCollabUtils.canViewChats(table, sysId))
            return {};
        var sectionPayload = {
            sectionId: 'chat',
            sectionLabel: gs.getMessage('Chat')
        };
        var sidebarSupportOnSOW = new SOWSidebarChatUtils().isSidebarSupportedOnSOW(table, sysId);
        var supportedChatProviders = [];
        if (sidebarSupportOnSOW)
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
                var teamsDropDownParams = sowCollabUtils.getDropDownPanelContents();
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
});
