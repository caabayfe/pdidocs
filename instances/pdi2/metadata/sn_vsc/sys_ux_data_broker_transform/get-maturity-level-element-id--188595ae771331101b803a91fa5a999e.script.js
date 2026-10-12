function transform(input) {
    var gr = new GlideRecord('sys_choice');
    gr.addEncodedQuery('name=sn_vsc_best_practice_configurations^element=maturity_level^label=' + GlideStringUtil.escapeQueryTermSeparator(input.element_name), true);
    gr.query();
    var res = {};
    if (gr.next()) {
        res.sysId = gr.getValue('sys_id').toString();
    }
    return res;
}
