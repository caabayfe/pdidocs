(function(context, pageParams) {
	context.props_details.helper_text = gs.getMessage("\"No agent available\" message");
	context.props_details.placeholder_text = gs.getMessage('There are no agents available at the moment. Please try again later.');
    context.props_details.record = new sn_oe_sfs.CIUtil().getChatSetUpRecord();
})(context, pageParams);
