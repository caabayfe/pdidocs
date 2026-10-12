(function (finding, current) {

	var aliasValidator = new sn_schema_validator.AliasValidator();
	var tablesWithNullClassPath = aliasValidator.findTablesWithNullClassPath(current.name);

	for (var i = 0; i < tablesWithNullClassPath.length; i++) {
		finding.setCurrentSource(tablesWithNullClassPath[i]);
		finding.increment();
	}

})(finding, current);
