var SOWTeamsRecordTabsUtilSNC = Class.create();
SOWTeamsRecordTabsUtilSNC.prototype = {
    initialize: function() {},

    TABS: {
        TEAM_MEMBERS: 'Team members',
    },

    TABLE: {
        SYS_USER_GRMEMBER: 'sys_user_grmember'
    },

    shouldRenderTab: function(tab, table, sysId) {
        if (!table || table !== "sys_user_group" || !sysId || sysId == "-1")
            return false;

        var gr;

        try {
            gr = GlideRecordCache.getOrQuery(table, sysId);
            if (!gr || !gr.isValidRecord() || !gr.canRead())
                return false;
        } catch (e) {
            gr = new GlideRecord(table);
            if (!gr.get(sysId) || !gr.canRead())
                return false;
        }

        switch (tab) {
            case this.TABS.TEAM_MEMBERS:
                var groupMemberGr = new GlideRecord(this.TABLE.SYS_USER_GRMEMBER);
                return gr.canRead() && groupMemberGr.canRead();
            default:
                return false;
        }
    },

    type: 'SOWTeamsRecordTabsUtilSNC'
};
