var ContextualPanelCommTaskVisibilitySNC = Class.create();
ContextualPanelCommTaskVisibilitySNC.prototype = {

    TABLES: {
        COMM_TASK: 'comm_task'
    },

    canLaunchChat: function(recordSysId, table) {
        if (!table || !recordSysId) {
            return false;
        }

        if (new sn_uib_collab.SidebarChatUtils().isSidebarSupported(table, recordSysId))
            return true;

        if (GlidePluginManager.isActive('com.snc.ms_teams.it')) {
            var recordGr = new GlideRecord(table);
            if (recordGr.get(recordSysId))
                return new sn_tcm_collab_hook.MSTeamsChatUtil().canLaunchChat(recordGr, 'sn_comm_management.comm_plan_viewer');
        }
        return false;
    },

    _isCommTaskExtension: function(table) {
        var tableHierarchy = new GlideTableHierarchy(table).getTables() || [];
        return tableHierarchy.includes(this.TABLES.COMM_TASK);
    },

    handles: function(table) {
        if (gs.nil(table))
            return false;
        return this._isCommTaskExtension(table);
    },

    type: 'ContextualPanelCommTaskVisibilitySNC'
};
