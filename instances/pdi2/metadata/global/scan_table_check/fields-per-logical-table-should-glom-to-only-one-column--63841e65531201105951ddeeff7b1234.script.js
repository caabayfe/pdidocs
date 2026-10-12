(function (finding, current) {

	var aliasValidator = new sn_schema_validator.AliasValidator();
	var fieldsIncorrectlyGlommed = aliasValidator.findFieldsIncorrectlyGlommed(current.name);

	for (var i = 0; i < fieldsIncorrectlyGlommed.length; i++) {
		finding.setCurrentSource(fieldsIncorrectlyGlommed[i]);
		finding.increment();
	}

})(finding, current);
