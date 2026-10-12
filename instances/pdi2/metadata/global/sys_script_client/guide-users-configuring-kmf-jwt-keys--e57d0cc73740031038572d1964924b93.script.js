function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (newValue == 'kmf' && !g_form.hasField('kmf_crypto_module')) {
		g_form.showFieldMsg('key_source', new GwtMessage().getMessage("The 'sn_kmf.cryptographic_auditor' role is required to configure a JWT Key with KMF"), 'warning');
    } else {
		g_form.hideFieldMsg('key_source');
	}
}
