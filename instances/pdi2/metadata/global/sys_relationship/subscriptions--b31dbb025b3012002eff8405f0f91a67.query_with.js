(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	var userLicenseGR = new GlideRecord('sys_user_has_license');
	userLicenseGR.addQuery('user', parent.sys_id);
	userLicenseGR.query();
	var licenses = [];
	while (userLicenseGR.next()) {
		licenses.push(userLicenseGR.getValue('license'));
	}
	current.addQuery('license', licenses);
	current.orderBy('license');

})(current, parent);
