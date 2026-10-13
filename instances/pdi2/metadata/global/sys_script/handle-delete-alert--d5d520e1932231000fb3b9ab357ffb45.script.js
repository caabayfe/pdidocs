function onAfter(current, previous) {
	var alertManager = new SNC.AlertManager();
	alertManager.addStep("Alert BR: Handle Delete alert (after)");
	gs.log("Started delete alert handling");
	var impactManager = new SNC.ImpactManager();
	impactManager.handleDeleteAlert(current, previous);
}
