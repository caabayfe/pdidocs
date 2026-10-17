//Execute cds client schedule
// download records - this is synchronous
new global.CanonicalRepo().syncDataWithRepositoryByTable('sn_vsc_client_push_notifications');
// data downloaded
new sn_vsc.CustomerPushActionUtils().deactivateCPARecords();
new sn_vsc.CustomerPushActionUtils().activateCPARecords();
new sn_vsc.CustomerPushActionUtils().handleCPARecordUpdates();
