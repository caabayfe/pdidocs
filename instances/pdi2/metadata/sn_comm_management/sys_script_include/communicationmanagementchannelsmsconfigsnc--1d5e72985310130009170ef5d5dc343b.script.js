var CommunicationManagementChannelSMSConfigSNC = Class.create();
CommunicationManagementChannelSMSConfigSNC.prototype = Object.extendsObject(CommunicationManagementChannelAbstractSNC, {
    initialize: function() {
		CommunicationManagementChannelAbstractSNC.prototype.initialize.call(this);
    },

	TYPE: 'sms',
	DEF_TABLE: 'comm_channel_def_sms',
	INST_TABLE: 'comm_channel_sms',
	CLASSIFICATION: 'update',

	_isAvailable: function(sourceTable) {
		var handler = new CommunicationManagementBridgeSNC().getHandlerInstance(sourceTable);
		var isNotifySet = handler.isNotifyNumberSet() || handler.isNotifyEnabled();
		var deniedChannels = [];
		if (handler.getDeniedChannelTypes())
			deniedChannels = handler.getDeniedChannelTypes();
		return isNotifySet && (deniedChannels.indexOf(this.TYPE) == -1);
	},

	updateChannelFromDef: function(channelInstanceGr, channelDefGr, planTaskGr, commTaskVariables) {
		if (channelDefGr.notify_sms_template)
			channelInstanceGr.notify_sms_template = channelDefGr.notify_sms_template;
		else
			channelInstanceGr.notify_sms_template = commTaskVariables.default_sms_template;
	},

	_getUIFields: function () {
		return ['sys_id', 'state', 'last_communication', 'comm_channel_config', 'notify_group_selector'];
	},

	updateChannelAdHoc: function(channelGr, commPlanGr, commTaskGr, commTaskVariables) {
		channelGr.notify_sms_template = commTaskVariables.default_sms_template;
	},

	prepareDataForCommunication: function(commTaskGr, respData) {
		var smsMeta = this.communicationManagementUtil.getSmsMetadata(commTaskGr);
		if (smsMeta) {
			respData.sms = smsMeta;
			respData.sms.available = true;
		}
	},

	prepareChannelUpdates: function(commTaskGr, channelObj, currentTime, channelUpdate) {
		return this.communicationManagementUtil.findAndUpdateChannelSMSState(commTaskGr, channelObj.action, currentTime);
	},

    type: 'CommunicationManagementChannelSMSConfigSNC'
});
