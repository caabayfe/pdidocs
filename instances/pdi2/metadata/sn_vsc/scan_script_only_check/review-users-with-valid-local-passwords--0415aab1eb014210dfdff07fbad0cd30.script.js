(function (engine) {
    var grUser = new GlideRecord('sys_user');
    grUser.addQuery('user_password', '!=', 'NULL');
    grUser.query();
    while (grUser.next()) {
        var pHash = grUser.getValue('user_password');
		// Note passwords stored using legacy hashing algorithms are not expected to be present except
		//		on records where the password has not been updated over *very* many years. To ensure coverage, 
		// 		multiple hashing algorithms are examined by this check.
		// 		The "Rotate Passwords Stored with Outdated Hashing Algorithms" check can be used to identify user accounts
		//		that have a password stored with an outdated hashing algorithm.
		
        if (pHash.length == 28 /* valid sha-1 hash only */
		    || pHash.length == 28 * 2 + 4 /* valid salted sha-1 hash */
			|| pHash.length == 44 /* valid sha-256 hash only */
			|| pHash.length == 44 * 2 + 4 /* valid salted sha-256 hash */) {
            finding.setCurrentSource(grUser);
			finding.setValue('finding_details', grUser.user_name +'');
			finding.increment();
        }
    }
})(engine);
