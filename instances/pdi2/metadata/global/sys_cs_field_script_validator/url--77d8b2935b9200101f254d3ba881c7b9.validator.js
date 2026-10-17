function validate(value) {
	return new global.VAFieldValidator().validateURL(value) == true;
}
