(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var payload = request.body.data;
	if (JSUtil.isEmpty(payload)) {
		response.setStatus(500);
		return;
	}

    var userTable = payload.user_table;
	var userDocument = payload.user_document;
	var clientPhoneNumber = payload.client_phone_number;
	var phoneNumberValidationUtils = new global.PhoneNumberValidationUtils();
	var result = {};
	var validationResult;
	if (GlideDBObjectManager.get().getBase(userTable) == 'sys_user') {
		userTable = 'sys_user';
	}
	if (userTable) {
		switch (userTable) {
			case 'sys_user':
				validationResult = phoneNumberValidationUtils.validatePhoneNumberForSysUser(clientPhoneNumber, userDocument);
				break;
			case 'csm_consumer':
				validationResult = phoneNumberValidationUtils.validatePhoneNumberForConsumer(clientPhoneNumber, userDocument);
				break;
			default:
				validationResult = undefined;
		}
	} else {
		validationResult = phoneNumberValidationUtils.validatePhoneNumberForSysUser(clientPhoneNumber, userDocument);
	}

	if (validationResult == undefined) {
		result = {
			isValid: false
		};
	} else {
		result = {
			isValid: true,
			e164PhoneNumber: validationResult
		};
	}

	response.setBody(result);
	response.setStatus(200);

})(request, response);
