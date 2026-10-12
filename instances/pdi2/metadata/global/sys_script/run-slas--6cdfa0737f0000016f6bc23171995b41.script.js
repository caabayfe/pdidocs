// run the 2011 SLA Engine, if 'com.snc.sla.engine.version' is set to '2011' (default for new installs)
// run asynchronously, if 'com.snc.sla.process.async' is set to true. (default false, for new installs)
// doesn't run if the record has been updated from mobile (offline update), in this case it would need a manual repair
var offlineUpdate = new SLAOfflineUpdate(current);
if (!offlineUpdate.isOfflineUpdate() && !offlineUpdate.hasQueuedOfflineUpdate())
	new TaskSLAController(current).run();
else
	offlineUpdate.queue();
