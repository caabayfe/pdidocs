(function(context) {
	if(context.pageParams.channel == "teams"){
	context.props_details.links = [
		{
			"label": gs.getMessage("Install Conversational Integration with Microsoft Teams"),
			"href": "/api/now/v1/context_doc_url/va-msteams-integration",
			"icon": "document-outline"
		},
		{
			"label": gs.getMessage("Remove Teams Integration"),
			"href": "/api/now/v1/context_doc_url/uninstall-msteams-integration",
			"icon": "document-outline"
		},
		{
			"label": gs.getMessage("Virtual Agent features supported in Teams"),
			"href": "/api/now/v1/context_doc_url/va-msteams-features-support",
			"icon": "open-link-right-fill"
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

	else if(context.pageParams.channel == "slack"){
	context.props_details.links = [
		{
			"label": gs.getMessage("Install Conversational Integration with Slack"),
			"href": "/api/now/v1/context_doc_url/va-slack-integration",
			"icon": "document-outline"
		},
		{
			"label": gs.getMessage("Remove Slack Integration"),
			"href": "/api/now/v1/context_doc_url/uninstall-slack-integration",
			"icon": "document-outline"
		},
		{
			"label": gs.getMessage("Virtual Agent features supported in Slack"),
			"href": "/api/now/v1/context_doc_url/va-slack-features-support",
			"icon": "open-link-right-fill"
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

else if(context.pageParams.channel == "workplace"){
	context.props_details.links = [
		{
			"label": gs.getMessage("Install Conversational Integration with Workplace"),
			"href": "/api/now/v1/context_doc_url/va-fb-workplace-integration",
			"icon": "document-outline"
		},
		
		{
			"label": gs.getMessage("Virtual Agent features supported in Workplace"),
			"href": "/api/now/v1/context_doc_url/va-workplace-features-support",
			"icon": "open-link-right-fill"
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
