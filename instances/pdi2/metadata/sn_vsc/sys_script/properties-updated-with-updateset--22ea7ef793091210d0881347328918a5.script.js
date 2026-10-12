(function executeRule(current, previous /*null when async*/ ) {
    var constants = new sn_vsc.SecurityCenterConstants();
    var gr = new GlideRecord('sys_update_xml');
    var encodedQ = 'remote_update_set=' + current.sys_id + '^type=System Property';
    gr.addEncodedQuery(encodedQ);
    gr.query();
    if (gr.next()) {
        //Evaluate complaince states of all hardening settings
        var obj = new sn_vsc.VSCComplianceUtil();
        obj.runComplianceCheck();

        // get PA job and execute it.
        var vsc_pa_job = new GlideRecord('sysauto_pa');
        if (vsc_pa_job.get('sys_id', constants.SCPAJob)) {
            gs.executeNow(vsc_pa_job);
        }
    }
})(current, previous);
