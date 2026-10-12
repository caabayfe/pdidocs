var PwdUserEnrollmentServiceForEmail = Class.create();
PwdUserEnrollmentServiceForEmail.prototype = {
    initialize: function() {
        this.helper = new PwdNotificationHelper();
    },

    // return details of a users subscription, subscription mode
    // or email address from his/her profile, notEnrolled mode
    getEmailDetails: function(requestId) {
        var LOG_ID = "[PwdUserEnrollmentServiceForEmail.getVerificationInfo] ";
        var userId = gs.getSession().getProperty('sysparm_sys_user_id');
        var result = {
            hasError: true,
            message: gs.getMessage("Unknown situation"),
        };
        result.email_addr = new PwdDeviceHelper().getDevicesOrEmailAddresses(userId, requestId, 'Email');
        result.userSubscribed = this.helper.isUserSubscribedToEmail(userId);
        if (result.userSubscribed) {
            result.mode = 'subscription';
            result.emailList = this.getEmailList(userId, true);
            result.message = "";
            result.hasError = false;
        } else if (result.email_addr != null) {
            result.mode = 'notEnrolled';
            result.name = 'Email from User Profile';
            result.email = PwdMaskHelper.maskEmail(result.email_addr);
            result.message = "";
            result.hasError = false;
        } else {
            gs.log(LOG_ID + ' UNKNOWN MODE: Not Subscribed, No email in profile, yet on verification page.');
            result.mode = 'unknown';
        }
        return result;
    },

    /* Return all the Emails and their current state for the user. */
    getEmailList: function(userId, maskEmailAddr) {
        var emailList = [];
        var userGr = new GlideRecord('sys_user');
        userGr.get(userId);
        var userProfEmail = userGr.getValue('email');

        var gr = new GlideRecord('cmn_notif_device');
        gr.addActiveQuery();
        gr.addQuery('user', userId);
        gr.addQuery('type', 'Email');
        gr.addQuery('email_address', '!=', '');
        gr.orderBy('name');
        gr.query();
        while (gr.next()) {
            var isSubscribed = false;
            var grPD = GlideRecord('cmn_notif_message');
            grPD.addQuery('device', gr.getValue('sys_id'));
            grPD.addQuery('notification_filter', '');
            grPD.addActiveQuery();
            grPD.query();
            if (grPD.next()) {
                isSubscribed = true;
            }

            var email_addr = gr.getValue('email_address');
            if (maskEmailAddr) {
                email_addr = PwdMaskHelper.maskEmail(email_addr);
            }
            var emailObj = {};
            emailObj.name = gr.getValue('name');
            emailObj.email = email_addr;
            emailObj.isSubscribed = isSubscribed;
            emailObj.sys_id = gr.getValue('sys_id');

            // check if email is verified
            emailObj.isVerified = false;
            var dvc = GlideRecord('pwd_device');
            dvc.addQuery('device', gr.getUniqueValue());
            dvc.query();
            if (dvc.next()) {
                emailObj.isVerified = (dvc.status == 1) ? true : false;
                dvc.update();
            }
            emailObj.isUserProfileEmail = false;
            if (email_addr == userProfEmail)
                emailObj.isUserProfileEmail = true;
            emailList.push(emailObj);
        }
        return emailList;
    },
	
    /*
      Generate and send reset code for Email type
      Code would be sent to enrolled devices for subscription mode
      or profile device for notEnrolled mode
    */
    generateCode: function(requestId, verificationId, mode) {
        var LOG_ID = "[PwdUserEnrollmentServiceForEmail.generateCode] ";
        if (gs.nil(mode) || (mode != "subscription" && mode != "notEnrolled")) {
            gs.log(LOG_ID + 'Unknown mode!');
            return PwdConstants.GENERIC_FAIL_RESPONSE;
        }
        return new PwdEmailNotificationManager().sendResetCode(requestId, verificationId, mode);
    },

    type: 'PwdUserEnrollmentServiceForEmail'
};
