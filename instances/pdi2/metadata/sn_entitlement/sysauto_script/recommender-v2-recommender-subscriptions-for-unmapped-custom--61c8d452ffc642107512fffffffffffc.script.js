if (gs.getProperty("sn_entitlement.subscription_recommender_v2.is_active", "false") === "true") {
	AppAndCustomTableRecommenderRunner.run();
} else {
	gs.info("RecommenderEngine V2 is not in use, the RecommenderEngineV2 job has been skipped.");
}
