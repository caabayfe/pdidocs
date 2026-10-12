var SoftPINExpirationSNC = Class.create();
SoftPINExpirationSNC.prototype = {
    OOB_SOFTPIN_VERIFICATION_TYPE_SYS_ID: 'a67585845302011017c3ddeeff7b1267',
    OOB_SCHEDULED_JOB_SYS_ID: '4800847c530db1109de5ddeeff7b1216',
    EXPIRATION: 'softpin_expiration_date',
    EXPIRATION_REMINDER_EVENT: 'pwd.softpin.expiration.reminder',
    PWD_SOFTPIN: 'pwd_softpin',
    PWD_MAP_PROC_TO_VERIFICATION: 'pwd_map_proc_to_verification',
    SCHEDULED_JOB_TABLE: "sysauto",
    VERIFICATION: 'pwd_verification',
    ACTIVE: 'active',
    PWD_ENROLLMENT_FORM_URL_PATH: "/$pwd_enrollment_form_container.do",
    INACTIVE_ENROLLMENT_STATUS: 2,
    INACTIVE_ENROLLMENT_SNAPSHOT_STATUS: 2,
    isExpirationReminderEnabled: false,
    isPinExpirationEnabled: new SNC.PwdSoftPINManager().isPinExpirationEnabled(),
    pwdSoftPINManager: new SNC.PwdSoftPINManager(),

    initialize: function() {},

    // expire all the softPIN whose expiration time is less than current time
    manageSoftPINs: function() {
        var activeSoftPINCount = this._getActiveSoftPINCount();
        if (this.isPinExpirationEnabled && activeSoftPINCount != 0) {
            this.isExpirationReminderEnabled = this.pwdSoftPINManager.isPinExpirationReminderEnabled();
            this._managePinExpirationAndReminder();
        }
    },

    _managePinExpirationAndReminder: function() {
        var expirationWarnDays = 10;
        var usersUsingSoftPin = {
            isAllUsers: false,
            groupUsers: {}
        };
        if (this.isExpirationReminderEnabled) {
            expirationWarnDays = this.pwdSoftPINManager.getExpirationReminderWarnDays();
            usersUsingSoftPin = this._getAllUsersUsingSoftPin();
        }
        var isUsersUsingSoftPIN = usersUsingSoftPin.isAllUsers || Object.keys(usersUsingSoftPin.groupUsers).length != 0;

        var softPinGr = new GlideRecord(this.PWD_SOFTPIN);
        softPinGr.addActiveQuery();
        softPinGr.orderBy(this.EXPIRATION);
        softPinGr.query();

        while (softPinGr.next()) {
            var expirationDate = softPinGr.getValue(this.EXPIRATION);
            if (!gs.nil(expirationDate)) {
                var expirationInfo = this._getExpirationInfo(expirationDate);
                // If PIN Expired then mark it as inactive and update 
                // Else if reminder enabled and dayLeftForPinExpiration is less than equal to warnDays,
                // ---- Send the reminder if user using the PIN
                // Else break the loop, we don't need to expire and send the reminder as we have sorted on the basis of Expiration time
                if (expirationInfo.isExpired) {
                    this._expireSoftPIN(softPinGr);
                } else if (isUsersUsingSoftPIN && expirationInfo.dayLeftForPinExpiration <= expirationWarnDays) {
                    this._sendReminder(usersUsingSoftPin, softPinGr, expirationInfo.dayLeftForPinExpiration);
                } else {
                    break;
                }
            } else {
                softPinGr.setValue(this.EXPIRATION, this._getExpiration());
                softPinGr.update();
            }
        }
    },

    _getActiveSoftPINCount: function() {
        var count = 0;
        var softpinGa = new GlideAggregate(this.PWD_SOFTPIN);
        softpinGa.addAggregate('COUNT');
        softpinGa.addActiveQuery();
        softpinGa.query();
        if (softpinGa.next()) {
            count = parseInt(softpinGa.getAggregate('COUNT'));
        }
        return count;
    },

    _sendReminder: function(usersUsingSoftPin, softPinGr, dayLeftForPinExpiration) {
        // Do not send the reminder if all users not using and user doesn't exist in any group
        if (!(usersUsingSoftPin.isAllUsers || usersUsingSoftPin.groupUsers[softPinGr.enrollment.user])) {
            return;
        }
        var instanceURL = new global.PasswordResetUtil().getInstanceURL();
        if (instanceURL) {
            var param1 = {
                "daysRemaining": dayLeftForPinExpiration + ''
            };
            var enrollmentURL = instanceURL + this.PWD_ENROLLMENT_FORM_URL_PATH;
            gs.eventQueue(this.EXPIRATION_REMINDER_EVENT, softPinGr, JSON.stringify(param1), enrollmentURL);
        }
    },

    _getExpirationInfo: function(expirationDate) {
        var expirationInfo = {
            "isExpired": false,
            "dayLeftForPinExpiration": null
        };
        var currTime = new GlideDateTime();
        var gDateTimeExpiration = new GlideDateTime(expirationDate);
        expirationInfo.isExpired = gDateTimeExpiration.compareTo(currTime) < 1;

        if (this.isExpirationReminderEnabled && !expirationInfo.isExpired) {
            var difference = gs.dateDiff(currTime, expirationDate, false);
            var dateDiffArray = difference.split(' ');
            expirationInfo.dayLeftForPinExpiration = dateDiffArray.length > 1 ? dateDiffArray[0] : 0;
        }
        return expirationInfo;
    },

    _getExpiration: function(startTime) {
        var gDateTime = new GlideDateTime();
        if (startTime) {
            gDateTime.setValue(startTime);
        }
        gDateTime.addDaysUTC(this.pwdSoftPINManager.getPinExpirationDays());
        return gDateTime.getValue();
    },

    _getAllUsersUsingSoftPin: function() {
        var usersUsingSoftPin = {
            isAllUsers: false,
            groupUsers: {}
        };
        if (this._isSoftPinUsedInOtherAppVerification()) {
            usersUsingSoftPin.isAllUsers = true;
            return usersUsingSoftPin;
        }
        var expirationUtil = new global.PwdExpirationUtils();
        var userGroupMemberGrList = [];
        var gr = new GlideRecord(this.PWD_MAP_PROC_TO_VERIFICATION);
        gr.addEncodedQuery('process.active=true^verification.type.sys_id=a67585845302011017c3ddeeff7b1267');
        gr.query();
        while (gr.next()) {
            if (gr.process.apply_to_all_users) {
                usersUsingSoftPin.isAllUsers = true;
                return usersUsingSoftPin;
            }
            var userGroupMenberGr = expirationUtil.getAllUsersEntitledToAProcess(gr.process);
            userGroupMemberGrList.push(userGroupMenberGr);
        }
        for (var i = 0; i < userGroupMemberGrList.length; i++) {
            while (userGroupMemberGrList[i].next()) {
                usersUsingSoftPin.groupUsers[userGroupMemberGrList[i].user] = true;
            }
        }
        return usersUsingSoftPin;
    },

    _isSoftPinUsedInOtherAppVerification: function() {
        var otherAppVerifications = new PasswordResetScopedUtil().getVerificationsFromOtherApplications();
        for (var i = 0; i < otherAppVerifications.size(); i++) {
            var gr = new GlideRecord(this.VERIFICATION);
            var verification = otherAppVerifications.get(i);
            if (verification && gr.get(verification) && gr.type == this.OOB_SOFTPIN_VERIFICATION_TYPE_SYS_ID) {
                return true;
            }
        }
        return false;
    },

    _expireSoftPIN: function(softPinGr) {
        var userId = softPinGr.enrollment.user;
        var verificationId = softPinGr.enrollment.verification;
        softPinGr.setValue(this.ACTIVE, false);
        if (softPinGr.update()) {
            this._setEnrollmentStatus(userId, verificationId);
        }
    },

    _setEnrollmentStatus: function(userId, verificationId) {
        new SNC.PwdEnrollmentManager().updateEnrollment(userId, verificationId, this.INACTIVE_ENROLLMENT_STATUS);
        new global.PwdEnrollSnapshotUtil().createOrUpdateEnrollmentSnapshot(verificationId, userId, this.INACTIVE_ENROLLMENT_SNAPSHOT_STATUS);
    },

    // Manage the OOB scheduled job expiration time, time input in HH:MM format
    updateExpirationJobExecutionTime: function(executionTime) {
        // Add :00 to make this time in HH:MM:SS format
        executionTime += ":00";
        var scheduleJobGr = new GlideRecord(this.SCHEDULED_JOB_TABLE);
        if (scheduleJobGr.get(this.OOB_SCHEDULED_JOB_SYS_ID)) {
            var glideTime = new GlideTime();
            glideTime.setValue(executionTime);
            scheduleJobGr.setValue('entered_time', glideTime);
            scheduleJobGr.update();
        }
    },

    // Sync the expiration time of all active softpins with tha current expiration days property 
    syncSoftPinExpirationTime: function() {
        if (this.isPinExpirationEnabled) {
            var expirationDate;
            var softPinGr = new GlideRecord(this.PWD_SOFTPIN);
            softPinGr.addActiveQuery();
            softPinGr.query();
            while (softPinGr.next()) {
                expirationDate = softPinGr.softpin_expiration_date ? this._getExpiration(softPinGr.sys_updated_on) : this._getExpiration();
                softPinGr.setValue(this.EXPIRATION, expirationDate);
                softPinGr.update();
            }
        }
    },

    type: 'SoftPINExpirationSNC'
};
