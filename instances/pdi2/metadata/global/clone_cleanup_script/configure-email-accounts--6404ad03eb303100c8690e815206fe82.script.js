if (GlidePluginManager.isRegistered('com.glide.email_accounts')) {
	var accounts = new GlideRecord('sys_email_account');

	if (accounts.isValid()) {
		accounts.query();

		//Assumption is that Email Accounts was enabled on source instance and not target instance.
		if (!accounts.hasNext() && (typeof EmailAccountsMigrator !== 'undefined')) {
			var migrator = new EmailAccountsMigrator();
			migrator.migrateEmailProperties();
		}
	}
}
