function transform(input) {
    var dates = [];
    var gr = new GlideRecord('sn_vsc_hardening_compliance_scores');
    gr.orderByDesc('harc_collected');
    gr.query();
    while (gr.next()) {
        var date = gr.getDisplayValue('harc_collected');
        dates.push(date);
    }
    return dates;
}
