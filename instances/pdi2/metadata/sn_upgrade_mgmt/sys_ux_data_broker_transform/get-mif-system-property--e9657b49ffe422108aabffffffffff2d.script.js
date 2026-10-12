function transform(input) {
    var currInstanceId = gs.getProperty('instance_id');
    var gr = new GlideRecord('sn_mif_instance');
    gr.addQuery('instance_id', currInstanceId);
    gr.query();
    if (gr.next()) {
        var isProd = gr.getValue('is_prod');

        if (isProd === '1') {
            return "Summary across instances";
        } else {
            return "Instance summary";
        }
    } else {
        var sysIsProd = gs.getProperty('sn_appclient.instance_type');

        if (sysIsProd == null || sysIsProd.toLowerCase() != 'production') {
            return "Instance summary";
        } else {
            return "Summary across instances";
        }
    }
}
