var ga = new GlideAggregate('sn_vsc_instance_hardening_settings');
ga.addAggregate('SUM', 'risk_score');
ga.setGroup(false);
ga.addQuery('check.active', 'true');
ga.query();
var total = 0;
if (ga.next()) {
    total = ga.getAggregate('SUM', 'risk_score');
}

// calculate impact score of each hardening using formula (risk_score/total_score)*100
if (total > 0) {
    var gr = new GlideRecord('sn_vsc_instance_hardening_settings');
    gr.addQuery('check.active', 'true');
    gr.query();
    while (gr.next()) {
        var scoreImpact = ((gr.risk_score / total) * 100.00).toFixed(2);
        gr.setValue('score_impact', scoreImpact);
        gr.update();
    }
}
