(function(context) {
    context.props_details.image = '/images/ci_landingexp_topicrecommendations.png';
    var daysPastRecentAnalyis = new sn_oe_sfs.FetchRecommendationDetails().getDaysPastRecentAnalysis();
    var daysPastRecentAnalyisText = gs.getMessage('{0} days ago', daysPastRecentAnalyis);
    context.props_details.body_tag = {
        label: gs.getMessage("Last analyzed"),
        value: daysPastRecentAnalyisText,
        color: "low",
        variant: "tertiary"
    };
    
    context.__is_complete = false;
})(context);
