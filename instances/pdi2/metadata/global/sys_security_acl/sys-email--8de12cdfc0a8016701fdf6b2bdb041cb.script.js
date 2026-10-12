answer = canRead(current);

function canRead(emailGr) {
	function execute() {
		if (!emailGr || !emailGr.isValidRecord())
			return false;
		if(gs.hasRole("email_admin"))
			return true;
		var type = emailGr.getValue("type");

		if (type !== "received" && type !== "received-ignored") {
			var notificationId = getNotificationIdFromHeaders() || getNotificationIdFromLog();
			if (notificationId) {
				var emailAccessRestriction = getAccessRestrictionByNotification(notificationId);
				if (emailAccessRestriction)
					return processEmailAccessRestriction(emailAccessRestriction);
			}
		}

		return canReadTargetRecord();
	}

	function processEmailAccessRestriction (emailAccessRestriction) {
		var conditions = emailAccessRestriction.getValue("conditions");
		if (!conditions)
			return false;

		var targetRecord = getTargetRecord();
		if (!targetRecord)
			return false;

		return GlideFilter.checkRecord(targetRecord, conditions);
	}

	function canReadTargetRecord() {
		if (emailGr.target_table.nil() || emailGr.target_table == "sys_email") {
			if (gs.getProperty("glide.email.email_with_no_target_visible_to_all") == "true")
				return true;
			return gs.getUserID() == emailGr.user_id;
		}

		var targetRecord = getTargetRecord();

		return (targetRecord !== null && targetRecord.canRead());
		//Check the table is valid........the record can be seen(see below) ....and can be read by the current user
		//The can be seen check is to make sure that the record is not hidden by a before query rule or by company/domain separation.
	}

	function getNotificationIdFromLog() {
		var sysEmailLog = new GlideRecord('sys_email_log');
		sysEmailLog.get("email", emailGr.getUniqueValue());

		return sysEmailLog.getValue("notification");
	}

	function getNotificationIdFromHeaders() {
		var REGEX_SRC_HDR_INDEX = 1;
		var REGEX_EXPECTED_RESULT_SIZE = 2;

		var eventIdExtractor = /X-ServiceNow-Source:\s*Notification-(\w+)/;
		var regExResult = eventIdExtractor.exec(emailGr.headers);

		return (regExResult !== null && regExResult.length === REGEX_EXPECTED_RESULT_SIZE) ?
			regExResult[REGEX_SRC_HDR_INDEX] : null;
	}

	function getAccessRestrictionByNotification(notificationId) {
		var emailAccessRestriction = new GlideRecord("email_access_restriction");

		return emailAccessRestriction.get("notification", notificationId) ? emailAccessRestriction : null;
	}

	function getTargetRecord() {
		if (emailGr.target_table.nil())
			return null;

		var targetRecord = new GlideRecord(emailGr.target_table);
		return (targetRecord.get(emailGr.instance) && targetRecord.isValidRecord()) ? targetRecord : null;
	}

	return execute();
}
