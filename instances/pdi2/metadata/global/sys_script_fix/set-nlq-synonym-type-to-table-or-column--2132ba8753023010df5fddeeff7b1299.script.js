(function() {
	var nlqSynonymTable = 'nlq_synonym';
	var nlqSynonymTypeColumn = 'synonym_type';
	var nlqTableOrColumnType = 'table_or_column';
	var nlqRecordColumn = 'record';
	var nlqSynonymGR = new GlideRecord(nlqSynonymTable);
	nlqSynonymGR.addNullQuery(nlqSynonymTypeColumn);
	nlqSynonymGR.addNullQuery(nlqRecordColumn);
	nlqSynonymGR.query();
	while (nlqSynonymGR.next()) { 
		nlqSynonymGR.setValue(nlqSynonymTypeColumn,nlqTableOrColumnType);
		nlqSynonymGR.setWorkflow(false);
		nlqSynonymGR.update();
	}
})();
