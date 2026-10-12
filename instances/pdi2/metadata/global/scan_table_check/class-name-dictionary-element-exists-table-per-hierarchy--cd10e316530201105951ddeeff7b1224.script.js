(function (finding, current) {
	
	var hierarchyValidator = new sn_schema_validator.HierarchyValidator();
	var tableMissingElement = hierarchyValidator.checkLogicalElementExists(current.name, "sys_class_name");

	if (tableMissingElement) {
		finding.setCurrentSource(current);			
		finding.increment();
	}
	
})(finding, current);
