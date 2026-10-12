(function executeRule(current, previous /*null when async*/) {
	try {
		const keyboardShortcuts = Object.keys(JSON.parse(current.keyboard_shortcuts || "{}"));

		if(keyboardShortcuts.length === 0) return;

		const isValid = UxFrameworkScriptables.isValidPageLevelKeyboardShortcuts(keyboardShortcuts);
		
		if(!isValid) {
			gs.addErrorMessage(gs.getMessage('Some entries are not valid page-level keyboard shortcuts. Please review and update them.'));
			current.setAbortAction(true);
		}
	} catch (error) {
		gs.log(`Error validating keyboard shortcuts: ${error.message}`, 'PageLevelKeyboardShortcutValidator');
	}
})(current, previous);
