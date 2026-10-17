//query two weeks old snapshots and check each one of those against sys_atf_step
//table to identify the unused ones and delete
var grSnapshot = new GlideRecord("sys_atf_snapshot");
grSnapshot.addEncodedQuery('sys_created_on<javascript:gs.daysAgo(14)');
grSnapshot.setTwoPhase(true);
grSnapshot.query();
while(grSnapshot.next()) {
	var snapshotId = grSnapshot.getUniqueValue();
	if(!snapshotHasReference(snapshotId))
		if(grSnapshot.deleteRecord())
			gs.log("ATF Snapshot Cleaner: Removed unused atf test step snapshot "+snapshotId);
}

function snapshotHasReference(snapshotSysId) {
	var grStep = new GlideRecord("sys_atf_step");
	grStep.addQuery("snapshot",snapshotSysId);
	grStep.setTwoPhase(true);
	grStep.setWorkflow(false);
	grStep.query();
	return grStep.hasNext();
}
