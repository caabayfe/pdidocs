var historyId = GlideGuid.generate(null);
var worker = new GlideSyncWorker(current.instance_id, historyId, 'pull');

worker.setProgressName(gs.getMessage("Pulling latest versions from {0} ({1})", [current.name, current.url]));
worker.setBackground(true);
worker.start();

action.setRedirectURL("sync_history_status.do?sysparm_pworker_sysid=" + worker.getProgressID()
	+ "&sysparm_update_source_sysid=" + current.sys_id
	+ "&sysparm_sync_sysid=" + historyId
	+ "&sysparm_type=pull");
