function transform(input) {
    if (!input || !input.smsDetails) return [];
	var result = {};
	try {
		var telephonyUtils = new NotifyUXFTelephonyUtil();
		result = JSON.parse(telephonyUtils.sendSms(input.smsDetails));
	}
	catch (e) {
		result.status = false;
		result.errorMessages = [e.message];
    }
	return result;
}
