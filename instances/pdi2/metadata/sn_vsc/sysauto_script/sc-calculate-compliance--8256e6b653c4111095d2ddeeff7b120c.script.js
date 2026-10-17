var constants = new sn_vsc.SecurityCenterConstants();
//Evaluate complaince states of all hardening settings
var obj = new sn_vsc.VSCComplianceUtil();
obj.runComplianceCheck();

var gr = new GlideRecord('sn_vsc_instance_hardening_settings');
gr.addQuery('sys_updated_on','RELATIVE','GE@hour@ago@3');
gr.query();
if (gr.next()) {
    // get PA job and execute it.
    var vsc_pa_job = new GlideRecord('sysauto_pa');
    if (vsc_pa_job.get('sys_id', constants.SCPAJob)) {
        gs.executeNow(vsc_pa_job);
    }
}
