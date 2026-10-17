var CommunicationManagementChannelSidebarDiscussionConfigSNC = Class.create();
CommunicationManagementChannelSidebarDiscussionConfigSNC.prototype = Object.extendsObject(sn_comm_management.CommunicationManagementChannelAbstractSNC, {
    initialize: function() {
        sn_comm_management.CommunicationManagementChannelAbstractSNC.prototype.initialize.call(this);
    },
    TYPE: 'sidebar-discussion',
    DEF_TABLE: 'comm_channel_def_sidebar_discussion',
    INST_TABLE: 'comm_channel_sidebar_discussion',
    CLASSIFICATION: 'bridge',

    getConfig: function(sourceTable) {
        var config = sn_comm_management.CommunicationManagementChannelAbstractSNC.prototype.getConfig.call(this, sourceTable);
        config.available = this.isCollabChatAvailable();
        config.hideRecurringFrequency = true;
        config.hideForWorkbench = true;
        return config;
    },

    isCollabChatAvailable: function() {
        return new sn_sow_collab.SOWSidebarChatUtils().isSidebarSupportedOnSOW(null, null, false);
    },

    getCommunicationChannelDetails: function(commChannelGr, configGr) {
        var requiredFields = ['sys_id', 'state', 'last_communication', 'comm_channel_config'];
        var jsonOb = this.communicationManagementUtil.toJS(commChannelGr, requiredFields);
        jsonOb.channelType = {
            value: configGr.type + '',
            display_value: configGr.type.getDisplayValue()
        };
        jsonOb.channelTable = {
            table: "sys_cs_collab_record",
            source_table: "table",
            source: "document",
            initiated_by: "sys_created_by"
        };
        jsonOb.is_collaboration = true;
        jsonOb.is_collaboration_chat = true;
        jsonOb.is_import_supported = false;
        jsonOb.is_initiate_chat_supported = false; // To hide initiate button on sidebar discussion comm task card in workbench
        return jsonOb;
    },

    updateChannelFromDef: function(channelInstanceGr, channelDefGr, planTaskGr, commTaskVariables) {
        //NoOp
    },

    updateChannelAdHoc: function(channelGr, commPlanGr, commTaskGr, commTaskVariables) {
        //NoOp
    },

    prepareDataForCommunication: function(commTaskGr, respData) {
        //NoOp
    },

    prepareChannelUpdates: function(commTaskGr, channelObj, currentTime, channelUpdate) {
        //NoOp
    },

    type: 'CommunicationManagementChannelSidebarDiscussionConfigSNC'
});
