if (pm.isZboot()) {
    var before = gs.getSession().getWorkflow();
    gs.getSession().setWorkflow(false);

    gs.setProperty("glide.ui.branding.works_with.is_visible", "true");

    gs.getSession().setWorkflow(before);
}
