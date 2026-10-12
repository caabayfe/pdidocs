(function executeRule(current, previous /*null when async*/) {
	var user_language = current.language;
	var user_db = current.db;
	var ga = new GlideAggregate('sys_db_collation_info');
	ga.addAggregate('COUNT', '*');
	ga.addQuery('language', user_language);
	ga.addQuery('db', user_db);
	ga.query();
	ga.next();
	var count = ga.getAggregate('COUNT', '*');
	if (count > 0) {
		gs.addErrorMessage(sn_i18n.Message.getMessage("global", "Record with language: [{0}] is available for current db. Please update the already present record, as unique collation should exist for each language.",{0:user_language}));
		current.setAbortAction(true);
		return;
	}
})(current, previous);
