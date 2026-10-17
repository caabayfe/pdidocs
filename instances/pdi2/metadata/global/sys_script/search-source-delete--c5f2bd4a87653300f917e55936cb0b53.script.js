(function executeRule(current, previous /*null when async*/) {
	var sourceId = current.sys_id;
	gs.info('Removing suggestions that belong to source: ' + sourceId);
	var suggestionRecord = new GlideRecord('sys_search_suggestion');
	suggestionRecord.addQuery('source', sourceId);
	suggestionRecord.query();
	suggestionRecord.deleteMultiple();
})(current, previous);
