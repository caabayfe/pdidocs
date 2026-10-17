(function executeRule(current, previous /*null when async*/) {

	try {
		var finalShortcut = {};
		var defaultShortcut = JSON.parse(current.getElement('shortcut').getED().getDefault());
		var currentShortcut = JSON.parse(current.getValue('shortcut'));
		var previousShortcut = JSON.parse(previous.getValue('shortcut')) || defaultShortcut;

		if (Object.keys(currentShortcut).length === 1) {
			currentShortcut = UxKeyboardShortcutUtil.addMissingPlatformToShortcut(currentShortcut, previousShortcut, defaultShortcut);
		}

		var shortcutValidator = new UxKeyboardShortcutRulesProvider(currentShortcut, previousShortcut, defaultShortcut);

		if (!shortcutValidator.validate()) {
			current.setAbortAction(true);
			return;
		}

		finalShortcut = UxKeyboardShortcutUtil.convertShortcut(currentShortcut, previousShortcut);

		var shortcutGr = new GlideRecord('sys_ux_keyboard_shortcut');

		shortcutGr.addActiveQuery();
		shortcutGr.addQuery('definition', current.definition);
		shortcutGr.query();

		while (shortcutGr.next()) {
			if (current.sys_id.toString() !== shortcutGr.sys_id.toString()
				&& current.definition.toString()
				&& current.definition.toString() == shortcutGr.definition.toString()
				&& parseInt(current.order) === parseInt(shortcutGr.order)) {
				current.setAbortAction(true);
				gs.addErrorMessage(gs.getMessage('sys_ux_keyboard_shortcut "{0}" is attached to the same definition with order of "{1}". To override a shortcut, the order must be incremented.', [shortcutGr.sys_id, current.order]));
				return;
			}
		}

		if(finalShortcut) {
			current.shortcut = JSON.stringify(finalShortcut, null, 3);
		}
	} catch (e) {
		current.setAbortAction(true);
		gs.addErrorMessage(e);
		return;
	}

})(current, previous);
