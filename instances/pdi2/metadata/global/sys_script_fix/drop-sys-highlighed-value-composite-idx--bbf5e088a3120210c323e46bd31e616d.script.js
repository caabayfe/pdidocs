(function() {
	if (pm.isZboot())
		return;

	var td = GlideTableDescriptor.get('sys_highlighted_value');
	var ids = td.getIndexDescriptors();

	var indexName = '';
	var idValues = ids.values().iterator();
	while (idValues.hasNext()) {
		var id = idValues.next();
		var idFields = id.getFields();
		if (idFields.contains('workspace') && idFields.contains('table') && idFields.contains('field')) {
			gs.log('Fix Script: found matching index');
			indexName = id.getIndexName();
			break;
		}
	}

	if (indexName) {
		var indexUtils = new GlideIndexUtils();
		var result = indexUtils.dropByName('sys_highlighted_value', indexName);
		if (result)
			gs.log('Dropped composite index on sys_highlighted_value', 'highlighed_value_drop_index');
		else
			gs.log('Failed to drop composite index on sys_highlighted_value', 'highlighed_value_drop_index');
	} else
		gs.log('Composite index on sys_highlighted_value not present', 'highlighed_value_drop_index');
})();
