function onBefore(current, previous) {
	new SNCCatalogUtil().syncVariableTableName(current.getUniqueValue(), null);
}
