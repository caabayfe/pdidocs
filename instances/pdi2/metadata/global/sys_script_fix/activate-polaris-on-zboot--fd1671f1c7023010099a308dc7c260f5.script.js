if (pm.isZboot()) {
    var before = gs.getSession().getWorkflow();
    gs.getSession().setWorkflow(false);
    gs.setProperty("glide.ui.polaris.experience", true);
    gs.getSession().setWorkflow(before);
}
