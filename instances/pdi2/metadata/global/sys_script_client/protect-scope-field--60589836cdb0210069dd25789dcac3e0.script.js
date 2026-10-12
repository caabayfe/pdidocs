function onLoad() {
	// Scope is read-only after create
	if (!g_form.isNewRecord()) {
		// cannot edit an existing scope
		g_form.setReadOnly("scope", true);
	}
}
