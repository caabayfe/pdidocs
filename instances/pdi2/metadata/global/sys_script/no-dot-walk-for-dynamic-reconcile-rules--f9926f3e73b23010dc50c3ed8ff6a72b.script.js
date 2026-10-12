var processor = new CmdbReconciliationProcessor();

current.attributes = processor.removeDotWalk(current.attributes);

gs.addInfoMessage(gs.getMessage("Dot-walking attributes not supported for dynamic reconciliation rules!"));

if (!current.attributes) {
	gs.addInfoMessage(gs.getMessage("Attributes cannot be empty"));
	current.setAbortAction(true);
}
