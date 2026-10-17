(function() {
	new SLAAdvancedConditionUtil()
		.updateAllAdvanced()
		.updateAllAdvancedIfJournal()
		.updateAllAdvancedIfSystem()
		.updateAllAdvancedIfJournalAndSystem()
		.updateAllNull();
})();
