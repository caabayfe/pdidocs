var SOWContextualPanelCommTaskVisibilitySNC = Class.create();
SOWContextualPanelCommTaskVisibilitySNC.prototype = {

	TABLES: {
		COMM_TASK: 'comm_task'
	},

    canLaunchChat: function(recordSysId, table) {
        var tableHierarchy = new GlideTableHierarchy(table).getTables() || [];
        if (tableHierarchy.includes(this.TABLES.COMM_TASK)) {
            if (new sn_sow_collab.SOWSidebarChatUtils().isSidebarSupportedOnSOW(table, recordSysId))
                return true;

            if (GlidePluginManager.isActive('com.snc.ms_teams.it')) {
                var recordGr = new GlideRecord(table);
                if (recordGr.get(recordSysId))
                    return new sn_tcm_collab_hook.MSTeamsChatUtil().canLaunchChat(recordGr, 'sn_comm_management.comm_plan_viewer');
            }
        }
        return false;
    },

    type: 'SOWContextualPanelCommTaskVisibilitySNC'
};
