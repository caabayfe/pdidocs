function onAfter(current, previous) {
	//gs.log("Started to handle a change in CI Relationship");
	var impactManager = new SNC.ImpactManager();
	impactManager.handleChangeInCiRelationship(current, previous);
}
