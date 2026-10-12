(function(context) {
	context.props_details.links = [
		{
			"label": gs.getMessage("Read the Agent Chat release notes"),
			"href": "https://docs.servicenow.com/csh?topicname=workspace-rn.html&version=page/release",
			"icon": "document-outline"
		},
		{
			"label": gs.getMessage("Explore the Agent Chat product documentation"),
			"href": "https://docs.servicenow.com/csh?topicname=agent-workspace-chat.html&version=page/administer/workspace/concept/agent",
			"icon": "document-outline"
		},
		{
			"label": gs.getMessage("Agent Chat FAQ"),
			"href": "https://community.servicenow.com/community?id=community_article&sys_id=9659d9dddb69705011762183ca961923",
			"icon": "headset-outline"
		},
		{
			"label": gs.getMessage("Advanced Work Assignment FAQ"),
			"href": "https://community.servicenow.com/community?id=community_article&sys_id=4a982552db613090b1b102d5ca9619ae ",
			"icon": "circle-shuffle-outline"
		}
	].map(function(link) {
		return {
			"label": link.label,
			"value": {
				"href": link.href
			},
			"type": "external",
			"startsWith": {
				"icon": link.icon,
				"align": "center"
			}
		};
	});
})(context);
