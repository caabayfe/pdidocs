var PwdSMSNotificationManager = Class.create();
PwdSMSNotificationManager.prototype = Object.extendsObject(PwdNotificationManager, {

    TYPE: "SMS",
    NotEnrolled: "mobile",
    INVALID_PHONE_NUMBER: -4,

    initialize: function() {
        this.useNotifyPlugin = new PasswordResetUtil().useNotifyInPasswordReset();
    },

    /* 
      Send reset code to enrolled devices or devices from user profile
      @param requestId
      @param verificationId
      @param mode: subscription or mobile
      @param providerId: optional
    */
    sendResetCode: function(requestId, verificationId, mode, providerId, countryCode, countryName) {
        var response = this.GENERIC_FAIL_RESPONSE;

        try {
            var isRequestInvalid = new SNC.PwdTrackingManager().isRequestInvalid(requestId);
            if (isRequestInvalid) {
              return this.SUCCESS_RESPONSE;
            }
            response = this.pwdNotifMgr.generateSMSCode(requestId, verificationId);
            if (this._doesResponseContainCode(response)) {
                var userSysId = this._getUserId(requestId);
                response = this._sendCodeToNotificationDevices(userSysId, mode, providerId, response, countryCode, countryName);
            }
        } catch (err) {
            return err;
        }

        return response > 0 ? 1 : response;
    }, 

    /*
    Send SMS Code to specified user for given Password Reset Request Id OR a context id
    @requestId : Password Reset Request or ContextId
    @verificationId : Verification Id
    @mode : enrollment mode
    @providerId :SMS service Provider Id
    @userSysId: User Sys Id
    */
    sendResetCodeToUser: function(requestId, verificationId, mode, providerId, userSysId) {
        var response = this.GENERIC_FAIL_RESPONSE;

        try {
            response = this.pwdNotifMgr.generateSMSCodeForUser(requestId, verificationId, userSysId);

            if (this._doesResponseContainCode(response)) {
				response = this._sendCodeToNotificationDevices(userSysId, mode, providerId, response);
            }
        } catch (err) {
            return err;
        }

        return response > 0 ? 1 : response;
    },
    
    _doesResponseContainCode: function(response) {
    	var FAILURE = 0;
		return response > FAILURE;
	},   

    /* 
	  Verify reset code
	  @param requestId
	  @param verificationId
      @param code
	*/
    verifyResetCode: function(requestId, verificationId, code) {
        return this.pwdNotifMgr.verifySMSCode(requestId, verificationId, code);
    },

    _sendCodeToNotificationDevices: function(userSysId, mode, providerId, code, countryCode, countryName) {
		var responseCode = this.SUCCESS_RESPONSE;
        var devices = this._collectDevicesAddress(userSysId, mode, providerId, countryCode, countryName);
        if (devices.length == 0)
            responseCode = this.GENERIC_FAIL_RESPONSE;

        this._sendCodeToDevices(devices, code, userSysId);
		return responseCode;
    },

    // @Override
    _getDeviceAddr: function(notifDevGr) {
        if (this.useNotifyPlugin)
            return this._getPhoneNumber(notifDevGr);
        else
            return notifDevGr.getValue("email_address"); // SMS address is constructed as email_address: 1234567@txt.att.net
    },

    // @Override
    // Take the mobile phone number from profile as it is
    _getDeviceAddrFromProfile: function(userId, providerId, countryCode, countryName) {
        var phone = this.pwdNotifHelper.getMobileFromProfile(userId);
        if (phone == null)
            return null;
        // remove non digits but keep plus if there is one for it could be an international format
        phone = String(phone).replace(/[^0-9+]/g, '');
        var deviceId;
        if (this.useNotifyPlugin) {
            deviceId = this.pwdNotifHelper.getExistingDeviceWithCountry(userId, phone, this.TYPE);
            if (gs.nil(deviceId))
                deviceId = this.pwdNotifHelper.createDeviceWithCountryCode(userId, phone, countryCode, countryName, 'Mobile from User profile');
	    else if (!gs.nil(countryCode) && !gs.nil(countryName) && !this.pwdNotifHelper.updateCountryDetails(deviceId, countryCode, countryName))
                return null;
            deviceId = this._getNotifDeviceIdFromPwdDeviceId(deviceId);
        } else {
            deviceId = this.pwdNotifHelper.deviceExistsForPhone(userId, phone);
            if (gs.nil(deviceId))
                deviceId = this.pwdNotifHelper.createDevice(userId, phone, providerId, 'Mobile from User profile');
            else if (!this.pwdNotifHelper.updateProvider(deviceId, providerId))
                return null;
        }
        var notifDevGr = new GlideRecord("cmn_notif_device");
        notifDevGr.get(deviceId);

        return this._getDeviceAddr(notifDevGr);
    },

    _getNotifDeviceIdFromPwdDeviceId: function(deviceId) {
        var gr = new GlideRecord("pwd_device");
        if (gr.get(deviceId))
            return gr.getValue("device");
        return null;
    },

    // @Override
    _sendCodeToDevices: function(devices, code, userSysId) {
        if (this.useNotifyPlugin)
            this._sendSMSCodeViaNotifyPlugin(devices, code);
        else {
            var parm1 = devices.join(",");

            // DEF0063745: Need to pass notification_type
            parm1 = "SMS," + parm1;

            // PRB1263734: Use cmn_notif_device as the target record to check ACL
            var deviceGr = this._getDeviceGr(userSysId);

            gs.eventQueue(this.PWD_CODE_EVENT, deviceGr, parm1, code);
        }
    },

    _getPhoneNumber: function(notifDevGr) {
        var phoneNumber = notifDevGr.getValue("phone_number");
        var grPwdDevice = new GlideRecord('pwd_device');
        grPwdDevice.addQuery('device', notifDevGr.sys_id);
        grPwdDevice.query();

        if (grPwdDevice.next()) {
            var code = grPwdDevice.getValue('country_code');
            if (!gs.nil(code))
                return phoneNumber.startsWith(code) ? phoneNumber : code + phoneNumber;
        }

        //get the e.164 compliant phone number using the user's territory
        var e164CompliantObj = this.getE164CompliantPhoneNumber(phoneNumber);
        if (e164CompliantObj && typeof e164CompliantObj === 'object')
            return e164CompliantObj.getValue();
        throw this.INVALID_PHONE_NUMBER;
    },

    _sendSMSCodeViaNotifyPlugin: function(phoneNumbers, code) {
        var notify = new SNC.Notify();
        var notifyPhoneNumbers = notify.getPhoneNumbers();
        if (notifyPhoneNumbers == null || notifyPhoneNumbers.size() == 0)
            return;

        var notifyPhoneNumber = notifyPhoneNumbers.get(0);
        phoneNumbers.forEach(function(phoneNumber) {
            notify.sendSMS(notifyPhoneNumber, phoneNumber,
                gs.getMessage('Password reset verification code: {0}', code));
        });
    },

    getE164CompliantPhoneNumber: function(phoneNumber) {
        var gePhoneNumber = new GlideElementPhoneNumber();
        var test = gePhoneNumber.setPhoneNumber(phoneNumber, true);
        if (gePhoneNumber.setPhoneNumber(phoneNumber, true)) {
            return gePhoneNumber;
        }
        return null;
    },

    type: 'PwdSMSNotificationManager'
});
