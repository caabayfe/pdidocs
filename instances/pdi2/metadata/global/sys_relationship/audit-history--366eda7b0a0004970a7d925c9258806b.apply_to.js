var a = new GlideAuditor(table_name, null);
answer = (table_name == 'sys_history_set') || a.auditTable();
