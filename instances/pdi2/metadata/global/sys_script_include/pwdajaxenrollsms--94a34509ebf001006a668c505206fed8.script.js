var PwdAjaxEnrollSMS = Class.create();
PwdAjaxEnrollSMS.prototype = Object.extendsObject(PwdAjaxRequestProcessor, {
    UNSUBSCRIBE: 'c1bfa4040a0a0b8b001eeb0f3f5ee961', // notification_filter
    initialize: function(request, responseXML, gc) {
        this.request = request;
        this.responseXML = responseXML;
        this.gc = gc;
        this.helper = new PwdNotificationHelper();
        this.userEnrollmentServiceForSMS = new PwdUserEnrollmentServiceForSMS();
    },

    // return details of a users subscription
    // or mobile from his/her profile
    // PRB1116787: this is designed as a public function which returns masked info and thus no need to authorize
    getVerificationInfo: function() {
        var requestId = this.getParameter("sysparm_request_id");
        var response = this.userEnrollmentServiceForSMS.getSMSDetails(requestId);
        if (response.mode === 'subscription') {
            var mode = this.newItem("mode");
            mode.setAttribute("name", 'subscription');
            this._prepDevices(response.deviceList);
            this._setResponseMessage("success", "", "true");
        }
        // check if a mobile number exists in the system
        else if (response.mode === 'mobile') {
            mode = this.newItem("mode");
            mode.setAttribute("name", 'mobile');
            if (!new PasswordResetUtil().useNotifyInPasswordReset())
                this._prepProviders(response.providerList);

            var dev = this.newItem("device");
            dev.setAttribute("name", response.name);
            dev.setAttribute("phone", response.phone);
            this._setResponseMessage("success", "", "true");
        } else {
            mode = this.newItem("mode");
            mode.setAttribute("name", 'unknown');
            this._setResponseMessage("fail", gs.getMessage("Unknown situation"), "");
        }
    },
    /* Return all the devices and their current state for the user. */
    getDevices: function() {
        var userId = this.getParameter("sysparm_user_id");
        var deviceList = this.userEnrollmentServiceForSMS.getDevices(userId);
        if (!deviceList) {
            this._handleUnauthorizedAction();
            return;
        }
        this._setResponseMessage("success", "", "true");
        this._prepDevices(deviceList);
    },

    getProviders: function() {
        var providerList = this.userEnrollmentServiceForSMS.getProviders();
        this._prepProviders(providerList);
        this._setResponseMessage("success", "", "true");
    },

    getCountryCodes: function() {
        this._preCountryCodes();
        this._setResponseMessage("success", "", "true");
    },

    _preCountryCodes: function() {
        var list = PwdCountryCode.CountryCodeList;
        for (var i = 0; i < list.length; i++) {
            var dev = this.newItem("country");
            dev.setAttribute("name", list[i].name);
            dev.setAttribute("code", list[i].code);
        }
    },

    deleteDevice: function() {
        var deviceId = this.getParameter("sysparm_device_id");
        var userId = this.getParameter("sysparm_user_id");
        var verificationId = this.getParameter("sysparm_verification_id");

        if (!this._isAuthorizedToAccess(userId)) {
            return;
        }

        if (this.helper.deleteDevice(deviceId, userId)) {
            this._setResponseMessage("success", gs.getMessage("Successfully deleted device"), "true");

            // check if user still has active SMS enrollment if not then disable pwd_enrollment record
            if (verificationId) {
                var isEnrolled = new SNC.PwdEnrollmentManager().isUserEnrolledByVerificationId(userId, verificationId);

                if (!isEnrolled)
                    new global.PwdEnrollmentManager()._updateEnrollmentRecord(userId, verificationId, PwdConstants.ENROLLMENT_INACTIVE_STATUS);
            }

        } else {
            this._setResponseMessage("fail", gs.getMessage("Could not delete device"), "false");
        }

        this._prepDevices(this.userEnrollmentServiceForSMS.getDeviceList(userId, false));
    },
    _prepProviders: function(providerList) {
        var self = this;
        providerList.forEach(function(provider) {
            var dev = self.newItem("provider");
            dev.setAttribute("name", provider.name);
            dev.setAttribute("sys_id", provider.sys_id);
        });
    },

    /*	Add the device and subscribe it.Return the info of the new device and subscription    */
    addDevice: function() {
        var LOG_ID = "[PwdAjaxEnrollSMS.addDevice] ";
        var userId = this.getParameter("sysparm_user_id");

        if (!this._isAuthorizedToAccess(userId)) {
            return;
        }

        var phone = this.getParameter("sysparm_phone_number");
        var name = this.getParameter("sysparm_device_name");

        // notification platform does not like nondigits while sending
        phone = String(phone);
        phone = phone.replace(/\D/g, '');


        var useNotify = new PasswordResetUtil().useNotifyInPasswordReset();
        if (useNotify) {
            var countryCode = this.getParameter('sysparm_country_code');
            var countryName = this.getParameter('sysparm_country_name');
            gs.log(LOG_ID + ' userid:' + userId + ' phone:' + phone + ' name:' + name + ' ' + String(phone) + ' country code: ' + countryCode);
            this._addDeviceWithCountryCode(userId, phone, name, countryCode, countryName);
        } else {
            var provider = this.getParameter("sysparm_service_provider");
            gs.log(LOG_ID + ' userid:' + userId + ' phone:' + phone + ' name:' + name + ' ' + String(phone) + ' provider: ' + provider);
            this._addDeviceWithProvider(userId, phone, name, provider);
        }
        var deviceList = this.userEnrollmentServiceForSMS.getDeviceList(userId, false);
        this._prepDevices(deviceList);
    },

    _addDeviceWithProvider: function(userId, phone, name, provider) {
        var LOG_ID = "[PwdAjaxEnrollSMS.addDevice] ";
        if (this.helper.deviceExists(userId, phone, provider, 'SMS')) {
            gs.log(LOG_ID + ' device already exists.');
            this._setResponseMessage("fail", gs.getMessage("Device already exists: {0}", phone), "false");
            return;
        }

        var newDev = this.helper.createDevice(userId, phone, provider, name);
        if (newDev == null) {
            this._setResponseMessage("fail", gs.getMessage("Could not add device: {0}", phone), "false");
        } else {
            this._setResponseMessage("success", gs.getMessage("Added the device. Click Verify to send a code to the device so you can authorize it.", name), "true");
        }
    },
    _addDeviceWithCountryCode: function(userId, phone, name, countryCode, countryName) {
        var LOG_ID = "[PwdAjaxEnrollSMS.addDevice] ";
        if (this.helper.deviceWithCountryCodeExists(userId, phone, countryCode, 'SMS')) {
            gs.log(LOG_ID + ' device already exists.');
            this._setResponseMessage("fail", gs.getMessage("Device already exists: ({0}) {1}", [countryCode, phone]), "false");
            return;
        }

        var newDev = this.helper.createDeviceWithCountryCode(userId, phone, countryCode, countryName, name);
        if (newDev == null) {
            this._setResponseMessage("fail", gs.getMessage("Could not add device: ({0}) {1}", [countryCode, phone]), "false");
        } else {
            this._setResponseMessage("success", gs.getMessage("Added the device. Click Verify to send a code to the device so you can authorize it.", name), "true");
        }
    },

    /* Update subscription of the device. */
    updateDeviceSubscription: function() {
        var LOG_ID = "[PwdAjaxEnrollSMS.updateDeviceSubscription] ";
        var userId = this.getParameter("sysparm_user_id");
        var verificationId = this.getParameter("sysparm_verification_id");

        if (!this._isAuthorizedToAccess(userId)) {
            return;
        }

        var device = this.getParameter("sysparm_device_id");
        var deviceName = GlideStringUtil.escapeHTML(this.getParameter("sysparm_device_name"));
        var subs = this.getParameter("sysparm_subscribed");
        var filter = (subs == '') ? this.UNSUBSCRIBE : '';

        gs.log(LOG_ID + ' update:' + update + ' subscribed:' + subs + '--filter:' + filter);

        var update = this.helper.updateDeviceSubscription(device, userId, filter);
        if (update == null) {
            if (filter == '')
                this._setResponseMessage("fail", gs.getMessage("Could not authorize device: {0}", deviceName), device);
            else
                this._setResponseMessage("fail", gs.getMessage("Could not unauthorize device: {0}", deviceName), device);
        } else {
            if (filter == '') {
                this._setResponseMessage("success", gs.getMessage("Device {0} has been authorized successfully", deviceName), device);
                if (verificationId)
                    new global.PwdEnrollmentManager()._updateEnrollmentRecord(userId, verificationId, PwdConstants.ENROLLMENT_ACTIVE_STATUS);
            } else {
                this._setResponseMessage("success", gs.getMessage("Device {0} has been unauthorized successfully", deviceName), device);
                // check if user still has active SMS enrollment if not then disable pwd_enrollment record
                if (verificationId) {
                    var isEnrolled = new SNC.PwdEnrollmentManager().isUserEnrolledByVerificationId(userId, verificationId);
                    if (!isEnrolled)
                        new global.PwdEnrollmentManager()._updateEnrollmentRecord(userId, verificationId, PwdConstants.ENROLLMENT_INACTIVE_STATUS);
                }
            }
        }
    },

    /* Return the list of devices..  */
    _prepDevices: function(deviceList) {
		var LOG_ID = "[PwdAjaxEnrollSMS.prepDevices] ";
        if (!Array.isArray(deviceList)) {
            gs.log(LOG_ID + "deviceList is not an array");
            return;
        }
        var self = this;
        deviceList.forEach(function(device) {
            var dev = self.newItem("device");
            dev.setAttribute("name", device.name);
            dev.setAttribute("phone", device.phone);
            dev.setAttribute("isSubscribed", device.isSubscribed);
            dev.setAttribute("sys_id", device.sys_id);
            dev.setAttribute("isVerified", device.isVerified);
            dev.setAttribute('countryCode', device.countryCode);
            dev.setAttribute('countryName', device.countryName);
            if (device.hasOwnProperty("provider"))
                dev.setAttribute("provider", device.provider);
        });
    },

    _handleUnauthorizedAction: function() {
        this._setResponseMessage("fail", gs.getMessage("You are not authorized to perform that action"), "");
    },

    _isAuthorizedToAccess: function(userId) {
        if (userId == gs.getUserID())
            return true;
        this._handleUnauthorizedAction();
        return false;
    },

    type: 'PwdAjaxEnrollSMS'
});
