
migrateAisRelevancyModel();
function migrateAisRelevancyModel() {
	gs.info('AI Search relevancy model migration started');
	var pushRelevancyService = new sn_ais.PushRelevancyService();
	var aisRelevancyModelGr = new GlideRecord('ais_search_profile_relevancy_model');
	aisRelevancyModelGr.addQuery('current', true);
	aisRelevancyModelGr.query();
	while (aisRelevancyModelGr.next()) {
		//push relevancy model to AIS backend
		var artifactId = aisRelevancyModelGr.getUniqueValue();
		var relevancyModelJson = aisRelevancyModelGr.getValue("relevancy_model");
		pushRelevancyService.pushRelevancyModelToAisFromLegacyRelevancyModelTable(artifactId, relevancyModelJson);
		gs.info('AI Search relevancy model '+artifactId+' was successfully upgraded');
	}
	gs.info('AI Search relevancy model migration complete');
}
