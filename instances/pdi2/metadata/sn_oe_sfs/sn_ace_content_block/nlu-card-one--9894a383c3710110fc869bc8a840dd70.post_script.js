(function(context){
	context.props_details.footer_type = 'status';
	context.props_details.show_border=true;
		//context.props_details.footer_text = gs.getMessage("Branding profiles ({0})", new sn_oe_sfs.CIUtil().getBrandingSetupCount());
	context.props_details.status = (new sn_oe_sfs.CIUtil().isNluEnabled()) ? 'on' : 'off';
})(context);
