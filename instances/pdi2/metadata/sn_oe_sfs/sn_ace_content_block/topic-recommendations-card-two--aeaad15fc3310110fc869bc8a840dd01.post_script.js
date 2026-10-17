(function(context){
	if(!CIPlugin.TopicRecommender().isActive()) {
		context.title = '';
		context.subtitle = '';
		context.props_details.footer_text = '';
	}
})(context);
