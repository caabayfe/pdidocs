dropTableFieldIndex();
function dropTableFieldIndex() {
	var td = GlideTableDescriptor.get("sys_highlighted_value");
	if (!td.isValid())
		return;
	var ids = td.getIndexDescriptors();
	if (!ids)
		return;
	var idValues = ids.values().iterator();
	while (idValues.hasNext()) {
		var id = idValues.next();
		if (!id.isUnique())
			continue;
		var idFields = id.getFields();
		if (!idFields || idFields.size() != 2)
			continue;
		if (idFields.contains('table') && idFields.contains('field')) {
			gs.log('Found "table_field" unique index, proceed to drop it');
			new GlideIndexUtils().drop(id);
			return;
		}
	}
	gs.log('"table_field" unique index not found, no index dropped');
}
