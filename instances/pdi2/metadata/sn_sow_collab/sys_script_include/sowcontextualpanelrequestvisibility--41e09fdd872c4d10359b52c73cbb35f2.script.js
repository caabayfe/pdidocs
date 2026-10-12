var SOWContextualPanelRequestVisibility = Class.create();
SOWContextualPanelRequestVisibility.prototype = {

    canLaunchChat: function(recordSysId, table) {
        if (table == 'sc_request' || table == 'sc_req_item') {
            if (new SOWSidebarChatUtils().isSidebarSupportedOnSOW(table, recordSysId))
                return true;

            if (GlidePluginManager.isActive('com.snc.ms_teams.it')) {
                var recordGr = new GlideRecord(table);
                if (recordGr.get(recordSysId))
                    return new sn_tcm_collab_hook.MSTeamsChatUtil().canLaunchChat(recordGr, 'itil,sn_request_write');
            }
        }
        return false;
    },

    type: 'SOWContextualPanelRequestVisibility'
};
