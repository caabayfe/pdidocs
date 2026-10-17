(function (finding, current) {
	
    var hierarchyValidator = new sn_schema_validator.HierarchyValidator();
	var partitionsMissingColumn = hierarchyValidator.findPartitionsMissingColumn(current.name, "sys_class_path");
	
	for (var i = 0; i < partitionsMissingColumn.length; i++) {
		finding.setCurrentSource(partitionsMissingColumn[i]);
		finding.increment();
	}
	
})(finding, current);
