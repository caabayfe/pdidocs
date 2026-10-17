if (!pm.isZboot()) {
    var gr = new GlideRecord("par_dashboard_widget");
    gr.addNotNullQuery("visualization");
    gr.query();
    while (gr.next()) {
        gs.info('Upgrade: Setting stored component on ' + gr.getUniqueValue() + ' to ' + gr.visualization);
        gr.stored_component = gr.visualization;
        gr.visualization = undefined;
        if (!gr.update()) {
            gs.info('Upgrade: Failed to update ' + gr.getUniqueValue());
        }
    }
}
