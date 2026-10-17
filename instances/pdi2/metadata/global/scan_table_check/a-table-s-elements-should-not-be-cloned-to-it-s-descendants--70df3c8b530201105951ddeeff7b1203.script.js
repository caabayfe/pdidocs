(function (finding, current) {

	var dictionaryValidator = new sn_schema_validator.DictionaryValidator();
	var fieldsIncorrectlyCloned = dictionaryValidator.findFieldsIncorrectlyCloned(current.name);
	for (var i = 0; i < fieldsIncorrectlyCloned.length; i++) {
		finding.setCurrentSource(fieldsIncorrectlyCloned[i]);
		finding.increment();
	}

})(finding, current);
