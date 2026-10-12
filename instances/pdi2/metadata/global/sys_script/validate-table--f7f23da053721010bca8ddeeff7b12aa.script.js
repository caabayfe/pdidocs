(function executeRule(current, previous /*null when async*/) {

	// table should not exists in ais_datasource and ais_child_table
	var grDatasource = new GlideRecord('ais_datasource');
	grDatasource.addQuery('source', current.source);
	grDatasource.addQuery('sys_id', '!=', current.getUniqueValue());
	grDatasource.addActiveQuery();
	grDatasource.query();
	if (grDatasource.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("{0} is already defined as an indexed source", [GlideStringUtil.escapeHTML(current.source)]));
	}

	var duplicableDatasources = gs.getProperty('glide.ais.duplicable_datasource_sources', 'sys_metadata').split(',');

	var grChild = new GlideRecord('ais_child_table');
	grChild.addQuery('table', current.source);
	grChild.query();
	while (grChild.next()) {
		if (!duplicableDatasources.includes(grChild.getElement('datasource').getElementValue('datasource.source'))) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("{0} is already included as part of another indexed source", [GlideStringUtil.escapeHTML(current.source)]));
			break;
		}
	}

	if (!new sn_ais.AisUtil().isTableIndexable(current.source)) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("{0} is not supported", [GlideStringUtil.escapeHTML(current.source)]));
	}

})(current, previous);
