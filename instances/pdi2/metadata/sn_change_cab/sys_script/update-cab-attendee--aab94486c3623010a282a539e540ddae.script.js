(function executeRule(current, previous /*null when async*/) {
	
	if (current.operation() == 'insert')
		gs.eventQueue("sn_change_cab.group_member.added", null, current.user, current.group);

	if (current.operation() == 'delete')
		gs.eventQueue("sn_change_cab.group_member.removed", null, current.user, current.group);

})(current, previous);
