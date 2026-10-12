(function(context) {
    if (CIPlugin.TopicRecommender().isActive()) {
        var trSettingsCount = new sn_oe_sfs.CIUtil().getTopicRecommendationSettingsCount();
        context.props_details.footer_text = gs.getMessage("Default criteria ({0})", trSettingsCount);
        context.props_details.show_border = true;
    } else {
        context.props_details.footer_text = '';
    }

})(context);
