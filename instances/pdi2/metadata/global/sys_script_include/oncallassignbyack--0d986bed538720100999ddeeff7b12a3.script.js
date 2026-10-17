var OnCallAssignByAck = Class.create();
OnCallAssignByAck.prototype = Object.extendsObject(OnCallAssignByAckSNC, {

	initialize: function() {
		OnCallAssignByAckSNC.prototype.initialize.call(this);
	},

	type: 'OnCallAssignByAck'
});
