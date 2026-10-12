function transform(input) {
    var gr = new GlideRecord('sn_bm_client_configuration');
    gr.addQuery('name', 'opt_in_status');
    gr.query();
    var opt_in;
    if (gr.next()) {
        opt_in = (gr.value == "true");
    }
    return opt_in;
}
