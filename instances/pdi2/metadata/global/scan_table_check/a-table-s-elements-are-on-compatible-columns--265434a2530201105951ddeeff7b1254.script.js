(function (finding, current) {

    var dictionaryValidator = new sn_schema_validator.DictionaryValidator();
	var fieldsOnIncompatibleColumn = dictionaryValidator.findFieldsOnIncompatibleColumn(current.name);
	for (var i = 0; i < fieldsOnIncompatibleColumn.length; i++) {
		finding.setCurrentSource(fieldsOnIncompatibleColumn[i]);
		finding.increment();
	}

})(finding, current);
