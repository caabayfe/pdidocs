var CustomAdapterSoftPinHelper = Class.create();

CustomAdapterSoftPinHelper.DEFAULT_MAX_INVALID_ATTEMPTS = 3;
CustomAdapterSoftPinHelper.DEFAULT_MAX_INVALID_ATTEMPTS_INTERVAL_HRS = 24;
CustomAdapterSoftPinHelper.SOFTPIN_VERIFICATION = '06a5c9845302011017c3ddeeff7b1229';

/**
 *
 * @param {string} providerAppSysId
 * @param {string} channelUserId Phone number in this case
 * @param {number} maxAttempts
 * @param {number} attemptIntervalInHrs
 * @param {string} userId user's sysid in sys_user 
 * @returns {boolean}
 */
CustomAdapterSoftPinHelper.isUserLockedOutOnMaxAttempts = function(providerAppSysId, channelUserId, maxAttempts, attemptIntervalInHrs, userId) {
	if (gs.nil(maxAttempts))
		maxAttempts = CustomAdapterSoftPinHelper.DEFAULT_MAX_INVALID_ATTEMPTS;

	var numOfAttemptsInWindow = CustomAdapterSoftPinHelper.getInvalidAttemptsForUserInInterval(providerAppSysId, channelUserId, attemptIntervalInHrs);
	
	if (numOfAttemptsInWindow < maxAttempts) {
		return false;
	}
	var lastEnrollmentTime = CustomAdapterSoftPinHelper.userLastEnrolled(userId, CustomAdapterSoftPinHelper.SOFTPIN_VERIFICATION, attemptIntervalInHrs);

	if (gs.nil(lastEnrollmentTime)) {
		return true;
	}
	
	//Mark those failed attempts before enrollment time to inactive
	CustomAdapterSoftPinHelper.markPreviousAttemptsInactive(providerAppSysId, channelUserId, lastEnrollmentTime);

	numOfAttemptsInWindow = CustomAdapterSoftPinHelper.getInvalidAttemptsForUserInInterval(providerAppSysId, channelUserId, attemptIntervalInHrs);

	return  numOfAttemptsInWindow >= maxAttempts;
};

/**
 *
 * @param providerAppSysId
 * @param channelUserId
 * @param intervalInHrs
 * @returns {number|number}
 */
CustomAdapterSoftPinHelper.getInvalidAttemptsForUserInInterval = function(providerAppSysId, channelUserId, intervalInHrs) {
	if (gs.nil(intervalInHrs))
		intervalInHrs = CustomAdapterSoftPinHelper.DEFAULT_MAX_INVALID_ATTEMPTS_INTERVAL_HRS;

	var intervalStartTime = new GlideDateTime();
	intervalStartTime.subtract(intervalInHrs * 60 * 60 * 1000);

	var invalidSoftPinAttemptGa = new GlideAggregate('sys_cs_invalid_softpin_attempt');
	invalidSoftPinAttemptGa.addQuery('provider_application', providerAppSysId);
	invalidSoftPinAttemptGa.addQuery('channel_user_id', channelUserId);
	invalidSoftPinAttemptGa.addQuery('active', 'true');
	invalidSoftPinAttemptGa.addQuery('sys_created_on', '>=', intervalStartTime);
	invalidSoftPinAttemptGa.addAggregate('COUNT');
	invalidSoftPinAttemptGa.query();

	return invalidSoftPinAttemptGa.next() ? parseInt(invalidSoftPinAttemptGa.getAggregate('COUNT')) : 0;
};

/**
 *
 * @param providerAppSysId
 * @param channelUserId
 */
CustomAdapterSoftPinHelper.recordInvalidAttempt = function(providerAppSysId, channelUserId) {
	var invalidSoftPinAttemptGr = new GlideRecord('sys_cs_invalid_softpin_attempt');
	invalidSoftPinAttemptGr.setValue('provider_application', providerAppSysId);
	invalidSoftPinAttemptGr.setValue('channel_user_id', channelUserId);
	invalidSoftPinAttemptGr.insert();
};

CustomAdapterSoftPinHelper.markInvalidAttemptsInactive = function(providerAppSysId, channelUserId) {
	var invalidSoftPinAttemptGr = new GlideRecord('sys_cs_invalid_softpin_attempt');
	if (!gs.nil(providerAppSysId))
		invalidSoftPinAttemptGr.addQuery('provider_application', providerAppSysId);

	invalidSoftPinAttemptGr.addQuery('channel_user_id', channelUserId);
	invalidSoftPinAttemptGr.addActiveQuery();

	invalidSoftPinAttemptGr.setValue('active', 'false');
	invalidSoftPinAttemptGr.updateMultiple();
};

/**
 *
 * @param {string} userId user's sysid in sys_user
 * @param {string} verificationSysId sysid for a specific password verification
 * @param {number} interval hours that needs to go back to lookup password enrollment
 * @returns {String} if user has enrollment in the past intervalInHrs, return the time otherwise ''
 * TODO: To use API from ITSM team instead of querying pwd_enrollment in next release
 */
CustomAdapterSoftPinHelper.userLastEnrolled = function(userId, verificationSysId, intervalInHrs) {
    var startTime = new GlideDateTime();
    startTime.subtract(intervalInHrs * 60 * 60 * 1000);

    var enrollmentGR = new GlideRecord("pwd_enrollment");
    enrollmentGR.addQuery('user', userId);
    enrollmentGR.addQuery('verification', verificationSysId);
    enrollmentGR.addQuery('sys_updated_on', '>=', startTime);
    enrollmentGR.query();
    if (enrollmentGR.next()) {
        var lastEnrollmentTime = enrollmentGR.getValue('sys_updated_on');
        return lastEnrollmentTime;
    }
    return '';
};
/**
 *
 * @param providerAppSysId
 * @param channelUserId
 * @param lastEnrollmentTime
 */
CustomAdapterSoftPinHelper.markPreviousAttemptsInactive = function(providerAppSysId, channelUserId, lastEnrollmentTime) {
    var invalidSoftPinAttemptGr = new GlideRecord('sys_cs_invalid_softpin_attempt');
    if (!gs.nil(providerAppSysId))
        invalidSoftPinAttemptGr.addQuery('provider_application', providerAppSysId);

    invalidSoftPinAttemptGr.addQuery('channel_user_id', channelUserId);
    invalidSoftPinAttemptGr.addQuery('sys_created_on', '<', lastEnrollmentTime);
    invalidSoftPinAttemptGr.addActiveQuery();

    invalidSoftPinAttemptGr.query();
    invalidSoftPinAttemptGr.setValue('active', 'false');
    invalidSoftPinAttemptGr.updateMultiple();
};
