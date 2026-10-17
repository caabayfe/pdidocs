(function(context, pageParams, blockcontext, dataParams){
	context.props_details.items = JSON.stringify(new sn_sow_admin.SOWAdminUtils().getResourcesList());
})(context, pageParams, blockcontext, dataParams);
