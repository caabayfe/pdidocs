var SOWContextualPanelInteractionVisibility = Class.create();
SOWContextualPanelInteractionVisibility.prototype = {

    canLaunchChat: function(recordSysId, table) {
        if (table == 'interaction' && new sn_sow_collab.SOWSidebarChatUtils().isSidebarSupportedOnSOW(table, recordSysId))
            return true;

        if (GlidePluginManager.isActive('com.snc.ms_teams.it') && table == 'interaction') {
            var type = '';
            var intGr = new GlideRecord('interaction');
            if (intGr.get(recordSysId)) {
                type = intGr.getValue('type');
                return type != "walkup" && new sn_tcm_collab_hook.MSTeamsChatUtil().canLaunchChat(intGr, 'interaction_agent');
            }
        }
    },

    type: 'SOWContextualPanelInteractionVisibility'
};
