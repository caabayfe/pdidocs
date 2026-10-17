var CommunicationManagementUtil = Class.create();
CommunicationManagementUtil.prototype = Object.extendsObject(CommunicationManagementUtilSNC, {
	initialize: function() {
		sn_comm_management.CommunicationManagementUtilSNC.prototype.initialize.call(this);
	},

	type: 'CommunicationManagementUtil'
});
