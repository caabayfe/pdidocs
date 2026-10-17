if (GlidePluginManager.isZboot()) {
    var prevWF = gs.getSession().getWorkflow();
    try {
        gs.getSession().setWorkflow(false);
        gs.setProperty("com.snc.incident.communicate_prb_workaround_to_inc_worknotes", true);
    } finally {
        gs.getSession().setWorkflow(prevWF);
    }
}
