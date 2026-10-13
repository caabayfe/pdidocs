var CommunicationManagementChannelDexConfigSNC = Class.create();
CommunicationManagementChannelDexConfigSNC.prototype = Object.extendsObject(sn_comm_management.CommunicationManagementChannelAbstractSNC, {
    initialize: function() {
        sn_comm_management.CommunicationManagementChannelAbstractSNC.prototype.initialize.call(this);
    },

    TYPE: 'dex-desktop-assistant',
    DEF_TABLE: 'comm_channel_def_dex_da',
    INST_TABLE: 'comm_channel_dex_da',
    CLASSIFICATION: 'update',
    DEFAULT_TEMPLATE_ID: '813c6d67f5a11210f877c7f0384dc85b',
    DEX_DESKTOP_ASSISTANT_NOTIFICATION_TEMPLATE: 'sn_dex_desktop_assistant_notification_template',

    getConfig: function(sourceTable) {
        var config = sn_comm_management.CommunicationManagementChannelAbstractSNC.prototype.getConfig.call(this, sourceTable);
        config.hideForWorkbench = true;
        config.default_dex_template_id = this.DEFAULT_TEMPLATE_ID;
        config.available = this.isDexAvailable();
        return config;
    },

    isDexAvailable: function() {
        return GlidePluginManager.isActive("sn_dex_desktop") && gs.getProperty("sn_dex_desktop.enable_push_notification", "false") == "true";
    },

    updateChannelFromDef: function(channelInstanceGr, channelDefGr, planTaskGr, commTaskVariables) {
        if (channelDefGr.dex_desktop_assistant_notification_template)
            channelInstanceGr.dex_desktop_assistant_notification_template = channelDefGr.dex_desktop_assistant_notification_template;
        else
            channelInstanceGr.dex_desktop_assistant_notification_template = this.DEFAULT_TEMPLATE_ID;
    },

    updateChannelAdHoc: function(channelGr, commPlanGr, commTaskGr, commTaskVariables) {
        channelGr.dex_desktop_assistant_notification_template = this.DEFAULT_TEMPLATE_ID;
    },

    _parseTemplateMessage: function(commTaskGR, dexChannelGR, dex) {
        var dexTemplateGR = new GlideRecord(this.DEX_DESKTOP_ASSISTANT_NOTIFICATION_TEMPLATE);
        var notificationTemplateId = dexChannelGR.dex_desktop_assistant_notification_template.toString();

        dex.template_id = notificationTemplateId;

        if (dexTemplateGR.get(notificationTemplateId)) {
            var commManagementGlobalUtil = new global.CommunicationManagementGlobalUtilSNC();
            dex.message = commManagementGlobalUtil.formatContent(commTaskGR, dexTemplateGR.template);
            dex.title = dexTemplateGR.getDisplayValue('title');
        }
    },

    _getDexMetaData: function(commTaskGR) {
        var dex = {};
        var participants = [];
        var dexChannelGR = new GlideRecord(this.INST_TABLE);
        dexChannelGR.addQuery(this.communicationManagementUtil.COLUMNS.COMM_TASK, commTaskGR.sys_id);
        dexChannelGR.setLimit(1);
        dexChannelGR.query();
        if (dexChannelGR.next() && this.isDexAvailable()) {
            if (dexChannelGR.dex_desktop_assistant_notification_template) {
                this._parseTemplateMessage(commTaskGR, dexChannelGR, dex);
                var commPlanGr = new GlideRecord('comm_plan');
                if (commPlanGr.get(commTaskGR.incident_alert + '')) {
                    var contactGr = this.communicationManagementUtil.getContactGr(commTaskGR.incident_alert, commPlanGr.sys_class_name);
                    while (contactGr.next()) {
                        if (contactGr.user && contactGr.user.toString()) {
                            participants.push({
                                id: contactGr.getValue('user'),
                                label: contactGr.getDisplayValue('user'),
                                type: 'sys_user',
                                avatarProps: {
                                    imageSrc: GlideAvatarFinder.getAvatarPath(contactGr.getValue('user')),
                                    userName: contactGr.getDisplayValue('user')
                                }
                            });
                        } else if (contactGr.group && contactGr.group.toString()) {
                            participants.push({
                                id: contactGr.getValue('group'),
                                label: contactGr.getDisplayValue('group'),
                                type: 'sys_user_group',
                                icon: 'user-group-outline'
                            });
                        } else if (contactGr.consumer && contactGr.consumer.toString()) {
                            // NO-OP
                        } else if (contactGr.recipient_list && contactGr.recipient_list.toString()) {
                            participants.push({
                                id: contactGr.getValue('recipient_list'),
                                label: contactGr.getDisplayValue('recipient_list'),
                                type: 'sn_publications_recipients_list',
                                icon: 'user-group-outline'
                            });
                        }
                    }

                }
                dex.recipients = participants;
            } else
                return false;
        } else
            dex.available = false;
        return dex;
    },

    prepareDataForCommunication: function(commTaskGr, respData) {
        var dexMeta = this._getDexMetaData(commTaskGr, respData.expandGroupsAndRecipients);
        if (dexMeta) {
            respData.dex_desktop_assistant = dexMeta;
            respData.dex_desktop_assistant.available = true;
            respData.dex_desktop_assistant.comm_task_table = commTaskGr.getRecordClassName();
            respData.dex_desktop_assistant.hideForWorkbench = true;
        }
    },

    prepareChannelUpdates: function(commTaskGr, channelObj, currentTime, channelUpdate) {
        if (channelObj.action == this.communicationManagementUtil.CHANNEL_ACTIONS.SENT) {
            var channelGr = new GlideRecord(this.INST_TABLE);
            channelGr.addQuery(this.communicationManagementUtil.COLUMNS.COMM_TASK, commTaskGr.getUniqueValue());
            channelGr.query();
            if (channelGr.next()) {
                channelGr.last_communication = currentTime;
                channelGr.state = this.communicationManagementUtil.CHANNEL_STATES.SENT;
                channelGr.update();
                return {
                    update_last_communication: true,
                    update_terminal_state: true
                };
            }
        }

    },

    type: 'CommunicationManagementChannelDexConfigSNC'
});
