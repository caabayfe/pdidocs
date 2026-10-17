(function (finding, current) {

	var dictionaryValidator = new sn_schema_validator.DictionaryValidator();
	var fieldsMissingPhysicalColumns = dictionaryValidator.findFieldsMissingPhysicalColumn(current.name);
	for (var i = 0; i < fieldsMissingPhysicalColumns.length; i++) {
		finding.setCurrentSource(fieldsMissingPhysicalColumns[i]);
		finding.increment();
	}

})(finding, current);
