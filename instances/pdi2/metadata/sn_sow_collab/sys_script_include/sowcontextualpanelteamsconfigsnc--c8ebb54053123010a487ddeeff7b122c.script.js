var SOWContextualPanelTeamsConfigSNC = Class.create();
SOWContextualPanelTeamsConfigSNC.prototype = {

    TCM_COLLAB_FEB_VERSION: 202202,

    isTeamsPluginActive: function() {
        var tcmCollabVersion = gs.getProperty("sn_tcm_collab_hook.version", 0);
        var isTeamsInstalled = (GlidePluginManager.isActive('com.snc.ms_teams.it')) && !gs.nil(tcmCollabVersion) && tcmCollabVersion >= this.TCM_COLLAB_FEB_VERSION;
        if (!isTeamsInstalled) return false;
        else return new sn_tcm_collab_hook.MSTeamsChatUtil().isMultiTenant();
    },

    getRecommendedUsers: function(recordSysId, tableName) {
        if (!this.isTeamsPluginActive() || !recordSysId || !tableName)
            return [];

        var recommendedUsersArr = [];
        var recommededUserWithPresence = [];
        var sourceGr = new GlideRecord(tableName);
        if (!sourceGr.get(recordSysId))
            return [];
        var chatUtils = new sn_tcm_collab_hook.MSTeamsChatUtil();
        var recommendedUsers = chatUtils.getRecommendedParticipants(tableName, recordSysId, '', 'microsoft_teams');
        if (!recommendedUsers || !recommendedUsers.length) // in case of no recommendations
            return [];
        recommendedUsers = chatUtils.addAvatarUrl(recommendedUsers, 'id');
        var sidebarChatUtils = new sn_sow_collab.SOWSidebarChatUtils();
        recommendedUsers.forEach(function(recommendedUser) {
            if (recommendedUser.id != gs.getUserID()) {
                if (Array.isArray(recommendedUser.users)) {
                    recommendedUser.users.forEach(function(groupUser) {
                        if (groupUser.id != gs.getUserID()) {
                            recommendedUsersArr.push({
                                id: groupUser.id,
                                fieldLabel: groupUser.fieldLabel,
                                name: groupUser.name,
                                avatar: groupUser.avatar,
                                isValidEmail: groupUser.isValidEmail,
                                email: groupUser.email,
                                title: '',
                                displayValue: groupUser.displayValue ? groupUser.displayValue : groupUser.name,
                                hasSidebarPermission: sidebarChatUtils.isSidebarSupportedOnSOW(tableName, recordSysId) ? sidebarChatUtils.hasPermission(groupUser.id, recordSysId, tableName) : false
                            });
                        }
                    });
                } else {
                    recommendedUsersArr.push({
                        id: recommendedUser.id,
                        fieldLabel: recommendedUser.fieldLabel,
                        name: recommendedUser.name,
                        avatar: recommendedUser.avatar,
                        isValidEmail: recommendedUser.isValidEmail,
                        email: recommendedUser.email,
                        title: '',
                        displayValue: recommendedUser.displayValue,
                        hasSidebarPermission: sidebarChatUtils.isSidebarSupportedOnSOW(tableName, recordSysId) ? sidebarChatUtils.hasPermission(recommendedUser.id, recordSysId, tableName) : false
                    });
                }
            }
        });

        recommededUserWithPresence = this.refreshUserPreference(recommendedUsersArr);
        return recommededUserWithPresence;
    },

    refreshUserPreference: function(recommendedParticipants) {
        if (!recommendedParticipants.length) return [];
        // If token is not available do not proceed.
        if (!this.isTokenAvailable()) return recommendedParticipants;
        var presenceOutput = new sn_tcm_collab_hook.MSTeamsChatUtil().getPresence(recommendedParticipants, "id", true);
        if (!gs.nil(presenceOutput.error))
            return presenceOutput.users;
        return presenceOutput;
    },

    getChannelConfigData: function(methodName, params) {
        if (methodName === "isTokenAvailable") return this.isTokenAvailable();
        if (methodName === "fetchRefreshDuration") return (GlideApplicationProperty.getValue("sn_tcm_collab_hook.teams.presence_status_cache_invalidate_duration") || 180);
        return null;
    },

    getPanelDropdownPayload: function() {
        var payload = [];
        if (this.isTeamsPluginActive()) {
            var teamsChat = {
                id: 'teams-chat',
                label: gs.getMessage('Start Microsoft Teams chat'),
                icon: 'microsoft-teams-fill',
                sectionId: 'chat',
                sectionLabel: gs.getMessage('Chat')
            };
            var chatImport = {
                id: 'import-teams-chat',
                label: gs.getMessage('Import Microsoft Teams chat'),
                icon: 'download-outline',
                sectionId: 'chat',
                sectionLabel: gs.getMessage('Chat')
            };
            payload.push(teamsChat, chatImport);
        }
        return payload;
    },

    formatDate: function(dateStr, label) {
        var dateObj = {};
        var val = {};
        var startGd = new GlideDateTime(dateStr);

        dateObj["label"] = (label === "started") ? gs.getMessage("Started on") : gs.getMessage("Last Imported");
        if (label === "started") {
            val["value"] = startGd.getDisplayValue();
            val["type"] = "string";

            dateObj["value"] = val;
        } else {
            val["value"] = this.getFormattedDuration(startGd);
            val["type"] = "string";

            dateObj["value"] = val;
        }

        return dateObj;
    },

    handleChannelRedirect: function(recordSysId, tableName, requestorData) {
        var chatUtils = new sn_tcm_collab_hook.MSTeamsChatUtil();
        var res = [];

        if (!this.isTeamsPluginActive())
            return res;

        var sourceGr = this.getTableGr(recordSysId, tableName);
        var userIds = [requestorData.id, gs.getUserID()];
        var clientType = gs.getUser().getPreference('sn_tcm_collab_hook_teams_preferred_client') || 'web_client';
        var autoImport = chatUtils.importChatUtil.isAutoImportEnabled(sourceGr);

        var appDetails = chatUtils.getAppDetails(sourceGr, true);
        var useIHActionsForSingleTenant = chatUtils.useIHActionsForSingleTenant();
        if (!("multiTenant" in appDetails) && !useIHActionsForSingleTenant)
            return res;

        if (appDetails.multiTenant || useIHActionsForSingleTenant) {
            try {
                var chatInfo = new sn_tcm_collab_hook.MSTeamsChatUtil().createChatFromChatModal(sourceGr, userIds, null, null, clientType, autoImport);
                res.push(chatInfo);
                var requesterUserGr = this._getRecordById("sys_user", requestorData.id);
                new sn_tcm_collab_hook.MSTeamsAjaxUtils().addCommentForGroupChat(GlideStringUtil.escapeHTML(gs.getUserDisplayName()), GlideStringUtil.escapeHTML(requesterUserGr.getDisplayValue('name')), '[]', tableName, recordSysId, 'work_notes', chatInfo);
                return res;
            } catch (e) {
                return {
                    errorMsg: e.message
                };
            }
        }

        return res;
    },

    hasChats: function(recordSysId) {
        if (!recordSysId || !this.isTeamsPluginActive())
            return false;
        var teamsChatsGr = new GlideRecord('sn_tcm_collab_hook_ms_teams_chat');
        teamsChatsGr.addQuery('source', recordSysId);
        teamsChatsGr.setLimit(1);
        teamsChatsGr.query();
        return teamsChatsGr.hasNext();
    },

    fetchPanelCardProps: function(recordSysId, chatSysId, commTaskIds, chatsLimit) {
        if (!this.isTeamsPluginActive())
            return [];

        var collabUtils = [];
        var itemIndex = 0;
        var teamsChatsGr = new GlideRecord('sn_tcm_collab_hook_ms_teams_chat');
        teamsChatsGr.addQuery('source', 'IN', gs.nil(commTaskIds) ? [recordSysId] : commTaskIds.concat(recordSysId));
        if (!gs.nil(chatSysId))
            teamsChatsGr.addQuery('sys_id', chatSysId);
        if (!gs.nil(chatsLimit))
            teamsChatsGr.setLimit(chatsLimit);
        teamsChatsGr.orderByDesc('sys_updated_on');
        teamsChatsGr.query();

        var clientType = gs.getUser().getPreference('sn_tcm_collab_hook_teams_preferred_client') || 'web_client';

        while (teamsChatsGr.next()) {
            var azureUsers = [];
            var dates = [];
            var obj = {};
            var users = teamsChatsGr.users.split(",");
            var totalParticipants = Math.floor(users.length) + '';
            obj.topic = teamsChatsGr.topic + '';
            obj.type = "microsoft_teams_chat";
            obj.updatedOn = teamsChatsGr.getValue('sys_updated_on');
            obj.createdBy = teamsChatsGr.getValue('initiated_by');
            obj.sectionLabel = gs.getMessage('Microsoft Teams chat');
            obj.commStatus = gs.getMessage('Ongoing');
            obj.sectionIcon = "microsoft-teams-fill";
            obj.participantsCount = gs.getMessage('Participants ({0})', totalParticipants);
            obj.itemIndex = itemIndex++;
            obj.chatSysId = teamsChatsGr.getUniqueValue();
            obj.chatSource = {
                sysId: teamsChatsGr.getValue('source'),
                table: teamsChatsGr.getValue('source_table')
            };
            obj.isCurrentUserInChat = users.indexOf(gs.getUserID()) != -1;
            if (obj.isCurrentUserInChat) {
                obj.sectionDropdownOptions = [{
                    id: "import-teams-chat",
                    label: gs.getMessage('View chat'),
                    icon: "microsoft-teams-fill"
                }];
            }

            var started = this.formatDate(teamsChatsGr.sys_created_on + '', "started");
            var imported = this.formatDate(teamsChatsGr.last_imported_on + '', "imported");

            dates.push(started, imported);

            obj.started = dates;

            users.forEach(function(user) {
                var users = {};
                var userGr = new GlideRecord('sys_user');
                userGr.get(user + '');

                users.avatar = "/" + userGr.avatar + ".iix?t=small";
                users.name = userGr.name + '';

                azureUsers.push(users);
            });
            obj.users = azureUsers;

            if (clientType == 'desktop_application')
                obj.chatUrl = new sn_tcm_collab_hook.MSTeamsChatConfigProvider().getTeamsAppUrl() + "l/chat/" + teamsChatsGr.chat_id + "?ctx=chat";
            else
                obj.chatUrl = new sn_tcm_collab_hook.MSTeamsChatConfigProvider().getTeamsUrl() + "/l/chat/" + teamsChatsGr.chat_id + "?ctx=chat";

            collabUtils.push(obj);
        }

        return collabUtils;
    },


    isTokenAvailable: function() {
        if (GlidePluginManager.isActive('com.snc.tcm_collab_hook')) {
            var msTeamsCredentialsHelper = new sn_tcm_collab_hook.MSTeamsCredentialsHelper();
            return msTeamsCredentialsHelper.isAccessTokenOrRefreshTokenAvailable();
        }
        return false;
    },


    getFormattedDuration: function(dateStr) {
        if (dateStr != '') {
            var gdt = new GlideDateTime();
            gdt.setValue(dateStr);
            var dur = GlideDateTime.subtract(gdt, new GlideDateTime());
            return dur.getDisplayValue() + '';
        } else
            return 'N/A'; // empty
    },

    getTableGr: function(recordSysId, tableName) {
        var tableGr = new GlideRecord(tableName);

        tableGr.get(recordSysId);

        return tableGr;
    },

    _getRecordById: function(table, id) {
        var gr = new GlideRecord(table);
        if (gr.get(id))
            return gr;
    },

    type: 'SOWContextualPanelTeamsConfigSNC'
};
