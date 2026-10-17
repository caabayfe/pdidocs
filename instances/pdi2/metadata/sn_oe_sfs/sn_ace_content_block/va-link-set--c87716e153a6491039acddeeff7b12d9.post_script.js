(function(context) {
	context.props_details.links = [
		{
			"label": gs.getMessage("Explore the Virtual Agent release notes"),
			"href": "https://docs.servicenow.com/csh?topicname=virtual-agent-rn.html&version=page/release",
			"icon": "document-outline"
		},
		{
			"label": gs.getMessage("Explore the Virtual Agent product documentation"),
			"href": "https://docs.servicenow.com/csh?topicname=virtual-agent-landing-page.html&version=page/administer/virtual",
			"icon": "document-outline"
		},
		{
			"label": gs.getMessage("Sign up for an online course"),
			"href": "https://nowlearning.service-now.com/lxp?id=overview&sys_id=294efd5bdb1fe410785e2a59139619cc&type=course",
			"icon": "graduation-cap-outline"
		},
		{
			"label": gs.getMessage("Learn from others in community forums"),
			"href": "https://community.servicenow.com/community?id=community_forum&sys_id=bf5abf94db54e3c42be0a851ca961915",
			"icon": "user-group-outline"
		},
		{
			"label": gs.getMessage("Download our deployment guide"),
			"href": "https://nowlearning.service-now.com/nowcreate?id=nc_asset&asset_id=0699ade71b0bfc50c229a9f6b04bcbd8",
			"icon": "key-outline"
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
