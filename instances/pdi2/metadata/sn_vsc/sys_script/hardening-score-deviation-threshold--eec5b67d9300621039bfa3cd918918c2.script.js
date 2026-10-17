(function executeRule(current, previous /*null when async*/ ) {
    //find top two scores difference 
    var gr = new GlideRecord('sn_vsc_hardening_compliance_scores');
    gr.orderByDesc('sys_created_on');
    gr.setLimit(2);
    gr.query();
    if (gr.getRowCount() > 1) {
        gr.next();
        var score1 = gr.getValue('harc_score');
        gr.next();
        var score2 = gr.getValue('harc_score');
        if (score1 != score2)
            gs.eventQueue('sn_vsc.sec.hardening.score.changed', null, score1, score2);
    }
})(current, previous);
