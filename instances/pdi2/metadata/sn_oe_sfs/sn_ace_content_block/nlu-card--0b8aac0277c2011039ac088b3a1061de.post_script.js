(function(context) {
    var ciUtil = new sn_oe_sfs.CIUtil();
    ciUtil.setCtaCardPropsFromContext(context);

	var isNluActivated = ciUtil.isNluEnabled();
    if (!isNluActivated) {
        context.__is_complete = false;
        return;
    }

    if (isCardNeverReviewed(context)) {
        context.__is_complete = false;
        context.props_details.last_reviewed_on = getGeneralSettingsUpdatedOn();
        ciUtil.setContentBlockContext(context.block_id, { last_reviewed_on: context.props_details.last_reviewed_on });
        return;
    }

    if (is90DaysPastReview(context)) {
        context.__is_complete = false;
        return;
    }

    function getGeneralSettingsUpdatedOn() {
        var gr = new GlideRecord('sys_cs_general_settings');
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            return gr.getValue('sys_updated_on');
        }
    }

    function isCardNeverReviewed(context) {
        var lastReviewedOn = context.props_details.last_reviewed_on;
        return !lastReviewedOn;
    }

    function is90DaysPastReview(context) {
        var lastReviewedOn = context.props_details.last_reviewed_on;
        var lastOpenedBefore = new sn_oe_sfs.CIUtil().getDaysPastDateTime(lastReviewedOn);
        return (lastOpenedBefore >= 90);
    }
})(context);
