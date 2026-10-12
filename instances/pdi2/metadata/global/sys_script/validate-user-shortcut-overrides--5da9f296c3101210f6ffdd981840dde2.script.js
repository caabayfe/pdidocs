(function executeRule(current, previous /*null when async*/) {
	const ERROR_SHORTCUT_DUPLICATE = 'Already used by {actionName}. Try another';
	const ERROR_UNSUPPORTED_CATEGORY = 'Unsupported override category';
	const ERROR_NOT_SINGLE_CHANGE = 'Only one shortcut change is allowed at a time';
	const ERROR_NO_MATCHING_SHORTCUT_FOUND = 'No matching keyboard shortcut found for the provided override';
	const ERROR_UNEXPECTED_VALIDATION = 'Unexpected validation error';

	const TABLE_SYS_UX_KEYBOARD_SHORTCUT = 'sys_ux_keyboard_shortcut';

	try {
		// Parse overrides json accounting for potential edge cases
		const currentOverrides = current.getValue('overrides') ? JSON.parse(current.getValue('overrides')) : {};
		const previousOverrides = previous && previous.getValue('overrides') ? JSON.parse(previous.getValue('overrides')) : {};

		if (current.getValue('category') !== 'shortcut') {
			UxUserOverrideShortcutsBRError.logError(ERROR_UNSUPPORTED_CATEGORY);
			current.setAbortAction(true);
			return;
		}

		// Check if current overrides has a shortcuts key, return if not.
		if (!currentOverrides) {
			return;
		}
		// Check if shortcuts were actually modified
		const currentShortcuts = currentOverrides;
		const previousShortcuts = previousOverrides || {};
		// Determine inserted, deleted, and modified shortcuts (see helper below)
		const changedShortcutSysIds = getChangedShortcutSysIds(currentShortcuts, previousShortcuts, !previous);
		const totalChanges = changedShortcutSysIds.inserted.length + changedShortcutSysIds.deleted.length + changedShortcutSysIds.modified.length;
		if (totalChanges === 0) {
			return;
		}
		if (totalChanges > 1) {
			UxUserOverrideShortcutsBRError.logError(ERROR_NOT_SINGLE_CHANGE);
			current.setAbortAction(true);
			return;
		}
		if (changedShortcutSysIds.deleted.length === 1) {
			return;
		}
		const shortcutSysId = changedShortcutSysIds.inserted[0] || changedShortcutSysIds.modified[0];
		const shortcutRecord = new GlideRecord(TABLE_SYS_UX_KEYBOARD_SHORTCUT);
		if (!shortcutRecord.get(shortcutSysId)) {
			UxUserOverrideShortcutsBRError.logError(ERROR_NO_MATCHING_SHORTCUT_FOUND);
			current.setAbortAction(true);
			return;
		}

		// Validates and formats changed shortcut override (helper function below)
		const formattedShortcut = validateAndFormatNewShortcut({
			shortcutSysId,
			currentShortcuts,
			previousShortcuts,
			shortcutRecord,
			current
		});
		if (!formattedShortcut) {
			current.setAbortAction(true);
			return;
		}

		// Replace the changed shortcut with its formatted version
		currentOverrides[shortcutSysId] = formattedShortcut;

		current.setValue('overrides', JSON.stringify(currentOverrides, null, 3));
	} catch (e) {
		current.setAbortAction(true);
		UxUserOverrideShortcutsBRError.logError(e);
		return;
	}

	/** Returns `null` if any of validation rules are violated. Otherwise returns formattedShortcut object. */
	function validateAndFormatNewShortcut(validationParams) {
		const { shortcutSysId, currentShortcuts, previousShortcuts, shortcutRecord, current } = validationParams;
		const defaultShortcut = JSON.parse(shortcutRecord.getElement('shortcut').getED().getDefault());
		const previousShortcut = previousShortcuts[shortcutSysId] || defaultShortcut;
		let currentShortcut = currentShortcuts[shortcutSysId];
		// Adds default missing platform (Mac / Windows) to shortcut
		if (Object.keys(currentShortcut).length === 1) {
			currentShortcut = UxKeyboardShortcutUtil.addMissingPlatformToShortcut(currentShortcut, previousShortcut, defaultShortcut);
		}
		// Generic shortcut rules
		const shortcutValidator = new UxKeyboardShortcutRulesProvider(currentShortcut, previousShortcut, defaultShortcut);
		if (!shortcutValidator.validate()) {
			return null;
		}
		// Ensure shortcut platforms are in agreement
		const formattedShortcut = UxKeyboardShortcutUtil.convertShortcut(currentShortcut, previousShortcut);

		// Check if the new shortcut is a duplicate within existing OOB and overrides.
		if (newShortcutOverrideIsDuplicate(previousShortcuts, formattedShortcut, shortcutSysId)) {
			current.setAbortAction(true);
			return;
		}

		return formattedShortcut;
	}

	/**
	 * Returns `true` if new shortcut key combo is present in the intersection of OOB and existing overriden shortcuts.
	 * @returns {boolean}
	 */
	function newShortcutOverrideIsDuplicate(existingOverridenShortcutBySysId, newShortcut, newShortcutSysId) {
		// Load OOB shortcuts.
		const keyboardShortcutsGr = new GlideRecord(TABLE_SYS_UX_KEYBOARD_SHORTCUT);
		keyboardShortcutsGr.query();
		const oobKeyboardShortcutBySysId = {};
		const oobNameBySysId = {};
		while (keyboardShortcutsGr.next()) {
			try {
				const shortcut = JSON.parse(keyboardShortcutsGr.getValue('shortcut'));
				const sysId = keyboardShortcutsGr.getValue('sys_id');
				oobKeyboardShortcutBySysId[sysId] = shortcut;
				oobNameBySysId[sysId] = keyboardShortcutsGr.getValue('name');
			} catch (error) {
				UxUserOverrideShortcutsBRError.logError(ERROR_UNEXPECTED_VALIDATION);
				return true;
			}
		}
		// Intersect OOB shortcuts with existing overriden shortcuts.
		const intersectedShortcutBySysId = {...oobKeyboardShortcutBySysId, ...existingOverridenShortcutBySysId};
		const conflictingSysId = hasDuplicateShortcut(intersectedShortcutBySysId, newShortcut, newShortcutSysId);
		if (conflictingSysId) {
			const actionName = oobNameBySysId[conflictingSysId] || conflictingSysId;
			UxUserOverrideShortcutsBRError.logError(ERROR_SHORTCUT_DUPLICATE.replace('{actionName}', '"' + actionName + '"'));
			return true;
        }
		return false;
	}

	/** Returns `true` if there is an existing override with the same key combination as the new override. */
	function hasDuplicateShortcut(existingShortcuts, newShortcut, newShortcutSysId) {
		if (!existingShortcuts) {
			return null;
		}
		const keys = Object.keys(existingShortcuts);
		if (keys.length === 0) {
			return null;
		}
		for (const key of keys) {
			if (newShortcutSysId == key) {
				continue;
			}
			const existingShortcut = existingShortcuts[key];
			if (UxKeyboardShortcutUtil.areShortcutsEqual(newShortcut.mac, existingShortcut.mac) &&
				UxKeyboardShortcutUtil.areShortcutsEqual(newShortcut.windows, existingShortcut.windows)
			) {
				return key;
			}
		}
		return null;
	}

    /**
     * Compares current (new) and previous (existing) shortcut override values. Determines and aggregates changed
     * IDs of deleted/inserted/modified shortcut overrides.
     *
     * @returns {ChangedShortcutSysIds}
     *
     * @typedef {Object} ChangedShortcutSysIds
     * @param {Array<String>} inserted
     * @param {Array<String>} deleted
     * @param {Array<String>} modified
     */
	function getChangedShortcutSysIds(currentShortcuts, previousShortcuts, isInsert) {
		const changedShortcutSysIds = {
			inserted: [],
			deleted: [],
			modified: []
		};
		if (isInsert) {
			changedShortcutSysIds.inserted = Object.keys(currentShortcuts);
		} else {
			// Check for inserted and modified shortcuts
			Object.keys(currentShortcuts).forEach(key => {
				if (!previousShortcuts[key]) {
					changedShortcutSysIds.inserted.push(key);
				} else {
					const curr = currentShortcuts[key] || {};
					const prev = previousShortcuts[key] || {};

					const currMac = curr.mac || {};
					const currWin = curr.windows || {};
					const prevMac = prev.mac || {};
					const prevWin = prev.windows || {};

					const currMacSorted = {};
					const currWinSorted = {};
					const prevMacSorted = {};
					const prevWinSorted = {};

					Object.keys(currMac).sort().forEach(k => { currMacSorted[k] = currMac[k]; });
					Object.keys(currWin).sort().forEach(k => { currWinSorted[k] = currWin[k]; });
					Object.keys(prevMac).sort().forEach(k => { prevMacSorted[k] = prevMac[k]; });
					Object.keys(prevWin).sort().forEach(k => { prevWinSorted[k] = prevWin[k]; });

					const currMacStr = JSON.stringify(currMacSorted);
					const currWinStr = JSON.stringify(currWinSorted);
					const prevMacStr = JSON.stringify(prevMacSorted);
					const prevWinStr = JSON.stringify(prevWinSorted);

					if (currMacStr !== prevMacStr || currWinStr !== prevWinStr) {
						changedShortcutSysIds.modified.push(key);
					}
				}
			});
			// Check for deleted shortcuts
			Object.keys(previousShortcuts).forEach(key => {
				if (!currentShortcuts[key]) {
					changedShortcutSysIds.deleted.push(key);
				}
			});
		}
		return changedShortcutSysIds;
	}

})(current, previous);
