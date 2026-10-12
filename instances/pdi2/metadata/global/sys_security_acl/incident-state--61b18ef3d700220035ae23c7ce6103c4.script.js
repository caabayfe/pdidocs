var transaction = GlideTransaction.get();
answer = (transaction && transaction.getRequestParameter("incident.state") == "6" && transaction.getRequestParameter("sys_original.incident.state") != "6") || gs.hasRole('itil') || gs.hasRole('task_editor') || gs.hasRole('sn_incident_write');
