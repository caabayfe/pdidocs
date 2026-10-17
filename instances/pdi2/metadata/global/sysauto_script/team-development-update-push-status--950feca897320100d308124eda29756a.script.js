// This completes updating the status of a push if a child is
//    restarted before a staged push is completed.
var syncChangeTask = new SncSyncChangeTask();
syncChangeTask.retrieveAndUpdateSyncChangeState()
