var CommunicationManagementIncidentHandler = Class.create();
CommunicationManagementIncidentHandler.prototype = Object.extendsObject(CommunicationManagementIncidentHandlerSNC, {
    initialize: function() {
		CommunicationManagementIncidentHandlerSNC.prototype.initialize.call(this);
    },

    type: 'CommunicationManagementIncidentHandler'
});
