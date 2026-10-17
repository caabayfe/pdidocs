disableSOWEmailNotifications('sysauto_script', '10bf5c71477261503fbe9e25126d43fa'); // Scheduled job 'Sidebar Discussion Reminder'
disableSOWEmailNotifications('sys_script', '980f295247b2e1503fbe9e25126d432f'); // BR on sys_cs_collab_record New sidebar discussion created
disableSOWEmailNotifications('sys_script', '70f2408a477e61503fbe9e25126d4385'); // BR on sys_cs_collab_member Requestor added to sidebar discussion

function disableSOWEmailNotifications(tableName, sysId) {
    var updateTableGr = new GlideRecord(tableName);
    if (updateTableGr.get(sysId)) {
        updateTableGr.active = false;
        if (updateTableGr.update()) {
            gs.setProperty("sn_sow_collab.uptake_sfs_notifications", "true");
        } else {
            gs.error("[sow-collaboration] SFS notification uptake failed!!");
        }
    }
}
