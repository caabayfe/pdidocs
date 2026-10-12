(function executeRule(current, previous) {
	var svc = new sn_usg_ns.IdentityGroupServiceAPI();

	if (current.operation() == 'delete') {
		svc.removeMember('mid-all', 'ecc_agent', current.sys_id.toString());
		return;
	}

	if (current.validated.changesTo(true))
		svc.ensureMemberAndGroup('mid-all', 'system', 'ecc_agent', current.sys_id.toString());
	else if (current.validated.changesTo(false))
		svc.removeMember('mid-all', 'ecc_agent', current.sys_id.toString());
})(current, previous);
