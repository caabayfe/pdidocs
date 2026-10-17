(function (finding, current) {
	
	var hierarchyValidator = new sn_schema_validator.HierarchyValidator();
	var extensionsMissingElement = hierarchyValidator.findExtensionsMissingElement(current.name, "sys_class_name");
	
	for (var i = 0; i < extensionsMissingElement.length; i++) {
		finding.setCurrentSource(extensionsMissingElement[i]);
		finding.increment();
	}
	
})(finding, current);
