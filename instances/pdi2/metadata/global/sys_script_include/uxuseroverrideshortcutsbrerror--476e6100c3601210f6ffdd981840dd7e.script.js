var UxUserOverrideShortcutsBRError = Class.create();

/**
 * Logs BR validation error using either:
 * - GlideSession ClientData API, if a record is modified by the User Override package;
 * - GlideSession ErrorMessage API, if a caller is UI16.
 */
UxUserOverrideShortcutsBRError.logError = function(errorMessage) {
	// Deliberately using "==" instead of "===" for comparison.
	if (gs.getSession().getClientData('UXF_USER_OVERRIDE_SHORTCUTS_BUSINESS_RULE_CALLER') == 'API') {
		gs.getSession().clearClientData('UXF_USER_OVERRIDE_SHORTCUTS_BUSINESS_RULE_CALLER');
		gs.getSession().putClientData('UXF_USER_OVERRIDE_SHORTCUTS_BUSINESS_RULE_ERROR', errorMessage);
		return;
	}
	gs.addErrorMessage(errorMessage);
};
