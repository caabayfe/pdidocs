(function(context, pageParams) {
    /*   context = {    'block_id': @sysId,    'name': @String,    'title': @String,    'subtitle': @String,    'order': @Number,    'type': @Object,    'children': @Array[context],    'props_details': @Object   };  */
	context.props_details.headingStyles = {
		style: "header-tertiary",
		level: '1'
	};
	context.props_details.links = [{
		label: gs.getMessage("Virtual Agent"),
		link: "/api/now/v1/context_doc_url/va-explore-virtual-agent"
	}, {
		label: gs.getMessage("Agent Chat"),
		link: "/api/now/v1/context_doc_url/agent-chat-using"
	}, {
		label: gs.getMessage("Sidebar"),
		link: "/api/now/v1/context_doc_url/sidebar-landing"
	}, {
		label: gs.getMessage("Advanced Work Assignment"),
		link: "/api/now/v1/context_doc_url/awa-description"
	}];

})(context, pageParams);
