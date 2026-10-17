var SowCollabUtils = Class.create();
SowCollabUtils.prototype = Object.extendsObject(sn_uib_collab.CollabUtils, {
    initialize: function() {},

    SOW_CONTEXTUAL_PANEL_VISIBILITY_HANDLER: "sn_sow_collab.SOWContextualPanelVisibility",

    contextPanelConfigHandler: function(context, requestPayload) {
        var sectionProps = [];

        var SOW_CONTEXTUAL_PANEL_PROPS_HANDLER = "sn_sow_collab.SOWContextualPanelConfig";
        var exPointImplementations = new GlideScriptedExtensionPoint().getExtensions(SOW_CONTEXTUAL_PANEL_PROPS_HANDLER);
        if (exPointImplementations) {
            for (i = 0; i < exPointImplementations.length; i++) {
                var handler = exPointImplementations[i];
                if (context === "dropDown")
                    handler.getPanelDropdownPayload().forEach(function(content) {
                        sectionProps.push(content);
                    });
                else if (context === "cardProps")
                    handler.fetchPanelCardProps(requestPayload.recordSysId, requestPayload.chatSysId, requestPayload.chatCommTasks, requestPayload.chatsLimit).forEach(function(prop) {
                        sectionProps.push(prop);
                    });
                else if (context === "recommendedUsers")
                    handler.getRecommendedUsers(requestPayload.recordSysId, requestPayload.tableName).forEach(function(recommendedUser) {
                        sectionProps.push(recommendedUser);
                    });
                else if (context === "handleChannelRedirect") {
                    var handleChannelRedirectOutput = handler.handleChannelRedirect(requestPayload.recordSysId, requestPayload.tableName, requestPayload.requestorData);
                    if (handleChannelRedirectOutput.errorMsg)
                        return handleChannelRedirectOutput;
                    else
                        handleChannelRedirectOutput.forEach(function(channelData) {
                            sectionProps.push(channelData);
                        });
                } else if (context === "getChannelConfigData") sectionProps.push(handler.getChannelConfigData(requestPayload.methodName, requestPayload.params));
                else if (context === "refreshUserPreference")
                    handler.refreshUserPreference(requestPayload.recommendedParticipants).forEach(function(data) {
                        sectionProps.push(data);
                    });
            }
        }

        return sectionProps;
    },

    buildDropDownPanelPayload: function(content) {
        var payload = {};
        payload.id = content.id;
        payload.label = content.label;
        payload.icon = content.icon;
        return payload;
    },

    getDropDownPanelContents: function() {
        var that = this;
        var contentsArr = this.contextPanelConfigHandler("dropDown", {});

        if (!contentsArr.length)
            return [];

        var sectionsMap = {};

        contentsArr.forEach(function(content) {
            if (!sectionsMap[content.sectionId]) {
                var section = {};
                section.id = content.sectionId;
                section.label = content.sectionLabel;
                section.children = [];
                sectionsMap[content.sectionId] = section;
            }
            sectionsMap[content.sectionId].children.push(that.buildDropDownPanelPayload(content));
        });
        var sections = [];
        Object.keys(sectionsMap).forEach(function(s) {
            sections.push(sectionsMap[s]);
        });
        return sections;
    },

    getPanelCardProps: function(recordSysId, chatSysId, chatCommTasks, chatsLimit) {
        var payload = {
            recordSysId: recordSysId,
            chatSysId: chatSysId,
            chatCommTasks: chatCommTasks,
            chatsLimit: chatsLimit
        };

        var contentsArr = this.contextPanelConfigHandler("cardProps", payload);
        return contentsArr;
    },

    getRecommededUsers: function(recordSysId, tableName) {
        var payload = {
            recordSysId: recordSysId,
            tableName: tableName
        };
        var recommendedUsersArr = this.contextPanelConfigHandler("recommendedUsers", payload);
        return recommendedUsersArr;
    },

    handleChannelRedirect: function(recordSysId, tableName, requestorData) {
        var payload = {
            recordSysId: recordSysId,
            tableName: tableName,
            requestorData: requestorData
        };

        try {
            return this.contextPanelConfigHandler("handleChannelRedirect", payload);
        } catch (e) {
            return {
                errorMsg: e.message
            };
        }
    },

    refreshUserPreference: function(recommendedParticipants) {
        var payload = {
            recommendedParticipants: recommendedParticipants,
        };

        var recommendedUsersArr = this.contextPanelConfigHandler("refreshUserPreference", payload);
        return recommendedUsersArr;
    },

    getChannelConfigData: function(methodName, params) {
        var payload = {
            methodName: methodName,
            params: params ? params : ''
        };

        var channelConfigData = this.contextPanelConfigHandler("getChannelConfigData", payload);

        if (methodName === 'fetchRefreshDuration') channelConfigData = Math.min.apply(null, channelConfigData);

        return channelConfigData;
    },

    isTokenAvailable: function() {
        if (GlidePluginManager.isActive('com.snc.tcm_collab_hook')) {
            var msTeamsCredentialsHelper = new sn_tcm_collab_hook.MSTeamsCredentialsHelper();
            return msTeamsCredentialsHelper.isAccessTokenOrRefreshTokenAvailable();
        }
        return false;
    },

    canViewChats: function(table, sysId) {
        if (gs.nil(table) || gs.nil(sysId) || sysId === -1) {
            return false;
        }
        var exPointImplementations = new GlideScriptedExtensionPoint().getExtensions(this.SOW_CONTEXTUAL_PANEL_VISIBILITY_HANDLER);
        if (exPointImplementations) {
            for (i = 0; i < exPointImplementations.length; i++) {
                var handler = exPointImplementations[i];
                if (handler.canLaunchChat(sysId, table))
                    return true;
            }
        }
        return false;
    },

    canViewCalls: function(table, sysId) {
        if (gs.nil(table) || gs.nil(sysId) || sysId === -1) {
            return false;
        }
        if (GlidePluginManager.isActive('com.snc.notify'))
            return new sn_uib_notify.NotifyUXFConferenceUtil().canViewCalls(table, sysId);
        return false;
    },

    getNumberOfChats: function(table, sysId, commTaskIds) {
        if (!this.isTeamsITPluginActive())
            return 0;
        var teamsChatGa = new GlideAggregate('sn_tcm_collab_hook_ms_teams_chat');
        teamsChatGa.addAggregate('COUNT');
        teamsChatGa.addQuery('source', 'IN', gs.nil(commTaskIds) ? [sysId] : commTaskIds.concat(sysId));
        teamsChatGa.query();
        if (teamsChatGa.next())
            return teamsChatGa.getAggregate('COUNT');
        return 0;
    },

    isTeamsITPluginActive: function() {
        return GlidePluginManager.isActive('com.snc.ms_teams.it');
    },

    type: 'SowCollabUtils'
});
