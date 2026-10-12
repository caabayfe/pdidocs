var SOWContextualPanelIncidentChangeVisibility = Class.create();
SOWContextualPanelIncidentChangeVisibility.prototype = {

    canLaunchChat: function(recordSysId, table) {
        if (table == 'incident' || table == 'change_request') {
            if (new SOWSidebarChatUtils().isSidebarSupportedOnSOW(table, recordSysId))
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
        }
        return false;
    },

    type: 'SOWContextualPanelIncidentChangeVisibility'
};
