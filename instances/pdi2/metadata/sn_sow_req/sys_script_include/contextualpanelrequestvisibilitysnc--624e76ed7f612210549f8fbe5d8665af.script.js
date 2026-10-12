var ContextualPanelRequestVisibilitySNC = Class.create();
ContextualPanelRequestVisibilitySNC.prototype = {

    HANDLED_TABLES: ["sc_request", "sc_req_item"],

    canLaunchChat: function(recordSysId, table) {
        if (new sn_uib_collab.SidebarChatUtils().isSidebarSupported(table, recordSysId))
            return true;

        if (GlidePluginManager.isActive('com.snc.ms_teams.it')) {
            var recordGr = new GlideRecord(table);
            if (recordGr.get(recordSysId))
                return new sn_tcm_collab_hook.MSTeamsChatUtil().canLaunchChat(recordGr, 'itil,sn_request_write');
        }
        return false;
    },

    handles: function(table) {
        return (this.HANDLED_TABLES.indexOf(table) != -1);
    },

    type: 'ContextualPanelRequestVisibilitySNC'
};
