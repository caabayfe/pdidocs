(function(context, pageParams, blockcontext, dataParams){
	context.props_details.items = JSON.stringify(new SOWAdminUtils().getITSMCoreApps());
})(context, pageParams, blockcontext, dataParams);
