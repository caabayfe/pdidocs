dropFilterStartIndex();
function dropFilterStartIndex() {
	if (!pm.isZboot() && pm.isActive('com.snc.pa.mlb')) {
				var tableName = 'pa_dm_single_score_cache';
				if(gs.tableExists(tableName)) {
					var td = GlideTableDescriptor.get(tableName);
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
						if (idFields.contains('filter_id') && idFields.contains('score_date')) {
							gs.log('Found "filter_start" unique index, proceed to drop it');
							new GlideIndexUtils().drop(id);
							return;
						}
					}
					gs.log('"filter_start" unique index not found, no index dropped');
				}
	}
}
