removeLicenseSoureForPendingUser();

function removeLicenseSoureForPendingUser() {
    if (GlidePluginManager.isZboot())
        return;

    try {
		if(!GlideTableDescriptor.isValid('sys_user_license_source') || !GlideTableDescriptor.isValid('sys_user_pending_license'))
			return;

		var userSetSubSyncHelp = new UserSetSubscriptionSyncHelper();
		var usrLicGR = userSetSubSyncHelp._getAllUserBasedLicense();
		if (!usrLicGR.hasNext()) {
			gs.log('No user based subscription');
			return;
		}
		while(usrLicGR.next()) {
			gs.log('Removing pending user refrence for subscription: ' + usrLicGR.getValue('name'));
			removePendingRef(usrLicGR);
		}
    } catch (ex) {
         gs.print("Failed to remove license soure refrence for pending user: " + ex);
      }
}

function removePendingRef(licenseGR) {

	try{
		var licenseSysId = licenseGR.getValue('sys_id');
		var pendingUserIds = getPendingUsersForLicense(licenseSysId);
		if (pendingUserIds.length > 0) {
			gs.log('Removing pending user reference from source for '+pendingUserIds.length+' users.');
			var licSrcGR = new GlideRecord('sys_user_license_source');
			licSrcGR.addQuery('license', licenseSysId);
			licSrcGR.addQuery('user', 'IN', pendingUserIds);
			licSrcGR.query();
			licSrcGR.deleteMultiple();
		}
	} catch (ex) {
         gs.print("Error processing for "+licenseGR.getValue('name')+" - "+ex);
    }
}

function getPendingUsersForLicense(licenseSysID) {
	var pendingUserSysIds = [];

	var userpendingGR = new GlideRecord('sys_user_pending_license');
	userpendingGR.addQuery('license', licenseSysID);
	userpendingGR.query();
	while (userpendingGR.next()) {
		pendingUserSysIds.push(userpendingGR.getValue('user'));
	}

	return pendingUserSysIds;
}
