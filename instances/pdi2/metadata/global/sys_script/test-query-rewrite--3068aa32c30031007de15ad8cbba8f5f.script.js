function onBefore(current, previous) {
	var successful = new GlideQueryRewriteTest(current).runTest();
	if (!successful) {
		current.active = false;
		current.setAbortAction(true);
	}
}
