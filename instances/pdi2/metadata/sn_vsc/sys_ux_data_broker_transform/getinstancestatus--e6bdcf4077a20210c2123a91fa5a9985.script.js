function transform(input) {
    var instanceId = gs.getProperty('instance_id');
    var defaultTabId = '';
    var defaultDashboardId = '';
    var gr = new GlideRecord('sn_mif_instance');
    gr.addQuery('instance_id', instanceId);
    gr.query();
    if (gr.next()) {
        var isProd = gr.is_prod;
        if (isProd) {
            return true;
        }
    }
    return false;
}
