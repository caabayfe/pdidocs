//Confirm if PA Job has a valid user
//Get all [PA AppSec] jobs
var constant = new sn_vsc.SecurityCenterConstants();
var pajob_gr = new GlideRecordSecure('sysauto_pa');
pajob_gr.addQuery('sys_package', constant.SCPackage);
pajob_gr.query();
while (pajob_gr.next()) {
    pajob_gr.run_as = getPASecUserId();
    pajob_gr.update();
}

//Create Security Center User is not present on zboot/upgrade
function getPASecUserId() {
    var user_id = '';
    var user_gr = new GlideRecordSecure('sys_user');
    if (!user_gr.get('user_name', 'securitycenter.user')) {
        user_gr.initialize();
        user_gr.first_name = "Security Center";
        user_gr.last_name = "Data Collection User";
        user_gr.user_name = "securitycenter.user";
        user_gr.locked_out = "false";
        user_gr.active = "true";
        user_gr.web_service_access_only = "true";
        user_gr.insert();
        user_id = user_gr.getValue('sys_id');
    } else {
        user_id = user_gr.sys_id;
    }

    return user_id;
}

//Evaluate Compliance state for all settings
var obj = new sn_vsc.VSCComplianceUtil();
obj.runComplianceCheck();

// get PA job and execute it.
var vsc_pa_job = new GlideRecord('sysauto_pa');
vsc_pa_job.addQuery('sys_package', constant.SCPackage);
vsc_pa_job.query();
while (vsc_pa_job.next()) {
    gs.executeNow(vsc_pa_job);
}
