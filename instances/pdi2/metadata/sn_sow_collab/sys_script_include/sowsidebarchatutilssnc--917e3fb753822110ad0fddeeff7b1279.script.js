var SOWSidebarChatUtilsSNC = Class.create();
SOWSidebarChatUtilsSNC.prototype = Object.extendsObject(sn_uib_collab.SidebarChatUtils, {
    initialize: function() {},
    TABLES: {
        SYS_CS_COLLAB_RECORD: 'sys_cs_collab_record',
        SYS_CS_COLLAB_MEMBER: 'sys_cs_collab_member',
        INCIDENT: 'incident',
        SYS_USER_HAS_ROLE: 'sys_user_has_role'
    },

    FIELDS: {
        TABLE: 'table',
        DOCUMENT: 'document',
        SYS_ID: 'sys_id',
        COLLAB_CHAT: 'collab_chat',
        TITLE: 'title',
        SYS_UPDATED_ON: 'sys_updated_on',
        SYS_CREATED_BY: 'sys_created_by',
        CALLER_ID: 'caller_id',
        USER: 'user',
        ROLE: 'role',
        MEMBER_DOCUMENT: "member.user_document"
    },

    COLLAB_MEMBER_FIELDS: {
        USER_NAME: 'userName',
        DISPLAY_NAME: 'displayName',
        AVATAR: 'avatar',
        EMAIL: 'email',
        SYS_ID: 'userSysId'
    },

    SIDEBAR_CHATS: {
        NUMBER_OF_AVATARS: 5
    },

    hasPermission: function(userSysId, recordSysId, table) {
        if (!userSysId || !recordSysId || !table)
            return false;
        if (table == 'interaction' && this.userHasNoRoles(userSysId))
            return false;
        if (table == 'incident' || table == 'sc_request' || table == 'sc_req_item' || table == 'change_request') {
            var isRequesterIncluded = gs.getProperty('sn_sow_collab.enable_requester_in_sidebar_discussion', 'true');
            if (isRequesterIncluded == 'false' && this.userHasNoRoles(userSysId))
                return false;
        }
        return true;
    },

    userHasNoRoles: function(userSysId) {
        if (!userSysId)
            return true;
        var roleGr = new GlideRecord(this.TABLES.SYS_USER_HAS_ROLE);
        roleGr.addQuery(this.FIELDS.USER, userSysId);
        roleGr.addQuery('role.name', '!=', 'snc_internal'); // Exclude users with no role or only snc_internal role 
        roleGr.setLimit(1);
        roleGr.query();
        return !(roleGr.hasNext());
    },

    isSidebarSupportedOnSOW: function(table, sysId, isRecordCheckNeeded) {
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

    getChatsForRecord: function(table, sysId, participantsLimit, chatSysId, chatsLimit, commTaskIds) {
        if (gs.nil(table) || gs.nil(sysId)) return [];
        if (!this.isSidebarSupportedOnSOW(table, sysId)) return [];

        var sidebarChats = [];
        var collabRecordGr = new GlideRecord(this.TABLES.SYS_CS_COLLAB_RECORD);
        collabRecordGr.addQuery(this.FIELDS.DOCUMENT, 'IN', gs.nil(commTaskIds) ? [sysId] : commTaskIds.concat(sysId));
        if (!gs.nil(chatSysId))
            collabRecordGr.addQuery(this.FIELDS.COLLAB_CHAT, chatSysId);
        collabRecordGr.orderByDesc(this.FIELDS.SYS_UPDATED_ON);
        if (!gs.nil(chatsLimit))
            collabRecordGr.setLimit(chatsLimit);
        collabRecordGr.query();
        while (collabRecordGr.next()) {
            var chatGr = collabRecordGr.collab_chat ? collabRecordGr.collab_chat.getRefRecord() : null;
            if (gs.nil(chatGr) || !chatGr.isValidRecord())
                continue;
            var collabChatMembers = sn_collab.CollabChatScriptObject.getCollabChatMembers(chatGr.getValue(this.FIELDS.SYS_ID), participantsLimit);
            if (chatGr.is_chat_private && !this._isCurrentUserPartOfCollabChat(chatGr.getUniqueValue())) {
                continue;
            }
            var participants = [];
            var moreParticipantsText = "";
            var createdByUserSysId = '';
            for (var i = 0; i < collabChatMembers.length; i++) {
                createdByUserSysId = chatGr.getValue(this.FIELDS.SYS_CREATED_BY) === collabChatMembers[i]['userName'] ? collabChatMembers[i]['userSysId'] : createdByUserSysId;
                if (i < this.SIDEBAR_CHATS.NUMBER_OF_AVATARS)
                    participants.push({
                        'userName': collabChatMembers[i][this.COLLAB_MEMBER_FIELDS.USER_NAME],
                        'displayName': collabChatMembers[i][this.COLLAB_MEMBER_FIELDS.DISPLAY_NAME],
                        'avatar': collabChatMembers[i][this.COLLAB_MEMBER_FIELDS.AVATAR],
                        'email': collabChatMembers[i][this.COLLAB_MEMBER_FIELDS.EMAIL],
                        'sysId': collabChatMembers[i][this.COLLAB_MEMBER_FIELDS.SYS_ID]
                    });
                else
                if (!moreParticipantsText.length)
                    moreParticipantsText = collabChatMembers[i][this.COLLAB_MEMBER_FIELDS.DISPLAY_NAME];
                else
                    moreParticipantsText += ", " + collabChatMembers[i][this.COLLAB_MEMBER_FIELDS.DISPLAY_NAME];
            }
            var moreParticipantsHtml = "";
            if (moreParticipantsText)
                moreParticipantsHtml = '<div title="' + moreParticipantsText + '">+' + this._nFormatter(parseInt(collabChatMembers.length) - 5) + "</div>";

            sidebarChats.push({
                'chatSysId': chatGr.getValue(this.FIELDS.SYS_ID),
                'type': "sidebar_discussion",
                'title': chatGr.getValue(this.FIELDS.TITLE),
                'timeAgo': this.getDuration(chatGr.getValue(this.FIELDS.SYS_UPDATED_ON)),
                'updatedOn': chatGr.getValue(this.FIELDS.SYS_UPDATED_ON),
                'createdBy': createdByUserSysId,
                'participants': participants,
                'totalParticipants': collabChatMembers.length,
                'moreParticipantsHtml': moreParticipantsHtml
            });
        }
        return sidebarChats;
    },

    /**
     * Query sys_cs_collab_member to check if session user is part of the chat
     * @params collabChatSysId: collab_chat record id
     **/
    _isCurrentUserPartOfCollabChat: function(collabChatSysId) {
        var currUserSysId = gs.getUserID();
        var collabMemberGR = new GlideRecord(this.TABLES.SYS_CS_COLLAB_MEMBER);
        collabMemberGR.addQuery(this.FIELDS.COLLAB_CHAT, collabChatSysId);
        collabMemberGR.addQuery(this.FIELDS.MEMBER_DOCUMENT, currUserSysId);
        collabMemberGR.addActiveQuery();
        collabMemberGR.query();
        return collabMemberGR.next();
    },

    getNumberOfChats: function(table, sysId, commTaskIds) {
        var collabRecordGa = new GlideAggregate(this.TABLES.SYS_CS_COLLAB_RECORD);
        collabRecordGa.addAggregate('COUNT');
        collabRecordGa.addQuery(this.FIELDS.DOCUMENT, 'IN', gs.nil(commTaskIds) ? [sysId] : commTaskIds.concat(sysId));
        collabRecordGa.query();
        if (collabRecordGa.next())
            return collabRecordGa.getAggregate('COUNT');
        return 0;
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

    _nFormatter: function(num) {
        if (num >= 1000000000)
            return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';

        if (num >= 1000000)
            return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';

        if (num >= 1000)
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';

        return num;
    },

    type: 'SOWSidebarChatUtilsSNC'
});
