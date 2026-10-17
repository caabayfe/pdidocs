(function (engine) {
    var grUser = new GlideRecord('sys_user');
    grUser.addQuery('user_password', '!=', 'NULL');
    grUser.query();
    while (grUser.next()) {
        var pHash = grUser.getValue('user_password');
		if (pHash.length == 24 /* valid md5 hash only */ 
			|| pHash.length == 24 * 2 + 4 /* valid md5 hash with an md5 salt */
			|| pHash.length == 28 /* valid sha-1 hash only */
			|| pHash.length == 28 * 2 + 4 /* valid salted sha-1 hash */
		) {
            finding.setCurrentSource(grUser);
			finding.setValue('finding_details', grUser.user_name +' is currently configured with a local password that is stored using an outdated hashing algorithm.');
			finding.increment();
        }
    }
})(engine);
