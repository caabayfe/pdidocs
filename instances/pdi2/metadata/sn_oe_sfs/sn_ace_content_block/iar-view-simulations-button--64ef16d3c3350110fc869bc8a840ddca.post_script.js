(function(context){
	if(!CIPlugin.IAR().isActive()) {
		context.title = gs.getMessage('Get this plugin');
		context.props_details.action_type = 'link';
		context.props_details.link = '/now/app-manager/home/search/com.glide.cs.chatbot';
		context.props_details.icon = 'open-link-right-fill';
		context.props_details.variant = 'primary';
	}
})(context);
