function onAfter(current, previous) {
	gs.log("Started to handle a change in Impact Infra Relashionship Definition");
	var impactManager = new SNC.ImpactManager();
	impactManager.handleChangeInImpactInfraRelDef(current, previous);
   
}
