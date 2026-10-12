(function(context) {
	var ciUtil = new sn_oe_sfs.CIUtil();
	ciUtil.setCtaCardPropsFromContext(context);
	
    var fetchTR = new sn_oe_sfs.FetchRecommendationDetails();

    if (!GlidePluginManager.isActive('sn_topic_recommend')) {
        context.__is_complete = false;
        return;
    }

    if (!fetchTR.isAnalysisSuccessfulAtleastOnce()) {
        context.__is_complete = false;
        return;
    }
})(context);
