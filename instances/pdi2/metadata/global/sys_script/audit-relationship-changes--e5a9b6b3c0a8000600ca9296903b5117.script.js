if (new GlideAuditor(current.getRecordClassName(), current.sys_id).auditTable())
    new RelationshipAuditor().audit(current, sys_action);
