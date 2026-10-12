(function executeRule(current, previous /*null when async*/) {

	var splitPath = current.field.split('.');
	var gr = GlideRecord('sys_rte_eb_etl_field');
	gr.addQuery('sys_rte_eb_entity', current.sys_rte_eb_entity);
	var cond = gr.addEncodedQuery('fieldSTARTSWITH' + splitPath[0] + '.^ORfield=' + splitPath[0]);
	gr.query();

	var refFieldCount = 1;
	var badActionCount = 0;
	var badCoalesceCount = 0;
	while (gr.next()) {
		if (gr.sys_id != current.sys_id) {
			refFieldCount++;
			if (gr.coercion_action != current.coercion_action) {
				badActionCount++;
			}
			if (gr.coalesce != current.coalesce) {
				badCoalesceCount++;
			}
		}
	}
	
	if (badActionCount > 0) {
		gs.addInfoMessage(gs.getMessage(
			"ETL Entity '{0}' has {1} references to field/path '{2}', but not all of them have the same Coercion Action",
			[
				current.sys_rte_eb_entity.name,
				refFieldCount.toString(),
				splitPath[0]]));
	}
	
	if (badCoalesceCount > 0) {
		gs.addInfoMessage(gs.getMessage(
			"ETL Entity '{0}' has {1} references to field/path '{2}', but not all of them have the same Coalesce Setting",
			[
				current.sys_rte_eb_entity.name,
				refFieldCount.toString(),
				splitPath[0]]));
	}

})(current, previous);
