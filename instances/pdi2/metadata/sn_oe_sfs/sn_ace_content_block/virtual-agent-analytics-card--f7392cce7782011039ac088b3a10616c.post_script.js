(function(context){
	var ciUtil = new sn_oe_sfs.CIUtil();
	ciUtil.setCtaCardPropsFromContext(context);
	
	var isCardNeverReviewed = gs.nil(context.props_details.last_reviewed_on);
	if(isCardNeverReviewed) {
		context.__is_complete = false;
	} else {
		if(is90DaysPastReview(context)) {
			context.__is_complete = false;
		}
	}
	
	function is90DaysPastReview(context) {
		var lastReviewedOn = context.props_details.last_reviewed_on;
		var lastOpenedBefore = ciUtil.getDaysPastTheDate(lastReviewedOn);
		return (lastOpenedBefore > 90);
	}
})(context);
