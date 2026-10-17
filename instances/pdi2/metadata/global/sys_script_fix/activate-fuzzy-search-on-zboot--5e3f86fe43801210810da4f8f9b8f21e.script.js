if (pm.isZboot()) {
    var before = gs.getSession().getWorkflow();
    gs.getSession().setWorkflow(false);
    gs.setProperty("glide.ui.polaris.nav_filter_accuracy_score", 75);
    gs.getSession().setWorkflow(before);
}
