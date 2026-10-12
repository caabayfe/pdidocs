(function(context) {
	context.props_details.links = [
		{
			"label": gs.getMessage("Install Conversational Integration with Microsoft Teams"),
			"href": "https://docs.servicenow.com/csh?topicname=virtual-agent-rn.html&version=page/release",
			"icon": "document-outline"
		},
		{
			"label": gs.getMessage("Remove Teams Integration"),
			"href": "https://docs.servicenow.com/csh?topicname=virtual-agent-landing-page.html&version=page/administer/virtual",
			"icon": "document-outline"
		},
		{
			"label": gs.getMessage("Virtual Agent features supported in Teams"),
			"href": "https://nowlearning.service-now.com/lxp?id=overview&sys_id=294efd5bdb1fe410785e2a59139619cc&type=course",
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
})(context);
