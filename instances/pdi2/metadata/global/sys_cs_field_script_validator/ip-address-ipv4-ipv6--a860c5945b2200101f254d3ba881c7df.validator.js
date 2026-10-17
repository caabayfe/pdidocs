function validate(value) {
	return new global.VAFieldValidator().validateIPAddress(value) == true;
}
