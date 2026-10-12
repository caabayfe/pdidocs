var searchLicensedProfiles = Class.create();
searchLicensedProfiles.prototype = Object.extendsObject(sn_employee.searchLicensedProfilesSNC, {

	type: 'searchLicensedProfiles'
});

// Object.extendsObject only clones prototype from parent class
// Clone missing non-prototype properties from parent class
(function() {
	for (var property in sn_employee.searchLicensedProfilesSNC)
		if (!searchLicensedProfiles.hasOwnProperty(property))
			searchLicensedProfiles[property] = sn_employee.searchLicensedProfilesSNC[property];
})();
