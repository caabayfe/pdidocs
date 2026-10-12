(function(context, pageParams) {
	context.props_details.helper_text = gs.getMessage('Agent Transfer Message');
	context.props_details.placeholder_text = gs.getMessage('Please stand by while I connect you to a live agent.');
    context.props_details.record = new sn_oe_sfs.CIUtil().getChatSetUpRecord();
})(context, pageParams);
