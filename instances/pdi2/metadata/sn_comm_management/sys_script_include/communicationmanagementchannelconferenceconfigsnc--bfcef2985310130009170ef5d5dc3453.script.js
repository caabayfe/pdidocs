var CommunicationManagementChannelConferenceConfigSNC = Class.create();
CommunicationManagementChannelConferenceConfigSNC.prototype = Object.extendsObject(CommunicationManagementChannelAbstractSNC, {
    initialize: function() {
		CommunicationManagementChannelAbstractSNC.prototype.initialize.call(this);
    },

	TYPE: 'conference',
	DEF_TABLE: 'comm_channel_def_conference',
	INST_TABLE: 'comm_channel_conference',
	CLASSIFICATION: 'bridge',

	_isAvailable: function(sourceTable) {
		var handler = new CommunicationManagementBridgeSNC().getHandlerInstance(sourceTable);
		var isNotifySet = handler.isNotifyNumberSet() || handler.isNotifyEnabled();
		var deniedChannels = [];
		if (handler.getDeniedChannelTypes())
			deniedChannels = handler.getDeniedChannelTypes();
		return isNotifySet && (deniedChannels.indexOf(this.TYPE) == -1);
	},

	_getUIFields: function() {
		return ['sys_id', 'state', 'last_communication', 'comm_channel_config', 'notify_conference_call', 'notify_group_selector'];
	},

	updateChannelFromDef: function(channelInstanceGr, channelDefGr, planTaskGr, commTaskVariables) {
		//NoOp
	},

	updateChannelAdHoc: function(channelGr, commPlanGr, commTaskGr, commTaskVariables) {
		//NoOp
	},

	prepareChannelUpdates: function(commTaskGr, channelObj, currentTime, channelUpdate) {
		return this.communicationManagementUtil.findAndUpdateChannelConferenceState(commTaskGr, channelObj.action, currentTime, channelObj.notify_conference_call_sys_id);
	},

    type: 'CommunicationManagementChannelConferenceConfigSNC'
});
