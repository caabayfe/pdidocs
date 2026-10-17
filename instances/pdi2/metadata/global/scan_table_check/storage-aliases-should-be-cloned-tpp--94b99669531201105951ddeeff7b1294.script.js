(function (finding, current) {

	var aliasValidator = new sn_schema_validator.AliasValidator();
	var aliasesMissingClone = aliasValidator.findAliasesMissingClone(current.name);

	for (var i = 0; i < aliasesMissingClone.length; i++) {
		finding.setCurrentSource(aliasesMissingClone[i]);
		finding.increment();
	}

})(finding, current);
