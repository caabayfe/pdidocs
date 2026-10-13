gs.log(event.parm1 + ': script action started', 'on_call_manage_members');

if (event.parm1 == 'add')
	new OnCallMemberUtils().handleAddMember(current);
else if (event.parm1 == 'remove')
    new OnCallMemberUtils().handleRemoveUser(current);
else if (event.parm1 == 'move')
	new OnCallMemberUtils().handleMoveMember(current);
else
	gs.error('INVALID VALUE FOR PARM1. Accepted values are add, remove, move');
