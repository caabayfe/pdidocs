(function() {
	var nlqSynonymTable = 'nlq_synonym';
	var nlqExtendToAllChildTablesColumn = 'extend_to_all_child_tables';
	var nlqSynonymGR = new GlideRecord(nlqSynonymTable);
	nlqSynonymGR.addNullQuery(nlqExtendToAllChildTablesColumn);
	nlqSynonymGR.query();
	while (nlqSynonymGR.next()) { 
		nlqSynonymGR.setValue(nlqExtendToAllChildTablesColumn,false);
		nlqSynonymGR.setWorkflow(false);
		nlqSynonymGR.update();
	}
})();
