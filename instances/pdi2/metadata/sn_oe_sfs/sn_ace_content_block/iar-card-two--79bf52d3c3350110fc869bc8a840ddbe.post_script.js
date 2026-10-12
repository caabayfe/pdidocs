(function(context){
	if(!CIPlugin.IAR().isActive()) {
		context.title = '';
		context.subtitle = '';
		context.props_details.footer_type = 'text';
		context.props_details.footer_text = '';
	}
	/*else {
		context.props_details.footer_text = gs.getMessage("Simulations ({0})", new sn_oe_sfs.CIUtil().getIARSimulationsCount());
	}*/
})(context);
