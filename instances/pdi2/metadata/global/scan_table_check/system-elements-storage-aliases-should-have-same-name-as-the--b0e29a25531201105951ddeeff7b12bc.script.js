(function (finding, current) {

	var aliasValidator = new sn_schema_validator.AliasValidator();
	var incorrectSysElementAliases = aliasValidator.findIncorrectSysElementAliases(current.name);

	for (var i = 0; i < incorrectSysElementAliases.length; i++) {
		finding.setCurrentSource(incorrectSysElementAliases[i]);
		finding.increment();
	}

})(finding, current);
