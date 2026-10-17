var SMSPreferenceHandler = Class.create();
SMSPreferenceHandler.prototype = Object.extendsObject(SMSPreferenceHandlerSNC, {
	initialize: function (provider) {
		SMSPreferenceHandlerSNC.prototype.initialize.call(this, provider);
	},

	type: 'SMSPreferenceHandler'
});
