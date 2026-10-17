function validate(value) {
	var result = new global.VAFieldValidator().validateInternationalPhoneNumberFormat(value);
	if (!result || !result.valid) {
		return false;
	}
	return result.valid;
}
