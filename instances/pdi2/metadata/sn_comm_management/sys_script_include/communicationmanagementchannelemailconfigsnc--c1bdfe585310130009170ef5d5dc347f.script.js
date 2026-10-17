var CommunicationManagementChannelEmailConfigSNC = Class.create();
CommunicationManagementChannelEmailConfigSNC.prototype = Object.extendsObject(CommunicationManagementChannelAbstractSNC, {
    initialize: function() {
        CommunicationManagementChannelAbstractSNC.prototype.initialize.call(this);
    },

    TYPE: 'e-mail',
    DEF_TABLE: 'comm_channel_def_email',
    INST_TABLE: 'comm_channel_email',
    CLASSIFICATION: 'update',
    DEFAULT_EMAIL_TEMPLATE_ID: 'e87ea60987a013000e3dd61e36cb0bbe',
    SYS_EMAIL_CLIENT_TEMPLATE: 'sys_email_client_template',
    NAME: 'name',

    getConfig: function(sourceTable) {
        var config = sn_comm_management.CommunicationManagementChannelAbstractSNC.prototype.getConfig.call(this, sourceTable);
        config.default_email_template_id = this.DEFAULT_EMAIL_TEMPLATE_ID;
        config.default_email_template_name = this.getDefaultEmailTemplateName(this.DEFAULT_EMAIL_TEMPLATE_ID);
        if (sourceTable)
            config.query_by_table = new CommunicationManagementBridgeSNC().getHandlerInstance(sourceTable).getCommTaskInstanceForTask();
        return config;
    },

    getDefaultEmailTemplateName: function(emailTemplateId) {
        var templateGr = new GlideRecord(this.SYS_EMAIL_CLIENT_TEMPLATE);
        templateGr.addQuery('sys_id', emailTemplateId);
        templateGr.query();
        var templateName = '';
        if (templateGr.get(emailTemplateId)) {
            templateName = templateGr.getValue(this.NAME);
        }
        return templateName;
    },

    updateChannelFromDef: function(channelInstanceGr, channelDefGr, planTaskGr, commTaskVariables) {
        if (channelDefGr.email_client_template)
            channelInstanceGr.email_client_template = channelDefGr.email_client_template;
        else
            channelInstanceGr.email_client_template = commTaskVariables.default_email_client_template;
        channelInstanceGr.recipient_field = channelDefGr.recipient_field;
    },

    updateChannelAdHoc: function(channelGr, commPlanGr, commTaskGr, commTaskVariables) {
        channelGr.email_client_template = commTaskVariables.default_email_client_template;
        if (commTaskVariables.templateMap && commTaskVariables.templateMap.emailClientTemplateId)
            channelGr.email_client_template = commTaskVariables.templateMap.emailClientTemplateId;
        channelGr.recipient_field = commTaskVariables.default_recipient_field;
    },

    prepareDataForCommunication: function(commTaskGr, respData) {
        var emailMeta = this.communicationManagementUtil.getEmailMetadata(commTaskGr, respData.expandGroupsAndRecipients);
        if (emailMeta) {
            respData.email = emailMeta;
            respData.email.available = true;
            respData.email.comm_task_table = commTaskGr.getRecordClassName();
        }
    },

    prepareChannelUpdates: function(commTaskGr, channelObj, currentTime, channelUpdate) {
        return this.communicationManagementUtil.findAndUpdateChannelEmailState(commTaskGr, channelObj.action, currentTime);
    },

    type: 'CommunicationManagementChannelEmailConfigSNC'
});
