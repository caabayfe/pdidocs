var DefaultContextualPanelVisibilitySNC = Class.create();
DefaultContextualPanelVisibilitySNC.prototype = {
    initialize: function() {},

    canLaunchChat: function(recordSysId, table) {
        if ((recordSysId === '-1') || gs.nil(table) || gs.nil(recordSysId))
            return false;

        if (new sn_uib_collab.SidebarChatUtils().isSidebarSupported(table, recordSysId))
            return true;

        if (GlidePluginManager.isActive('com.snc.ms_teams.it')) {
            var recordGr = new GlideRecord(table);
            if (recordGr.get(recordSysId))
                return new sn_tcm_collab_hook.MSTeamsChatUtil().canLaunchChat(recordGr);
        }
        return false;
    },

    handles: function(table) {
        /*
        	DefaultContextualPanelVisibilitySNC is the default implementation of sn_uib_collab.ContextualPanelVisibility Glide Extension Point
        	Incase there is no extension point implementation for 'table', this default implementation needs to kick-in, hence returning true.
        */
        return true;
    },

    type: 'DefaultContextualPanelVisibilitySNC'
};
