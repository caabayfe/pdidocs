answer = getCompleteBPCount();

function getCompleteBPCount() {
    var completedBP = 0;
    var gr = new GlideRecord('sn_vsc_best_practice_configurations');
    gr.addEncodedQuery('status=completed');
    gr.query();
    while (gr.next()) {
        var grSA = new GlideRecord('sys_audit');
        grSA.addEncodedQuery("tablename=sn_vsc_best_practice_configurations^fieldname=status^newvalue=completed^sys_created_onONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()^documentkey=" + gr.sys_id);
        grSA.query();
        if (grSA.hasNext()) {
            completedBP++;
        }
    }
    return completedBP;
}
