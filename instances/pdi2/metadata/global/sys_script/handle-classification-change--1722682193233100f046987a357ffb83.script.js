function onAfter(current, previous) {
   //This function will be automatically called when this rule is processed.
	var alertManager = new SNC.AlertManager();
	alertManager.addStep("Alert BR: Handle Classification Change (after)");
   gs.log("Classification has changed. Start.");
	var im = new SNC.ImpactManager();
	im.handleClassificationChanged(current);
}
