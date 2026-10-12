answer = execute();

function execute() {
	var permissions = new CommunityUser();
	if (current.isNewRecord()) {
		return true;
	}
	var editRoles = gs.getProperty(CommunityConstants.EDIT_ROLES_PROPERTY);
	if(gs.hasRole(editRoles) || gs.hasRole('sn_communities.admin')){
		return true;
	}

	var forumId = current.content.forum_id.toString(),
		contentTypeId = current.content.content_type.toString();
	return permissions.hasContentAccess(forumId, contentTypeId, 'Content_Read');
}
