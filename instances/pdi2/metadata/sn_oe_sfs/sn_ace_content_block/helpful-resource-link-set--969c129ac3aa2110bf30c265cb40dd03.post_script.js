(function(context) {
	if(context.pageParams.channel == "messenger"){
	context.props_details.links = [
		{
			"label": gs.getMessage("Install conversational integration with Messenger"),
			"href": "/api/now/v1/context_doc_url/va-fb-messenger-integration",
			"icon": "document-outline"
		},
		{
			"label": gs.getMessage("Remove Messenger integration"),
			"href": "/api/now/v1/context_doc_url/fbm-remove",
			"icon": "document-outline"
		},
	].map(function(link) {
		return {
			"label": link.label,
			"value": {
				"href": link.href
			},
			"type": "external",
            "endsWith": {
				"type": "icon",
                "value": link.icon
			}
		};
	});
	}
	if(context.pageParams.channel == "line"){
	context.props_details.links = [
		{
			"label": gs.getMessage("Install conversational integration with Line"),
			"href": "/api/now/v1/context_doc_url/va-line-integration",
			"icon": "document-outline"
		},
		{
			"label": gs.getMessage("Remove Line integration"),
			"href": "/api/now/v1/context_doc_url/lineapp-remove",
			"icon": "document-outline"
		}
	].map(function(link) {
		return {
			"label": link.label,
			"value": {
				"href": link.href
			},
			"type": "external",
            "endsWith": {
				"type": "icon",
                "value": link.icon
			}
		};
	});
	}
})(context);
