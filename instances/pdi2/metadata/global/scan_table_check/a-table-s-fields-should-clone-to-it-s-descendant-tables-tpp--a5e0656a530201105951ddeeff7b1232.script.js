(function (finding, current) {

    var dictionaryValidator = new sn_schema_validator.DictionaryValidator();
	var fieldsMissingClone = dictionaryValidator.findFieldsMissingClone(current.name);
	for (var i = 0; i < fieldsMissingClone.length; i++) {
		finding.setCurrentSource(fieldsMissingClone[i]);
		finding.increment();
	}

})(finding, current);
