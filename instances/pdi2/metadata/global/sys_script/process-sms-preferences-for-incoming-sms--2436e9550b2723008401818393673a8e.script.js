(function executeRule(current, previous /*null when async*/) {
	var notifyNumberSysId = current.notify_number;
	var numGr = new GlideRecord('notify_number');
	if (numGr.get(notifyNumberSysId)) {
		var notifyNumber = numGr.getValue('number');
		var owner = numGr.getValue('owner');
		var numberType = numGr.getValue('short_code') === null ? 'long': 'short';

		var handler = new sn_sms_pref.SMSPreferenceHandler(owner);
		var response = handler.processIncomingSMSForOptedRequest(notifyNumber, current.phone_number, current.body, numberType);
		if (response.processed && response.confirmationText) {
			var messageId = SNC.Notify.sendSMSDirect(notifyNumber, current.phone_number, response.confirmationText);
			var saveInDb = gs.getProperty('glide.notify.sms.save_confirmation_in_db', 'false') + '';
			if (saveInDb === 'true' && messageId)
				new NotifyDatabase().addMessageRecordByNumberId(notifyNumberSysId, messageId, current.phone_number, 'outbound', response.confirmationText, null, null);
		}
	}
})(current, previous);
