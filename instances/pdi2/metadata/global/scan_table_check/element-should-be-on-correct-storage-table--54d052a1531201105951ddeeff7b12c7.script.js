(function (finding, current) {

	var aliasValidator = new sn_schema_validator.AliasValidator();
	var incorrectStorageTables = aliasValidator.findIncorrectStorageTables(current.name);

	for (var i = 0; i < incorrectStorageTables.length; i++) {
		finding.setCurrentSource(incorrectStorageTables[i]);
		finding.increment();
	}

})(finding, current);
