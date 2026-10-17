var ContextualPanelIncidentChangeVisibilitySNC = Class.create();
ContextualPanelIncidentChangeVisibilitySNC.prototype = {

    HANDLED_TABLES: ["incident", "change_request"],

    canLaunchChat: function(recordSysId, table) {
        if (new sn_uib_collab.SidebarChatUtils().isSidebarSupported(table, recordSysId))
            return true;

        if (GlidePluginManager.isActive('com.snc.ms_teams.it')) {
            var rolesTable = {
                'incident': 'itil,sn_incident_write',
                'change_request': 'itil,sn_change_write'
            };
            var recordGr = new GlideRecord(table);
            if (recordGr.get(recordSysId))
                return new sn_tcm_collab_hook.MSTeamsChatUtil().canLaunchChat(recordGr, rolesTable[table]);
        }
        return false;
    },

    handles: function(table) {
        return (this.HANDLED_TABLES.indexOf(table) != -1);
    },

    type: 'ContextualPanelIncidentChangeVisibilitySNC'
};
