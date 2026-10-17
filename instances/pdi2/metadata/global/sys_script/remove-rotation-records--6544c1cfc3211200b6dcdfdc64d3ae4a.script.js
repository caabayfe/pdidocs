(function executeRule(current, previous /*null when async*/) {
	var overridesLink = new OCRotaCleaner().getOverridesUrl(current.user.getRefRecord(), {"type": "on_call"});
	var link = new OnCallRotation().getRotaMembersByUserAndGroupURL(current.user, current.group);
	gs.eventQueue("roster_group_member.deleted", null, current.user + ',' + current.group, current.group.manager);
	gs.addInfoMessage(gs.getMessage("Please note that user {0} has been removed from group {1} which has <a href='{2}'>rota records</a> that should be modified. <a href='{3}'>Override records</a> for this user should also be considered.", [current.user.name, current.group.getDisplayValue(), link, overridesLink]));

})(current, previous);
