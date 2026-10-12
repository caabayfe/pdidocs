(function executeRule(current, previous /*null when async*/) {

        var robustTransformer = new GlideRecord('sys_robust_import_set_transformer');
        robustTransformer.addQuery('source_table',  current.source_table);
        robustTransformer.addActiveQuery();
        robustTransformer.query();
        if (robustTransformer.next() && robustTransformer.sys_id != current.sys_id) {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage('Source table {0} already has an active robust import set transformer {1}', [robustTransformer.source_table, robustTransformer.name]));
            return;
        }
	
	var transformMap = new GlideRecord('sys_transform_map');
        transformMap.addQuery('source_table',  current.source_table);
        transformMap.addActiveQuery();
        transformMap.query();
        if (transformMap.next() && transformMap.sys_id != current.sys_id) {
			 current.setAbortAction(true);
             gs.addErrorMessage(gs.getMessage('Source table {0} already has an active transform map {1}', [ transformMap.source_table, transformMap.name]));
            return;
        }
	

})(current, previous);
