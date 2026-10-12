(function (finding, current) {

	var aliasValidator = new sn_schema_validator.AliasValidator();
	var aliasesIncorrectlyCloned = aliasValidator.findAliasesIncorrectlyCloned(current.name);

	for (var i = 0; i < aliasesIncorrectlyCloned.length; i++) {
		finding.setCurrentSource(aliasesIncorrectlyCloned[i]);
		finding.increment();
	}

})(finding, current);
