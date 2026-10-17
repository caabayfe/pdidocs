var PwdUserEnrollmentServiceForSMS = Class.create();
PwdUserEnrollmentServiceForSMS.prototype = {
    GENERIC_FAIL_RESPONSE: 0,
    PWD_MESSAGE: '7cd0c421bf200100710071a7bf0739bd',
    initialize: function() {
        this.helper = new PwdNotificationHelper();
    },

    getSMSDetails: function(requestId) {
        var LOG_ID = "[PwdUserEnrollmentServiceForSMS.getVerificationInfo] ";
        var userId = gs.getSession().getProperty('sysparm_sys_user_id');
        var response = {
            hasError: true,
            message: gs.getMessage("Unknown situation"),
        };
        var sysPhone = new PwdDeviceHelper().getDevicesOrEmailAddresses(userId, requestId, 'SMS');
        if (this.helper.isUserSubscribed(userId)) {
            response.mode = 'subscription';
            response.deviceList = this.getDeviceList(userId, true);
            response.message = "";
            response.hasError = false;
        }
        // check if a mobile number exists in the system
        else if (sysPhone != null) {
            response.mode = "mobile";
            var isUsingNotify = new PasswordResetUtil().useNotifyInPasswordReset();
            response.isUsingNotify = isUsingNotify;
            if (isUsingNotify) {
                var isPhoneNumberE164Compliant = new PwdSMSNotificationManager().isPhoneNumberE164Compliant(sysPhone);
                response.isPhoneNumberE164Compliant = isPhoneNumberE164Compliant;
                if (!isPhoneNumberE164Compliant)
                    response.countryList = new global.PwdVAEnrollmentManager().getCountryCodes();
            } else
                response.providerList = this._getProvidersList();
            response.name = 'Mobile from User Profile';
            response.phone = PwdMaskHelper.maskPhone(sysPhone);
            response.message = "";
            response.hasError = false;
        } else {
            gs.log(LOG_ID + ' UNKNOWN MODE: Not Subscribed, No phone in profile, yet on verification page.');
            response.mode = 'unknown';
        }
        return response;
    },

    getDevices: function(userId) {
        var LOG_ID = "[PwdUserEnrollmentServiceForSMS.getDevices] ";
        if (!this._isAuthorizedToAccess(userId)) {
            return null;
        }
        gs.log(LOG_ID + ' userid:' + userId + ' ');
        return this.getDeviceList(userId, false);
    },

    getProviders: function() {
        return this._getProvidersList();
    },

    _getProvidersList: function() {
        var providerList = [];
        var gr = new GlideRecord('cmn_notif_service_provider');
        gr.addActiveQuery();
        gr.addQuery('type', 'SMS');
        gr.orderBy('name');
        gr.query();
        while (gr.next()) {
            var provider = {};
            provider.name = gr.getValue('name');
            provider.sys_id = gr.getValue('sys_id');
            providerList.push(provider);
        }
        return providerList;
    },

    getDeviceList: function(userId, maskPhoneNumber) {
        var LOG_ID = "[PwdUserEnrollmentServiceForSMS.getDeviceList] ";
        var deviceList = [];
        var gr = new GlideRecord('cmn_notif_device');
        gr.addActiveQuery();
        gr.addQuery('user', userId);
        gr.addQuery('type', 'SMS');
        gr.orderBy('name');
        gr.query();
        while (gr.next()) {
            var isSubscribed = false;
            var grNM = GlideRecord('cmn_notif_message');
            grNM.addQuery('device', gr.getValue('sys_id'));
            grNM.addActiveQuery();
            grNM.query();
            while (grNM.next()) {
                var filter = grNM.getValue('notification_filter'); // unsubscribe = c1bfa4040a0a0b8b001eeb0f3f5ee961
                var notif = grNM.getValue('notification');

                // subscribed, Good goto go
                if (filter == null && notif == this.PWD_MESSAGE)
                    isSubscribed = true;
            }
            var phone_number = gr.getValue('phone_number');
            if (maskPhoneNumber) {
                phone_number = PwdMaskHelper.maskPhone(phone_number);
            }
            var device = {};
            device.name = gr.getValue('name');
            device.phone = phone_number;
            device.isSubscribed = isSubscribed;
            device.sys_id = gr.getValue('sys_id');


            // add provider name.
            var prov = new GlideRecord("cmn_notif_service_provider");
            if (prov.get(gr.getValue("service_provider"))) {
                device.provider = prov.getValue('name');
            }

            device.isVerified = false;
            var dvc = GlideRecord('pwd_device');
            dvc.addQuery('device', gr.getUniqueValue());
            dvc.query();
            if (dvc.next()) {
                device.isVerified = (dvc.status == 1) ? true : false;
                //set default country code if does no exists
                if (!dvc.country_name) {
                    dvc.setValue('country_name', 'United States');
                }
                if (!dvc.country_code) {
                    dvc.setValue('country_code', '+1');
                }
                dvc.update();
                device.countryCode = dvc.country_code;
                device.countryName = dvc.country_name;
            }
            deviceList.push(device);
        }
        return deviceList;
    },

    generateCode: function(requestId, verificationId, mode, providerId, countryCode, countryName) {
        var LOG_ID = "[PwdUserEnrollmentServiceForSMS.generateCode] ";
        var response;
        if (mode != "subscription" && mode != "mobile") {
            gs.log(LOG_ID + 'Unknown mode!');
            return this.GENERIC_FAIL_RESPONSE;
        }
        return new PwdSMSNotificationManager().sendResetCode(requestId, verificationId, mode, providerId, countryCode, countryName);
    },

    _isAuthorizedToAccess: function(userId) {
        if (userId == gs.getUserID())
            return true;
        return false;
    },

    type: 'PwdUserEnrollmentServiceForSMS'
};
