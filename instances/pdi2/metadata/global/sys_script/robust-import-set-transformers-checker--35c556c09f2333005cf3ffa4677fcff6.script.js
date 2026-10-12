(function executeRule(current, previous /*null when async*/) {

	var robustTransformer = new GlideRecord('sys_robust_import_set_transformer');
        robustTransformer.addQuery('source_table',  current.source_table);
        robustTransformer.addActiveQuery();
        robustTransformer.query();
        if (robustTransformer.next()) {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage('Source table {0} already has an active robust import set transformer {1}', [robustTransformer.source_table, robustTransformer.name]));
            return;
        }

})(current, previous);
