(function(context) {
	var ciUtil = new sn_oe_sfs.CIUtil();
	ciUtil.setCtaCardPropsFromContext(context);
	
    if (isNoPortalActive(context)) {
        context.__is_complete = false;
    } else {
        if (isCardNeverReviewed(context)) {
            context.__is_complete = false;
        }
    }

    function isCardNeverReviewed(context) {
        return !context.props_details.last_reviewed_on;
    }

    function isNoPortalActive(context) {
        var gr = new GlideRecord('sp_agent_chat_config');
        gr.addActiveQuery();
        gr.setLimit(1);
        gr.query();
        return !gr.hasNext();
    }
})(context);
