var CommunicationManagementChannelAbstractSNC = Class.create();
CommunicationManagementChannelAbstractSNC.prototype = {
    initialize: function() {
		this.communicationManagementUtil = new CommunicationManagementUtil();
    },

	TABLE_COMM_CHANNEL_CONFIG: 'comm_channel_config',
	COLUMN_CLASSIFICATION: 'classification',
	COLUMN_TYPE: 'type',

	getConfig: function(sourceTable /*e.g - 'incident', 'case'*/) {
		var config = {
			classification: this.CLASSIFICATION,
			type: this.TYPE,
			inst_table: this.INST_TABLE,
			def_table: this.DEF_TABLE,
			not_compatible_with: this._getNotCompatibleWith(),
		};

		if (sourceTable)
			config.available = this._isAvailable(sourceTable);

		return config;
	},

	_isAvailable: function(sourceTable) {
		var handler = new CommunicationManagementBridgeSNC().getHandlerInstance(sourceTable);
		var deniedChannels = [];
		if (handler.getDeniedChannelTypes())
			deniedChannels = handler.getDeniedChannelTypes();
		return (deniedChannels.indexOf(this.TYPE) == -1);
	},

	_getUIFields: function() {
		return ['sys_id', 'state', 'last_communication', 'comm_channel_config'];
	},

	_getNotCompatibleWith: function() {
		var notCompatibleWith = [];
		var commChannelConfigGr = new GlideRecord(this.TABLE_COMM_CHANNEL_CONFIG);
		commChannelConfigGr.addQuery(this.COLUMN_CLASSIFICATION, '!=', this.CLASSIFICATION);
		commChannelConfigGr.addActiveQuery();
		commChannelConfigGr.query();
		while(commChannelConfigGr.next()) {
			notCompatibleWith.push(commChannelConfigGr.getValue(this.COLUMN_TYPE));
		}
		return notCompatibleWith;
	},

	getCommunicationChannelDetails: function(commChannelGr, configGr) {
		var requiredFields = this._getUIFields();
		var jsonOb = this.communicationManagementUtil.toJS(commChannelGr, requiredFields);
		jsonOb.channelType = {
			value: configGr.type + '',
			display_value: configGr.type.getDisplayValue()
		};
		return jsonOb;
	},

    type: 'CommunicationManagementChannelAbstractSNC'
};
