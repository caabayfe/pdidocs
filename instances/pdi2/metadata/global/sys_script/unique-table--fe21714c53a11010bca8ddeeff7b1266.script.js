(function executeRule(current, previous /*null when async*/) {
	var duplicableDatasourceSources = gs.getProperty('glide.ais.duplicable_datasource_sources', 'sys_metadata').split(',');
	var isDuplicableDatasource = duplicableDatasourceSources.includes(current.datasource.source.toString());
	var grChild = new GlideRecord('ais_child_table');
	grChild.addQuery('table', current.table);
	grChild.addQuery('sys_id', '!=', current.getUniqueValue());
	if (isDuplicableDatasource) {
		// only need to enforce uniqueness within this datasource
		grChild.addQuery('datasource', current.datasource);
	} else {
		// check other non-duplicable datasources
		grChild.addQuery('datasource.source', 'NOT IN', duplicableDatasourceSources);
	}

	grChild.query();
	if (grChild.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("{0} child table record already exists", [GlideStringUtil.escapeHTML(current.table)]));
	}

	if (!isDuplicableDatasource && !duplicableDatasourceSources.includes(current.table.toString())) {
		var grDatasource = new GlideRecord('ais_datasource');
		grDatasource.addQuery('source', current.table);
		grDatasource.query();
		if (grDatasource.next()) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("{0} is already defined as an indexed source", [GlideStringUtil.escapeHTML(current.table)]));
		}
	}

	if (!new sn_ais.AisUtil().isTableIndexable(current.table)) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("{0} is not supported", [GlideStringUtil.escapeHTML(current.table)]));
	}

})(current, previous);
