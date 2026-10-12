var ContextualPanelConfig = Class.create();
ContextualPanelConfig.prototype = {
    getPanelDropdownPayload: function() {
        return [];
    },

    getPanelCardProps: function(recordSysId) {
        return [];
    },
	
	getRecommendedUsers: function(recordSysId, tableName) {
		return [];
	},
	
	handleChannelRedirect: function(recordSysId, tableName, requestorData) {
		return [];
	},
	
	getChannelConfigData: function(methodName, params) {
		return [];
	},
	
	refreshUserPreference: function(recommededParticipants) {
		return [];
	},

    type: 'ContextualPanelConfig'
};
