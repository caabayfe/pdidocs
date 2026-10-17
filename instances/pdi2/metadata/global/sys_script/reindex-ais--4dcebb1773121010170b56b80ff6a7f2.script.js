(function executeRule(current, previous /*null when async*/ ) {
    var scope = current.getValue("sys_scope");
    // dont care about global
    if (scope == 'global')
        return;

	var instanceId = current.sys_id;
	if ('delete' == current.operation())
		instanceId = current.sys_scope;

    new sn_ais.IndexEvent().aclInheritanceChange(current.operation(), instanceId, current.table);
})(current, previous);
