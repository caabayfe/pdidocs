if (new GlideAuditor(current.getRecordClassName(), current.sys_id).auditTable() &&
    !(sys_action == 'update' && 
	!gs.nil(current.parent) && !current.parent.changes() && 
	!gs.nil(current.child) && !current.child.changes() && 
	!gs.nil(current.type) && !current.type.changes()) &&
    !SNC.CMDBUtil.isExcludedFromBR(current.parent.sys_class_name) &&
    !SNC.CMDBUtil.isExcludedFromBR(current.child.sys_class_name))
    new RelationshipAuditor().audit(current, sys_action);
