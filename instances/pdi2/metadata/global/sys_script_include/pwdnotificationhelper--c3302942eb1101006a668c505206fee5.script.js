var PwdNotificationHelper = Class.create();
PwdNotificationHelper.prototype = {
	PWD_MESSAGE : '7cd0c421bf200100710071a7bf0739bd',  // from sysevent_email_action
	UNSUBSCRIBE : 'c1bfa4040a0a0b8b001eeb0f3f5ee961',  // notification_filter
	INVALID_PHONE_NUMBER: -4,
	INVALID_REQUEST_RESPONSE: -3,
	PAUSE_WINDOW_RESPONSE: -2,
	PER_DAY_LIMIT_RESPONSE: -1,
	GENERIC_FAIL_RESPONSE: 0,
	SUCCESS_RESPONSE: 1,
	
	initialize: function() {
	},
	/*
	Update the subscription, either unsubscribe or subscribe
	filter = '' means subscribe
	filter == this.UNSUBSCRIBE means unsubscribe;
 	*/
	updateDeviceSubscription: function(device, userId, filter) {
		
		var notif = new GlideRecord('cmn_notif_message');
		notif.addQuery('notification', this.PWD_MESSAGE);
		notif.addQuery('device', device);
		notif.addQuery('user', userId);
		notif.query();
		if (notif.next()) {
			// TODO: do the update only if filter is different than what it is already
			notif.setValue('notification_filter', filter);
			return notif.update();
		} else {
			return this.subscribeDevice(device, userId);
		}
	},
	// if there's a device for the phone and user given, return true
	deviceExistsForPhone: function(userId, phone) {
		var dev = new GlideRecord('cmn_notif_device');
		dev.addActiveQuery();
		dev.addQuery('phone_number', phone);
		dev.addQuery('user', userId);
		dev.query();
		
		if (dev.next()) {
			return dev.getValue('sys_id');
		}
		return null;
	},
	emailEntryExists: function(userId, email) {
		var dev = new GlideRecord('cmn_notif_device');
		dev.addActiveQuery();
		dev.addQuery('email_address', email);
		dev.addQuery('user', userId);
		dev.query();
		if(dev.next()){
			return dev.getValue('sys_id');
		}
		return null;
	},
	deleteDevice: function(deviceId, userId) {
		
		if (gs.nil(userId))
			return false;
		
		var dev = new GlideRecord('cmn_notif_device');
		if (dev.get(deviceId) && dev.getValue('user') == userId) {  
			// PRB1104617: Avoid triggering Notification team business rule for redirecting
			var devMsg = new GlideRecord("cmn_notif_message");
			devMsg.addQuery("device", deviceId);
			devMsg.setWorkflow(false);
			devMsg.deleteMultiple();
			
			return dev.deleteRecord();
		}
		return false;
	},
	updateProvider: function(deviceId, provider) {
		var dev = new GlideRecord('cmn_notif_device');
		if (dev.get(deviceId)) {
			dev.setValue('service_provider', provider);
			return dev.update();
		}
		return false;
	},
    updateCountryDetails: function(deviceId, countryCode, countryName) {
        var pwdDev = new GlideRecord('pwd_device');

        if (pwdDev.get(deviceId) && !gs.nil(countryCode) && !gs.nil(countryName)) {
            pwdDev.setValue('country_code', countryCode);
            pwdDev.setValue('country_name', countryName);
            return pwdDev.update();
        }
        return false;
    },
	// create an SMS device for the given info
	createDevice: function(userId, phone, provider, name) {
		var dev = new GlideRecord('cmn_notif_device');
		dev.setValue('name', name);
		dev.setValue('phone_number', phone);
		dev.setValue('service_provider', provider);
		dev.setValue('type', 'SMS');
		dev.setValue('user', userId);
		return dev.insert();
	},
	
	//create an Email device for the given info
	createEmail: function(userId, email, name){
		var dev = new GlideRecord('cmn_notif_device');
		dev.setValue('name', name);
		dev.setValue('email_address', email);
		dev.setValue('type', 'Email');
		dev.setValue('user', userId);
		return dev.insert();
	},
	
	// create an SMS device for the given info with country code
	createDeviceWithCountryCode: function(userId, phone, countryCode, countryName, name) {
		var dev = new GlideRecord('cmn_notif_device');
		dev.setValue('name', name);
		dev.setValue('phone_number', phone);
		dev.setValue('type', 'SMS');
		dev.setValue('user', userId);
		
		if (!dev.insert()) return null;
			
		// create pwd device
		var pwdDev = new GlideRecord('pwd_device');
		pwdDev.initialize();
		pwdDev.setValue('device', dev.getValue('sys_id'));
		if (!gs.nil(countryCode) && !gs.nil(countryName)) {
			pwdDev.setValue('country_code', countryCode);
			pwdDev.setValue('country_name', countryName);	
		}
		pwdDev.setValue('status', '0'); // Pwd Device model INPROGRESS status
		return pwdDev.insert();
	},
	emailExists: function(userId, email, deviceType){
		var dev = new GlideRecord('cmn_notif_device');
		dev.addQuery('user', userId);
		dev.addQuery('type', deviceType);
		dev.addQuery('email_address', email);
		//dev.addQuery('device', dev.getValue('sys_id'));
		dev.query();
		return dev.hasNext();
	},
	
	// check if device exists with provider
	deviceExists: function(userId, phone, provider, deviceType) {
		var dev = new GlideRecord('cmn_notif_device');
		dev.addQuery('user', userId);
		dev.addQuery('phone_number', phone);
		dev.addQuery('service_provider', provider);
		dev.addQuery('type', deviceType);
		dev.query();
		return dev.hasNext();
	},
	
	// check if device exists with country code
	deviceWithCountryCodeExists: function(userId, phone, countryCode, deviceType) {
		var dev = new GlideRecord('cmn_notif_device');
		dev.addQuery('user', userId);
		dev.addQuery('phone_number', phone);
		dev.addQuery('type', deviceType);
		dev.query();
		
		if (dev.next()) {
			var gr = new GlideRecord('pwd_device');
			gr.addQuery('device', dev.getValue('sys_id'));
			gr.addQuery('country_code', countryCode);
			gr.query();
			return gr.hasNext();
		}
		return false;
	},

	// returns the pwd_device record sys_id for a given user, phone and deviceType
	getExistingDeviceWithCountry: function(userId, phone, deviceType) {
	    var dev = new GlideRecord('cmn_notif_device');
	    dev.addQuery('user', userId);
	    dev.addQuery('phone_number', phone);
	    dev.addQuery('type', deviceType);
	    dev.query();

	    if (dev.next()) {
	        var gr = new GlideRecord('pwd_device');
	        gr.addQuery('device', dev.getValue('sys_id'));
	        gr.query();
	        if (gr.next())
	            return gr.getUniqueValue();
	    }
	    return null;
	},
	
	//subscribe the device to pwd notification
	subscribeDevice: function(device, userId) {
		var notif = new GlideRecord('cmn_notif_message');
		notif.initialize();
		notif.setValue('notification', this.PWD_MESSAGE);
		notif.setValue('device', device);
		notif.setValue('user', userId);
		return notif.insert();
	},
	// get the mobile phone number from users profile
	getMobileFromProfile: function(userId){
		var phone = null;
		var prof = new GlideRecord('sys_user');
		if (prof.get(userId)){
			phone = prof.getValue('mobile_phone');
		}
		return phone;
	},
	
	//get the email address from user's profile
	getEmailFromProfile: function(userId){
		var emailAddr = null;
		var prof = new GlideRecord('sys_user');
		if(prof.get(userId)){
			emailAddr = prof.getValue('email');
		}
		return emailAddr;
	},
	/*
	Does the user have a device subscribed to pwd_message?
	We enforce the user to have at least one device during enrollment.
	We have business rule to avoid user unsubscribe from notification preferences.
	So this is an double check mechanism to make sure we are still good.
	'Except' is the device id excluded from the query. It's usefull for
	checking if the device is the last subscribed device.
 	*/
	isUserSubscribed: function(userId, except) {
		var found = false;
		var grNM  = GlideRecord('cmn_notif_message');
		grNM.addActiveQuery();
		grNM.addQuery('notification', this.PWD_MESSAGE);
		grNM.addQuery('user', userId);
		grNM.addQuery('notification_filter', '');
		var qc = grNM.addJoinQuery('cmn_notif_device', 'device','sys_id');
		qc.addCondition('type', 'SMS');
		qc.addCondition('active', 'true');
		if (!gs.nil(except)) {
			qc.addCondition('sys_id', '<>', except);
		}
		
		var pwdDevice = grNM.addJoinQuery('pwd_device', 'device', 'device');
		pwdDevice.addCondition('status',1);
		
		grNM.query();
		while(grNM.next()) {
			this._log('Found at least one subscribed device.');
			found = true;
			break;
		}
		grNM.close();
		return found;
	},
	isUserSubscribedToEmail: function(userId, except){
		var found = false;
		var grNM = GlideRecord('cmn_notif_message');
		grNM.addActiveQuery();
		grNM.addQuery('notification', this.PWD_MESSAGE);
		grNM.addQuery('user', userId);
		grNM.addQuery('notification_filter', '');
		
		var qc = grNM.addJoinQuery('cmn_notif_device', 'device', 'sys_id');
		qc.addCondition('type', 'Email');
		qc.addCondition('active', 'true');
		qc.addCondition('email_address', '!=', '');
		if(!gs.nil(except)){
			qc.addCondition('sys_id', '<>', except);
		}
		
		var pwdDevice = grNM.addJoinQuery('pwd_device', 'device', 'device');
		pwdDevice.addCondition('status',1);
		
		grNM.query();
		while(grNM.next()){
			this._log('Found at least one subscribed device.');
			found = true;
			break;
		}
		grNM.close();
		return found;
	},
	isDeviceSubscribed: function(userId, deviceId) {
		var grNM  = GlideRecord('cmn_notif_message');
		grNM.addActiveQuery();
		grNM.addQuery('notification', this.PWD_MESSAGE);
		grNM.addQuery('user', userId);
		grNM.addQuery('notification_filter', '');
		grNM.addQuery('device', deviceId);
		grNM.query();
		if (grNM.next()) {
			return true;
		}
		return false;
	},
	getEmailVerificationMode: function(userId, requestId) {

		if(userId == null)
			return;
		
		var trackingManager = new SNC.PwdTrackingManager();
		var isRequestInvalid = trackingManager.isRequestInvalid(requestId);
		
		if(this.isUserSubscribedToEmail(userId)){
			return 'subscription';
		}
		else if(this.getEmailFromProfile(userId) || isRequestInvalid){
			return 'notEnrolled';
		}
		
		return;
	},
	getSMSCodeVerificationMode : function(userId, requestId) {
		if(userId == null)
			return;
		
		var trackingManager = new SNC.PwdTrackingManager();
		var isRequestInvalid = trackingManager.isRequestInvalid(requestId);
		
		if(this.isUserSubscribed(userId)){
			return 'subscription';
		}
		else if(this.getMobileFromProfile(userId) || isRequestInvalid){
			return 'mobile';
		}
		
		return;
	},
	/* Return the list of emails.  */
	getSubscribedEmailIds: function(userId, mask, requestId) {
		var emailAddresses = [];
		var emailAddress = new PwdDeviceHelper().getDevicesOrEmailAddresses(userId, requestId, 'Email');
		var mode = this.getEmailVerificationMode(userId, requestId);
		if (mode == 'subscription') {
			var gr = new GlideRecord('cmn_notif_device');
			gr.addQuery('user', userId);
			gr.addQuery('type', 'Email');
			gr.addQuery('email_address', '!=', '');
			gr.orderBy('name');
			gr.addActiveQuery();
			gr.query();
			while (gr.next()) {
				var isSubscribed = false;

				var grPD = GlideRecord('cmn_notif_message');
				grPD.addQuery('device', gr.getValue('sys_id'));
				grPD.addQuery('notification_filter', '');
				grPD.addActiveQuery();
				grPD.query();
				if(grPD.next()){
					isSubscribed = true;
				}

				var email = gr.getValue('email_address');
				if (mask) {
					email = PwdMaskHelper.maskEmail(email);
				}

				var isVerified = false;
				var deviceGr = GlideRecord('pwd_device');
				deviceGr.addQuery('device', gr.getUniqueValue());
				deviceGr.query();
				if (deviceGr.next()) {
					isVerified = deviceGr.status == 1 ? true : false;
				}
				if(isVerified == true && isSubscribed == true) {
					emailAddresses.push(email);
				}
			}
		}  else if ( mode == 'notEnrolled'){
			emailAddresses.push(PwdMaskHelper.maskEmail(emailAddress));
		}
		return emailAddresses;
	},
	
	getSubscribedMobileDevices: function (userId, mask, requestId) {
		var devices = [];
		var device = new PwdDeviceHelper().getDevicesOrEmailAddresses(userId, requestId, 'SMS');
		var mode = this.getSMSCodeVerificationMode(userId, requestId);
		if( mode == 'mobile') {
			devices.push({ 'device' : PwdMaskHelper.maskPhone(device)});
		} else if( mode == 'subscription') {
			var gr = new GlideRecord('cmn_notif_device');
			gr.addActiveQuery();
			gr.addQuery('user', userId);
			gr.addQuery('type', 'SMS');
			gr.orderBy('name');
			gr.query();
			while (gr.next()) {
				var isSubscribed = false;
				var grNM  = GlideRecord('cmn_notif_message');
				grNM.addQuery('device', gr.getValue('sys_id'));
				grNM.addQuery('notification_filter', '');
				grNM.addActiveQuery();
				grNM.query();
				
				while (grNM.next()) {
					var notification = grNM.getValue('notification');
				
					if (notification == this.PWD_MESSAGE)
						isSubscribed = true;
				}
				
				var phoneNumber = gr.getValue('phone_number');
				if (mask) {
					phoneNumber = PwdMaskHelper.maskPhone(phoneNumber);
				}
				var provider = '';
				var provGr = new GlideRecord("cmn_notif_service_provider");
				if (provGr.get(gr.getValue("service_provider"))) {
					provider = provGr.getValue('name');
				}
				
				var isVerified = false;
				var deviceGr = GlideRecord('pwd_device');
				deviceGr.addQuery('device', gr.getUniqueValue());
				deviceGr.query();
				if (deviceGr.next()) {
					isVerified = deviceGr.status == 1 ? true : false;
				}
				
				if(isVerified == true && isSubscribed == true)
					devices.push({'device' : phoneNumber , 'provider' : provider});
			}
		}
		return devices;
	},
	prepareMessageFromResponseCode : function(responseCode, verificationId, devices, inboundId, providerId) {
		var message = '';
		if (responseCode == this.SUCCESS_RESPONSE) {
			var expiryDuration = new SNC.PwdSMSManager().getExpiryByVerificationId(verificationId);
			message = gs.getMessage('Ok, the code was sent to -\n {0}' , [devices]);
			message = gs.getMessage('{0}\nThe code will be valid for {1} minutes', [message, expiryDuration]);
			message = this._getCustomOrDefaultMsg("sms_code_sent_success_msg", inboundId, providerId, message, [devices, expiryDuration]);
			
		} else {
			switch (responseCode) {
				case this.PER_DAY_LIMIT_RESPONSE:
					var per_day_limit = this.getVerificationConfig(verificationId, "max_per_day", "password_reset.sms.max_per_day");
					message = gs.getMessage('Can\'t send more than {0} verification codes in a day', per_day_limit);
					message = this._getCustomOrDefaultMsg("sms_day_limit_reached_msg", inboundId, providerId, message, [per_day_limit]) ;
					break;
					
				case this.PAUSE_WINDOW_RESPONSE:
					var pause_window = this.getVerificationConfig(verificationId, "pause_window", "password_reset.sms.pause_window");
					message = gs.getMessage('You can send a new verification code after {0} minutes', pause_window);
					message = this._getCustomOrDefaultMsg("sms_pause_window_msg", inboundId, providerId, message, [pause_window]) ;
					break;
					
				case this.INVALID_REQUEST_RESPONSE:
					message = gs.getMessage('Your request is no longer valid. Try again!');
					message = this._getCustomOrDefaultMsg("sms_invalid_request_msg", inboundId, providerId, message, []) ;
					break;
					
				case this.INVALID_PHONE_NUMBER:
					message = gs.getMessage('I was unable to deliver the code via SMS text. The number is not a valid phone number');
					message = this._getCustomOrDefaultMsg("sms_invalid_phone_number_msg", inboundId, providerId, message, []) ;
					break;
					
				default:
					message = gs.getMessage('I was not able to generate code, try again!');
					message = this._getCustomOrDefaultMsg("sms_default_code_generation_error_msg", inboundId, providerId, message, []) ;
			}
		}
		return message;
	},
	
	_getCustomOrDefaultMsg : function(messageKey, inboundId, providerId, defaultMsg, messageArgs) {
		if (gs.nil(inboundId) || gs.nil(messageKey))
			return defaultMsg;
		
		var customMessage = sn_cs.VASystemObject.getBotMessage(messageKey, inboundId, providerId);
		return gs.nil(customMessage) ? defaultMsg : gs.getMessage(customMessage, messageArgs);
	}, 
	
	getVerificationConfig : function(verificationId, verificationParam, property) {
		var value = new SNC.PwdVerificationManager().getVerificationParamValue(verificationId, verificationParam);
		if (value == null) {
			value = GlideProperties.get(property,'0');
		}
		return value;
	},
	
	isAutoEnrol : function (verificationId) {
		return new SNC.PwdVerification(verificationId).isAutoEnroll();
	},
	type: 'PwdNotificationHelper'
};
