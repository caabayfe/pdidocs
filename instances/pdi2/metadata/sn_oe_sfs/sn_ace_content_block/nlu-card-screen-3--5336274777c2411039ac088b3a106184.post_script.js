(function(context) {
    context.props_details.image = '/images/ci_landingexp_nlu.png';
    context.props_details.body_tag = {
        label: gs.getMessage("Last reviewed"),
        value: getNumberOfDaysSinceLastReviewed() + gs.getMessage(" days ago"),
        color: "low",
        variant: "tertiary"
    };

    function getNumberOfDaysSinceLastReviewed() {
        var ciUtil = new sn_oe_sfs.CIUtil();

        var todayGdr = new GlideDate();
        var lastReviewedOn = getLastReviewedOnOfParent(context) || ciUtil.getLastReviewedDate();
        var lastReviewedGdr = new GlideDate();
        lastReviewedGdr.setDisplayValue(lastReviewedOn);
        var duration = GlideDate.subtract(lastReviewedGdr, todayGdr);
        return duration.getDayPart();
    }

    function getLastReviewedOnOfParent(context) {
		var screenId = context.block_id;
		var cardId = getCardSysIdFromScreen(screenId);
        var propsInContext = new sn_oe_sfs.CIUtil().getContentBlockContext(cardId);
        var lastReviewedOn = propsInContext.last_reviewed_on || '';
        return lastReviewedOn;
    }
	
	function getCardSysIdFromScreen(screenSysId) {
		var aceContentBlockGr = new GlideRecord('sn_ace_content_block');
		if(aceContentBlockGr.get(screenSysId)) {
			var cardSysId = aceContentBlockGr.getValue('parent');
			return cardSysId;
		}
		return '';
	}
})(context);
