(function(context) {
	var ciUtil = new sn_oe_sfs.CIUtil();
	ciUtil.setCtaCardPropsFromContext(context);
	
	context.__is_complete = false;
	context.props_details.showDismiss = false;
})(context);
