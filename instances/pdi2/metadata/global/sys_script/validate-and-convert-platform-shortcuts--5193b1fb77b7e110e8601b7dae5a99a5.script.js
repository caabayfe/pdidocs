(function executeRule(current, previous /*null when async*/) {

	try {
		var defaultShortcut = JSON.parse(current.getElement('shortcut').getED().getDefault());
		var currentShortcut = JSON.parse(current.getValue('shortcut'));
		var previousShortcut = JSON.parse(previous.getValue('shortcut')) || defaultShortcut;

		// current.shortcut.changes() does not work for shortcut field, need to manually check here and exit early
		if (Object.keys(currentShortcut).length === 2 && UxKeyboardShortcutUtil.haveShortcutsChanged(currentShortcut, previousShortcut, defaultShortcut)) {
			return;
		}

		var finalShortcut = {};
		var shortcutValidator = new UxKeyboardShortcutRulesProvider(currentShortcut, previousShortcut, defaultShortcut);

		if (!shortcutValidator.validate(true)) {
			current.setAbortAction(true);
			return;
		}

		finalShortcut = UxKeyboardShortcutUtil.convertShortcut(currentShortcut, previousShortcut);

		current.shortcut = JSON.stringify(finalShortcut, null, 3);
	} catch (e) {
		current.setAbortAction(true);
		gs.addErrorMessage(e);
	}

})(current, previous);
