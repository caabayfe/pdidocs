(function(context){
	var ciUtil = new sn_oe_sfs.CIUtil();
	ciUtil.setCtaCardPropsFromContext(context);	
	var isCardNeverReviewed = !context.props_details.last_reviewed_on;
	if(isCardNeverReviewed) {
		context.__is_complete = false;
	}
})(context);
