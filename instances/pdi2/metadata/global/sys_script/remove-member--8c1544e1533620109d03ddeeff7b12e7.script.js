(function executeRule(current, previous /*null when async*/) {

	var rotaGr = current.rota.getRefRecord();
	var ocRota = new OnCallRotation();
	if (ocRota.isShiftOnNewEngine(rotaGr)) {
		new OnCallMemberUtils().handleRemoveUser(current);
	} else {
		gs.eventQueue('on_call_manage_members', current, 'remove', gs.getUserName() + '_' + gs.getUserID());
	}

})(current, previous);
