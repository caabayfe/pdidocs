var NotifyJsTelephonyDriver = Class.create();
NotifyJsTelephonyDriver.prototype = Object.extendsObject(global.BaseNotifyJsTelephonyDriver, {
    initialize: function() {
		global.BaseNotifyJsTelephonyDriver.prototype.initialize.apply(this, arguments);
    },
	
	isActive: function () {
		return true;
	},

	supportsCallOverWebRtc: function () {
		return this.supportsCall();
	},
	
	supportsCall: function () {
		return true;
	},
	
	supportsSms: function () {
		return true;
	},
	
	supportsAutonomousBulkSms: function (/*String*/ phoneNumber) {
		return false;
	},
	
	getClientSessionTTL: function () {
		throw 'Not implemented';
		//return 0;
	},

	getPhoneNumber: function (/*String*/ phoneNumber) {
		throw 'Not implemented';
		// {
		// 	type: 'short_code' | 'long_code',
		// 	number: 'the_ph_number',
		// 	sid: 'number_sid',
		// 	hasVoice: 'true' | 'false',
		// 	hasSms: 'true' | 'false',
		// 	hasRecordingSupport: 'true' | 'false',
		// 	voiceDirectionSupport: 'in' | 'out' | 'both',
		// 	smsDirectionSupport: 'in' | 'out' | 'both',
		// }
	},

	getPhoneNumbers: function () {
		throw 'Not implemented';
		//return [array of getPhoneNumber() objects];
	},

	getToken: function (/*GlideRecord*/gr) {
		throw 'Not implemented';
		//return "token";
	},

	getMaxSizeForBulkSMS: function(/*String*/ phoneNumber) {
		throw 'Not implemented';
	},

	sendSMS: function (/*NotifyPhoneNumber*/ notifyPhoneNumber, /*E.164 formatted String*/ toPhoneNumber, /*String*/ messageBody) {
		throw 'Not implemented';
		//return "smsSid";
	},
	
	sendAutonomousBulkSMS: function (/*NotifyPhoneNumber*/ notifyPhoneNumber, /*Array of E.164 formatted Strings*/ toPhoneNumbers, /*String*/ messageBody, /*GlideRecord - Optional*/ source) {
		// Will be invoked only if the driver returns true from supportsAutonomousBulkSms().
		// When smsSid for each SMS is known invoke this.messageSent() to create message records and trigger their
		// workflows.
	},
	
	call: function (/*NotifyPhoneNumber*/ notifyPhoneNumber, /*E.164 formatted String*/ toPhoneNumber) {
		throw 'Not implemented';
		//return "callSid";
	},
	
	kick: function (/*GlideRecord*/ participantRecord) {
		throw 'Not implemented';
	},
	
	mute: function (/*GlideRecord*/ participantRecord) {
		throw 'Not implemented';
	},
	
	unmute: function (/*GlideRecord*/ participantRecord) {
		throw 'Not implemented';
	},
	
	modifyCall: function (/*String*/ callID, /*JSON as String*/ notifyActionJson, /*GlideRecord*/ actionRecord) {
		throw 'Not implemented';
	},
	
	getParentCallID: function (/*String*/ callID) {
		throw 'Not implemented';
		//return "parentCallSid";
	},
	
	dequeueCall: function (/*String*/ callID, /*String*/ queueID) {
		throw 'Not implemented';
	},

	getCapabilities: function () {
		return [];
		//reference BaseNotifyJsTelephonyDriver.CAPABILITIES for valid values.
	},
	
    type: 'NotifyJsTelephonyDriver'
});
