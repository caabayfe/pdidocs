
(function(context, pageParams, blockcontext){
    var OTHER_FEATURE_ID = "a5efaf1c93764210aa5730f16489186d";
    var featureDetails = NAAWorkFlowFeatureUtil.getFeatureById(OTHER_FEATURE_ID);
    return {
        title: featureDetails["sub_title"],
        description: featureDetails["description"].replace('<p>','<p style="margin:0px;margin-top:0.5rem;">')
    };
})(context, pageParams, blockcontext);
