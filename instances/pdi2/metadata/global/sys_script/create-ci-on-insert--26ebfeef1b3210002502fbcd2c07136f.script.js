try {
	(new AssetandCI()).createCI(current);
} catch (err) {
	gs.addErrorMessage(err);
	current.setAbortAction(true);
}
