var constants = new sn_vsc.SecurityCenterConstants();
//Evaluate compliance states of all hardening settings
var obj = new sn_vsc.VSCComplianceUtil();
obj.runComplianceCheck();

// get PA job and execute it.
var vsc_pa_job = new GlideRecord('sysauto_pa');
if (vsc_pa_job.get('sys_id', constants.SCPAJob)) {
    gs.executeNow(vsc_pa_job);
}
