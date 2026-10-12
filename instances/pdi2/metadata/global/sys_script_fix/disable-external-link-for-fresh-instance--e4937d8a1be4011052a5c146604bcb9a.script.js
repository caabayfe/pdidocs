
if(pm.isZboot()) {
	gs.info("Disable Connect External Link System Properties for fresh instances.");
	var before = gs.getSession().getWorkflow();
	gs.getSession().setWorkflow(false);
	gs.setProperty("glide.ui.url.external", false);
	gs.setProperty("glide.ui.url.external.content", false);
	gs.getSession().setWorkflow(before);
}
