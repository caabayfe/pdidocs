var CommunicationManagementUXFChatUtilSNC = Class.create();
CommunicationManagementUXFChatUtilSNC.prototype = {
    initialize: function() {},

    TABLES: {
        SYS_CS_COLLAB_RECORD: 'sys_cs_collab_record',
        SYS_USER: 'sys_user'
    },

    FIELDS: {
        TABLE: 'table',
        DOCUMENT: 'document',
        SYS_ID: 'sys_id',
        COLLAB_CHAT: 'collab_chat',
        TITLE: 'title',
        SYS_UPDATED_ON: 'sys_updated_on',
        SYS_CREATED_ON: 'sys_created_on',
        SYS_CREATED_BY: 'sys_created_by',
        USER: 'user',
        USER_NAME: 'user_name',
        LAST_IMPORTED_ON: "last_imported_on",
        EMAIL: "email",
        STATE: "state",
        ACTIVE: "active",
        CHAT_COMPLETED: "chat_completed",
        INITIATED_BY: "initiated_by",
        SOURCE: 'source',
        SOURCE_TABLE: 'source_table'
    },

    CHOICES: {
        OPEN: 'open'
    },

    COLLAB_MEMBER_FIELDS: {
        USER_NAME: 'userName',
        DISPLAY_NAME: 'displayName',
        AVATAR: 'avatar',
        EMAIL: 'email',
        SYS_ID: 'userSysId'
    },

    CHAT_TYPE: {
        SIDEBAR_DISCUSSION: "sidebar_discussion",
        MICROSOFT_TEAMS_CHAT: "microsoft_teams_chat"
    },

    // DUPLICATE CODE: similar logic is written in SOWSidebarChatUtilsSNC to check sidebar support on SOW, please consider both the places while making any DEFECT fixes or STORY enhancements
    isSidebarSupported: function(table, sysId, isRecordCheckNeeded) {
        var isPolarisEnabled = gs.getProperty('glide.ui.polaris.experience', "false");
        var releaseVersion = gs.getProperty('itsm_family_release_version_check', 0);
        var canPrepopulateUsers = gs.getProperty('sn_oe_sfs.prepopulate_users_on_sidebar_modal_is_supported', "false");
        if (canPrepopulateUsers != 'true' || isPolarisEnabled != 'true' || !releaseVersion || releaseVersion < 24) return false;
        switch (releaseVersion) {
            case "24": // Vancouver release
            case "25": // Washington release
                return this._isSidebarChatEnabledForDomain();
            default: // Xanadu release and onwards
                return isRecordCheckNeeded == false ? this._isSidebarChatEnabledForDomain() : this._isSidebarChatEnabledForDomainAndRecord(table, sysId); 
        }
    },

    _isSidebarChatEnabledForDomain: function() {
        return sn_collab.CollabChatScriptObject.isCollabChatEnabledInDomain(); // Checks in user's session domain
    },

    _isSidebarChatEnabledForDomainAndRecord: function(table, sysId) {
        if (gs.nil(table) || gs.nil(sysId)) return false;
        return this._isSidebarChatEnabledForDomain() && sn_collab.CollabChatScriptObject.isCollabChatEnabledForRecord(table, sysId) && new sn_oe_sfs.SidebarAccessCheckUtils().canWrite(table, sysId);
    },

    // DUPLICATE CODE: similar logic is written in SOWSidebarChatUtilsSNC to fetch sidebar chat, please consider both the places while making any DEFECT fixes or STORY enhancements
    fetchSidebarChatForRecord: function(table, sysId, participantsLimit, chatSysId, chatsLimit, isActive, fetchParticipants) {
        if (gs.nil(table) || gs.nil(sysId)) return [];
        if (!this.isSidebarSupported(table, sysId)) return [];

        var sidebarChats = [];
        var collabRecordGr = new GlideRecord(this.TABLES.SYS_CS_COLLAB_RECORD);
        collabRecordGr.addQuery(this.FIELDS.TABLE, table);
        collabRecordGr.addQuery(this.FIELDS.DOCUMENT, sysId);
        if (!gs.nil(chatSysId)) collabRecordGr.addQuery(this.FIELDS.COLLAB_CHAT, chatSysId);
        if (!gs.nil(isActive) && isActive == true) collabRecordGr.addQuery('collab_chat.state', this.CHOICES.OPEN);
        collabRecordGr.orderByDesc(this.FIELDS.SYS_UPDATED_ON);
        if (!gs.nil(chatsLimit)) collabRecordGr.setLimit(chatsLimit);
        collabRecordGr.query();
        while (collabRecordGr.next()) {
            var chatGr = collabRecordGr.collab_chat ? collabRecordGr.collab_chat.getRefRecord() : null;
            if (gs.nil(chatGr) || !chatGr.isValidRecord())
                continue;
            var collabChatMembers = gs.nil(fetchParticipants) || fetchParticipants == true ? sn_collab.CollabChatScriptObject.getCollabChatMembers(chatGr.getValue(this.FIELDS.SYS_ID), participantsLimit) : [];
            var participants = [];
            var createdByUserSysId = '';
            var createdByUserName = chatGr.getValue(this.FIELDS.SYS_CREATED_BY);
            for (var i = 0; i < collabChatMembers.length; i++) {
                createdByUserSysId = createdByUserName === collabChatMembers[i]['userName'] ? collabChatMembers[i]['userSysId'] : createdByUserSysId;
                participants.push({
                    'userName': collabChatMembers[i][this.COLLAB_MEMBER_FIELDS.USER_NAME],
                    'displayName': collabChatMembers[i][this.COLLAB_MEMBER_FIELDS.DISPLAY_NAME],
                    'avatar': collabChatMembers[i][this.COLLAB_MEMBER_FIELDS.AVATAR],
                    'email': collabChatMembers[i][this.COLLAB_MEMBER_FIELDS.EMAIL],
                    'sysId': collabChatMembers[i][this.COLLAB_MEMBER_FIELDS.SYS_ID]
                });
            }
            var chatObj = {
                'chatSysId': chatGr.getValue(this.FIELDS.SYS_ID),
                'type': this.CHAT_TYPE.SIDEBAR_DISCUSSION,
                'title': chatGr.getValue(this.FIELDS.TITLE),
                'updatedTimeAgo': this.getDuration(chatGr.getValue(this.FIELDS.SYS_UPDATED_ON)),
                'updatedOn': chatGr.getValue(this.FIELDS.SYS_UPDATED_ON),
                'startedOn': chatGr.getValue(this.FIELDS.SYS_CREATED_ON),
                'state': chatGr.getValue(this.FIELDS.STATE),
                'chatCompletedOn': chatGr.getValue(this.FIELDS.CHAT_COMPLETED)

            };

            if (gs.nil(fetchParticipants) || fetchParticipants == true) {
                chatObj['participants'] = participants;
                chatObj['totalParticipants'] = collabChatMembers.length;
                chatObj['createdBy'] = createdByUserSysId;
            } else {
                var createdByUser = this.getUserByUserName(createdByUserName);
                if (createdByUser && createdByUser.isValidRecord()) {
                    chatObj['createdBy'] = createdByUser.getUniqueValue();
                    chatObj['createdByName'] = createdByUser.getDisplayValue();
                }
            }
            sidebarChats.push(chatObj);
        }
        return sidebarChats;
    },

    getDuration: function(gdt) {
        if (!gdt)
            return '';

        var gd = new GlideDuration();
        gd.setValue(gdt);

        var currentGd = new GlideDuration();
        currentGd.setValue(new GlideDateTime());

        var difference = currentGd.subtract(gd);
        difference = difference.getDisplayValue();
        difference = difference.split(" ");
        return difference[0] + " " + difference[1];
    },

    getUserByUserName: function(userName) {
        var userGr = new GlideRecord(this.TABLES.SYS_USER);
        userGr.addQuery(this.FIELDS.USER_NAME, userName);
        userGr.setLimit(1);
        userGr.query();
        if (userGr.next()) return userGr;
        else return null;
    },

    isTeamsPluginActive: function() {
        return GlidePluginManager.isActive('com.snc.ms_teams.it');
    },

    getAvatarUrl: function(userSysId) {
        var avatarPath = GlideAvatarFinder.getAvatarPath(userSysId);
        if (!gs.nil(avatarPath))
            return '/' + avatarPath;
        return '';
    },

    // DUPLICATE CODE: similar logic is written in SOWContextualPanelTeamsConfigSNC to fetch teams chat, please consider both the places while making any DEFECT fixes or STORY enhancements
    fetchTeamsChatForRecord: function(recordSysId, chatSysId, chatsLimit, fetchActive, fetchParticipants) {
        if (!this.isTeamsPluginActive())
            return [];

        var teamsChats = [];
        var teamsChatsGr = new GlideRecord('sn_tcm_collab_hook_ms_teams_chat');
        teamsChatsGr.addQuery('source', recordSysId);
        if (!gs.nil(chatSysId)) teamsChatsGr.addQuery('sys_id', chatSysId);
        if (!gs.nil(fetchActive) && fetchActive == true) teamsChatsGr.addActiveQuery();
        if (!gs.nil(chatsLimit)) teamsChatsGr.setLimit(chatsLimit);
        teamsChatsGr.orderByDesc('sys_updated_on');
        teamsChatsGr.query();

        var clientType = gs.getUser().getPreference('sn_tcm_collab_hook_teams_preferred_client') || 'web_client';

        while (teamsChatsGr.next()) {
            var azureUsers = [];
            var dates = [];
            var obj = {};
            var users = teamsChatsGr.users.split(",");
            var totalParticipants = Math.floor(users.length) + '';
            obj.title = teamsChatsGr.topic + '';
            obj.type = this.CHAT_TYPE.MICROSOFT_TEAMS_CHAT;
            obj.updatedOn = teamsChatsGr.getValue(this.FIELDS.SYS_UPDATED_ON);
            obj.startedOn = teamsChatsGr.getValue(this.FIELDS.SYS_CREATED_ON);
            obj.updatedTimeAgo = this.getDuration(teamsChatsGr.getValue(this.FIELDS.SYS_UPDATED_ON)),
            obj.lastImportedOn = teamsChatsGr.getValue(this.FIELDS.LAST_IMPORTED_ON);
            obj.createdBy = teamsChatsGr.getValue(this.FIELDS.INITIATED_BY);
            obj.active = teamsChatsGr.getValue(this.FIELDS.ACTIVE);
            obj.createdByName = teamsChatsGr.getDisplayValue(this.FIELDS.INITIATED_BY);
            obj.totalParticipants = totalParticipants;
            obj.chatSysId = teamsChatsGr.getUniqueValue();
            obj.chatSource = {
                sysId: teamsChatsGr.getValue(this.FIELDS.SOURCE),
                table: teamsChatsGr.getValue(this.FIELDS.SOURCE_TABLE)
            };
            obj.isCurrentUserInChat = users.indexOf(gs.getUserID()) != -1;
            if (obj.isCurrentUserInChat) {
                obj.sectionDropdownOptions = [{
                    id: "import-teams-chat",
                    label: gs.getMessage('View chat'),
                    icon: "microsoft-teams-fill"
                }];
            }

            if (gs.nil(fetchParticipants) || fetchParticipants == true) {
                users.forEach(function(user) {
                    var users = {};
                    var userGr = new GlideRecord('sys_user');
                    userGr.get(user + '');

                    users.avatar = "/" + userGr.avatar + ".iix?t=small";
                    users.name = userGr.name + '';

                    azureUsers.push({
                        'userName': userGr.getValue(this.FIELDS.USER_NAME),
                        'displayName': userGr.getDisplayValue(),
                        'avatar': this.getAvatarUrl(userGr.getUniqueValue()),
                        'email': userGr.getValue(this.FIELDS.EMAIL),
                        'sysId': userGr.getValue(this.FIELDS.SYS_ID)
                    });
                }, this);
                obj.users = azureUsers;
            }

            if (clientType == 'desktop_application')
                obj.chatUrl = new sn_tcm_collab_hook.MSTeamsChatConfigProvider().getTeamsAppUrl() + "l/conversations/" + teamsChatsGr.chat_id + "?ctx=chat";
            else
                obj.chatUrl = new sn_tcm_collab_hook.MSTeamsChatConfigProvider().getTeamsUrl() + "/_#/conversations/" + teamsChatsGr.chat_id + "?ctx=chat";

            teamsChats.push(obj);
        }
        return teamsChats;
    },

    type: 'CommunicationManagementUXFChatUtilSNC'
};
