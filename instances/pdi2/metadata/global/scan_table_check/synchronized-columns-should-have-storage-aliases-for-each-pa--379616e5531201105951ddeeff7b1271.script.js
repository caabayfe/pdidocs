(function (finding, current) {

	var aliasValidator = new sn_schema_validator.AliasValidator();
	var synchronizedFieldsMissingAlias = aliasValidator.findSynchronizedFieldsMissingAlias(current.name);

	for (var i = 0; i < synchronizedFieldsMissingAlias.length; i++) {
		finding.setCurrentSource(synchronizedFieldsMissingAlias[i]);
		finding.increment();
	}

})(finding, current);
