var CommunicationManagementRestHandlerSNC = Class.create();
CommunicationManagementRestHandlerSNC.prototype = {

    initialize: function() {
    },

	getCommunicationDetails: function(sys_id, recordClass, filterCriteria) {
		var commTaskHandler = new CommunicationManagementBridgeSNC().getHandlerInstance(recordClass);
		return commTaskHandler.getCommunicationDetails(sys_id, filterCriteria);
	},

	getGroups: function(sys_id, recordClass){
		var commTaskHandler = new CommunicationManagementBridgeSNC().getHandlerInstance(recordClass);
		return commTaskHandler.prepareGroupsInvolved(sys_id);
	},

	type: 'CommunicationManagementRestHandlerSNC'
};
