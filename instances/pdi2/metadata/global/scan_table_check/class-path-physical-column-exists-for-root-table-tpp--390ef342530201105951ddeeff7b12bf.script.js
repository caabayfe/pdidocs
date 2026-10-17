(function (finding, current) {

    var hierarchyValidator = new sn_schema_validator.HierarchyValidator();
	var tableMissingColumn = hierarchyValidator.checkPhysicalColumnExists(current.name, "sys_class_path");

	if (tableMissingColumn) {
		finding.setCurrentSource(tableMissingColumn);
		finding.increment();
	}

})(finding, current);
