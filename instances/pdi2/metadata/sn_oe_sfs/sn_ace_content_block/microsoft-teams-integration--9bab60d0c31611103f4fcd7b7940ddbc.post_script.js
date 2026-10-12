(function(context, pageParams){  
	/*   context = {    'block_id': @sysId,    'name': @String,    'title': @String,    'subtitle': @String,    'order': @Number,    'type': @Object,    'children': @Array[context],    'props_details': @Object   };  */ 
	context.props_details.isForceCreateExternalChatSysPropEnabled = gs.getProperty("sn_oe_sfs.com.glide.cs.collab.force_create_external_conversation", "false");
	context.props_details.isSidebarEnabled = new global.CollabChatGlobalUtils().isCollabChatEnabledInDomain();
	context.props_details.isDomainSeparationEnabled = GlidePluginManager.isActive("com.glide.domain.msp_extensions.installer");
})(context, pageParams);
