var sysTriggerGa = new GlideAggregate("sys_trigger");
sysTriggerGa.addAggregate("COUNT");
sysTriggerGa.addEncodedQuery("nameLIKEML Cluster Detail purge");
sysTriggerGa.query();

if (sysTriggerGa.next() && sysTriggerGa.getAggregate("COUNT") > 2) {
    gs.log("ML Cluster Detail purge count: " + sysTriggerGa.getAggregate("COUNT"));
    gs.log("Skipping ML Cluster Detail purge as previous job is still in progress");
} else {
    gs.log("Purging of records from deleted solutions in ML Cluster Detail table initiated");
	new MlClusterDetailPurgeUtil().purgeDeletedSolutionRecords();
	gs.log("Purging of records from deleted solutions in ML Cluster Detail table completed");
	gs.log("ML Cluster Detail purge initiated");
    new MlClusterDetailPurgeUtil().executePurge();
    gs.log("ML Cluster Detail purge completed");
}
