var SOWCollabInfo = Class.create();
SOWCollabInfo.prototype = {

    TABLES: {
        SN_TCM_COLLAB_HOOK_MS_TEAMS_CHAT: "sn_tcm_collab_hook_ms_teams_chat",
        SYS_CS_COLLAB_MEMBER: "sys_cs_collab_member",
        SYS_USER: "sys_user"
    },

    FIELDS: {
        SOURCE: "source",
        SOURCE_TABLE: "source_table",
        USERS: "users",
        DOCUMENT: "document",
        MEMBER: "member"
    },

    initialize: function() {},

    isTeamsPluginActive: function() {
        return (GlidePluginManager.isActive('com.snc.ms_teams') && GlidePluginManager.isActive('com.snc.tcm_collab_hook'));
    },

    getCollaboratorsInfo: function(table, sysId) {
        if (gs.nil(table) || gs.nil(sysId)) return [];
        var collaborators = [];
        var arrayUtil = new global.ArrayUtil();
        if (this.isTeamsPluginActive()) {
            var teamsChatGr = new GlideRecord(this.TABLES.SN_TCM_COLLAB_HOOK_MS_TEAMS_CHAT);
            teamsChatGr.addQuery(this.FIELDS.SOURCE_TABLE, table);
            teamsChatGr.addQuery(this.FIELDS.SOURCE, sysId);
            teamsChatGr.addNotNullQuery(this.FIELDS.USERS);
            teamsChatGr.query();
            while (teamsChatGr.next()) {
                var users = teamsChatGr.users.split(",");
                users.forEach(function(user) {
                    if (!arrayUtil.contains(collaborators, user)) {
                        collaborators.push(user);
                    }
                });

            }
        }
        if (new sn_sow_collab.SOWSidebarChatUtils().isSidebarSupportedOnSOW(table, sysId)) {
            var collabMemberGr = new GlideRecord(this.TABLES.SYS_CS_COLLAB_MEMBER);
            collabMemberGr.addQuery(this.FIELDS.DOCUMENT, sysId);
            collabMemberGr.addQuery("member.user_table", this.TABLES.SYS_USER);
            collabMemberGr.addNotNullQuery(this.FIELDS.MEMBER);
            collabMemberGr.addActiveQuery();
            collabMemberGr.query();
            while (collabMemberGr.next()) {
                var userSysId = collabMemberGr.member.user_document + "";
                if (userSysId && !arrayUtil.contains(collaborators, userSysId)) collaborators.push(userSysId);
            }
        }
        return collaborators;
    },

    getExternalCollaboratorsInfo: function(table, sysId) {
        if (gs.nil(table) || gs.nil(sysId) || !new sn_sow_collab.SOWSidebarChatUtils().isSidebarSupportedOnSOW(table, sysId)) return [];
        var externalCollaborators = [];
        var externalCollaboratorsSysIds = [];
        var arrayUtil = new global.ArrayUtil();
        var externalCollabMemberGr = new GlideRecord(this.TABLES.SYS_CS_COLLAB_MEMBER);
        externalCollabMemberGr.addQuery(this.FIELDS.DOCUMENT, sysId);
        externalCollabMemberGr.addQuery("member.user_table", "!=", this.TABLES.SYS_USER);
        externalCollabMemberGr.addNotNullQuery(this.FIELDS.MEMBER);
        externalCollabMemberGr.addActiveQuery();
        externalCollabMemberGr.query();
        while (externalCollabMemberGr.next()) {
            var externalUserSysId = externalCollabMemberGr.member.user_document + "";
            if (externalUserSysId && arrayUtil.contains(externalCollaboratorsSysIds, externalUserSysId)) continue;
            externalCollaboratorsSysIds.push(externalUserSysId);
            externalCollaborators.push({
                name: externalCollabMemberGr.getDisplayValue(this.FIELDS.MEMBER),
                table: externalCollabMemberGr.member.user_table + "",
                sysId: externalUserSysId
            });
        }
        return externalCollaborators;
    },

    type: 'SOWCollabInfo'
};
