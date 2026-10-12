var ContextualPanelInteractionVisibilitySNC = Class.create();
ContextualPanelInteractionVisibilitySNC.prototype = {

    HANDLED_TABLES: ["interaction"],

    canLaunchChat: function(recordSysId, table) {
        if (new sn_uib_collab.SidebarChatUtils().isSidebarSupported(table, recordSysId))
            return true;

        if (GlidePluginManager.isActive('com.snc.ms_teams.it') && table == 'interaction') {
            var type = '';
            var intGr = new GlideRecord('interaction');
            if (intGr.get(recordSysId)) {
                type = intGr.getValue('type');
                return type != "walkup" && new sn_tcm_collab_hook.MSTeamsChatUtil().canLaunchChat(intGr, 'interaction_agent');
            }
        }

        return false;
    },

    handles: function(table) {
        return (this.HANDLED_TABLES.indexOf(table) != -1);
    },

    type: 'ContextualPanelInteractionVisibilitySNC'
};
