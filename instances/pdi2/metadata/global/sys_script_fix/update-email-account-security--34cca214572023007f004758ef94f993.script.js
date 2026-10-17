(function() {
	function updateLabelAndHint(table, field) {
		var doc = new GlideRecord('sys_documentation');
		doc.addQuery('name', table);
		doc.addQuery('element', field);
		doc.addQuery('language', 'en');
		doc.query();

		if (!doc.next()) {
			gs.warn('Update email account security: unable to find documentation for ' + field);
			return;
		}
		
		var currentLabel = doc.getValue('label');
		if (currentLabel && currentLabel.length > 0) {
			doc.setValue('label', currentLabel + ' (Deprecated)');
		} else {
			gs.warn('Update email account security: existing label was empty');
		}
		
		doc.setValue('hint', 'This field has been deprecated, use Connection Security field to configure the security of the connection');
		doc.update();
		gs.info('Update email account security: updated hint for ' + field);
	}
	
	function setCompletionProperty() {
		gs.setProperty('glide.email.account_security_upgrade_complete', true);
	}
	
	if (pm.isZboot()) {
		setCompletionProperty();
		return;
	}
	
	updateLabelAndHint('sys_email_account', 'enable_ssl');
	updateLabelAndHint('sys_email_account', 'enable_tls');
	
	var emailAccountSecurity = new EmailAccountSecurity();
	var account = new GlideRecord('sys_email_account');
	account.query();
	while (account.next()) {
		emailAccountSecurity.migrate(account);
		account.update();
	}
	
	setCompletionProperty();
	gs.info('Update email account security: updating email accounts complete');
})();
