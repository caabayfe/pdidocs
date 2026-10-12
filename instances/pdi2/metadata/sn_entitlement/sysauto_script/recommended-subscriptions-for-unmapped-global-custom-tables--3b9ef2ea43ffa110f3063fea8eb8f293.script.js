if (gs.getProperty("sn_entitlement.subscription_recommender_v2.is_active", "false") === "true") {
    gs.info("RecommenderEngine V2 is in use, the Recommended Subscriptions for Unmapped Global Custom Tables job has been skipped.");
} else {
    new GlobalCustomTableRecommendationService().recommendSubscriptions();
}
