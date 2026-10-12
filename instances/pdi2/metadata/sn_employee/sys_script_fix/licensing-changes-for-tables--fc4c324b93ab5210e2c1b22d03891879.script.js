// Update sn_employee_app_access_criteria table
function updateAppAccessCriteria() {
    var grDict = new global.GlideQuery('sys_dictionary')
        .where('name', 'sn_employee_app_access_criteria')
        .where('element', 'criteria')
        .updateMultiple({
            dependent: "table",
            attributes: "readable=true,allow_order=true,show_condition_count=true"
        });
}

var OOB_HR_APP_CRITERIA_SYS_ID = '93cd958dff57521002a7ffffffffff62';
function updateAppAccessRecords() {
    var appAccessGr = new GlideRecord('sn_employee_app_access_criteria');
    appAccessGr.addQuery('sys_id', '!=', OOB_HR_APP_CRITERIA_SYS_ID);
    appAccessGr.addEncodedQuery('tableISEMPTY');
    appAccessGr.setValue('table', 'sn_employee_profile');
    appAccessGr.updateMultiple();
}

try {
    updateAppAccessCriteria();
    updateAppAccessRecords();
} catch (ex) {
    gs.error('Fix Script - Licensing changes for tables Failed ' + ex);
    throw ex;
}
