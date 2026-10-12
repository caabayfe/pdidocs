var SendToSelfConfigurationUtil = Class.create();
	SendToSelfConfigurationUtil.prototype = Object.extendsObject(SendToSelfConfigurationUtilSNC, {
		initialize: function() {
			SendToSelfConfigurationUtilSNC.prototype.initialize.apply(this, arguments);
		},

		type: 'SendToSelfConfigurationUtil'
	});
