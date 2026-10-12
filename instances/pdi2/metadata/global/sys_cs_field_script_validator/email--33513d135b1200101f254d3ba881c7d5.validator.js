function validate(value) {
	return new global.VAFieldValidator().validateEmailAddress(value) == true;
}
