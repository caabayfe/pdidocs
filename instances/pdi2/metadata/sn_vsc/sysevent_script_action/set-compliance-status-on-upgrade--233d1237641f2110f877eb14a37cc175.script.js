var scComplianceUtil = new sn_vsc.VSCComplianceUtil();       
scComplianceUtil.runComplianceCheck();   
var latestBaseline = 'Baseline v6.0';
var gr = new GlideRecord('sn_vsc_harc_compliance_status_lookup');
gr.query();
if (gr.getRowCount() == 0) { //If installing app-vsc for first time
    var grSet = new GlideRecord('sn_vsc_instance_hardening_settings');
    grSet.query();
    while (grSet.next()) {
        //Check if compliance status changed
        var grAudit = new GlideRecord('sys_audit');
        grAudit.addEncodedQuery('tablename=sn_vsc_instance_hardening_settings^fieldname=compliance_status^documentkey=' + grSet.sys_id);
        grAudit.orderByDesc('sys_created_on');
        grAudit.query();
        if (grAudit.next() && grSet.compliance_status != grAudit.newvalue) {
            scComplianceUtil.updateSettingsInsert(grSet.sys_id, grSet.compliance_status);
        }
        scComplianceUtil.updateComplianceStatusLookUp(grSet.sys_id, grSet.compliance_status);
    }
} else {
    //Handling upgrade scenario for existing baseline-settings which are not part of new baseline
    var grH = new GlideRecord('sn_vsc_instance_hardening_settings');
    grH.addQuery('harc_baseline_version', '!=', latestBaseline);
    grH.query();
    while (grH.next()) {
        //Check if compliance status changed
        var grA = new GlideRecord('sn_vsc_harc_compliance_status_lookup');
        grA.addQuery('harc_setting', grH.sys_id);
        grA.query();
        if (grA.next() && grH.compliance_status != grA.harc_compliance_status) {
            scComplianceUtil.updateComplianceStatusLookUp(grH.sys_id, grH.compliance_status);
            scComplianceUtil.updateSettingsInsert(grH.sys_id, grH.compliance_status);
        }
    }
}

//Handle upgarde scenario for new baseline-settings
var grHarc = new GlideRecord('sn_vsc_instance_hardening_settings');
grHarc.addQuery('harc_baseline_version', latestBaseline);
grHarc.query();
while (grHarc.next()) {
    scComplianceUtil.updateComplianceStatusLookUp(grHarc.sys_id, grHarc.compliance_status);
    scComplianceUtil.updateSettingsInsert(grHarc.sys_id, grHarc.compliance_status);
}

//Execute PA job for new comparison
var constants = new sn_vsc.SecurityCenterConstants();
var vsc_pa_job = new GlideRecord('sysauto_pa');
if (vsc_pa_job.get('sys_id', constants.SCPAJob)) {
    gs.executeNow(vsc_pa_job);
}
