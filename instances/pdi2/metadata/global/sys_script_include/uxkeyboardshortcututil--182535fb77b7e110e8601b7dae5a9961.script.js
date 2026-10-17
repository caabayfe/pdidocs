var UxKeyboardShortcutUtil = Class.create();

/** Adds Info Message in Glide Session. */
UxKeyboardShortcutUtil.addInfoMessage = function(message) {
	// Suppress info message when BR caller is User Override API for "shortcut" category.
	// Deliberately using "==" instead of "===" for comparison and "true" as a string and not a boolean.
	if (gs.getSession().getClientData('UXF_USER_OVERRIDE_SHORTCUTS_SUPPRESS_INFO_MESSAGE') == 'true') {
		return;
	}
	gs.addInfoMessage(gs.getMessage(message));
};

UxKeyboardShortcutUtil.transformKeyToUpperCase = function(shortcut) {
	var transformedShorcut = {};

	for (var key in shortcut) {
		if (key === "key") {
			transformedShorcut[key] = shortcut[key].toUpperCase();
			continue;
		}
		transformedShorcut[key] = shortcut[key];
	}

	return transformedShorcut;
};

// current.shortcut.changes() always returns true so we need to manually validate that shortcuts have indeed changed so BRs can exit early
UxKeyboardShortcutUtil.haveShortcutsChanged = function(currentShortcut, previousShortcut, defaultShortcut) {
	return UxKeyboardShortcutUtil.areShortcutsEqual(currentShortcut.mac, previousShortcut.mac)
		&& !UxKeyboardShortcutUtil.areShortcutsEqual(currentShortcut.mac, defaultShortcut.mac)
		&& UxKeyboardShortcutUtil.areShortcutsEqual(currentShortcut.windows, previousShortcut.windows)
		&& !UxKeyboardShortcutUtil.areShortcutsEqual(currentShortcut.windows, defaultShortcut.windows);
};

UxKeyboardShortcutUtil.areShortcutsEqual = function(shortcut1, shortcut2) {
	var transformedShortcut1 = UxKeyboardShortcutUtil.transformKeyToUpperCase(shortcut1);
	var transformedShortcut2 = UxKeyboardShortcutUtil.transformKeyToUpperCase(shortcut2);

	return JSUtil.areEqual(transformedShortcut1, transformedShortcut2);
};

// Auto convert the modified shortcut of one platform to another, after the validation of shortcut
UxKeyboardShortcutUtil.convertShortcut = function(currentShortcut, previousShortcut) {
	var autoConversionEnabled = !GlideProperties.getBoolean('glide.uxf.disable_shortcut_auto_conversion', false);

	if (!autoConversionEnabled) {
		// Auto-conversion has been disabled and shortcuts have been validated, use currentShortcut
		return currentShortcut;
	}

	if (!currentShortcut.windows || (currentShortcut.mac && !UxKeyboardShortcutUtil.areShortcutsEqual(currentShortcut.mac, previousShortcut.mac))) {
		// Windows shortcut was deleted or Mac shortcut was changed.
		return UxKeyboardShortcutUtil.convertMacToWindows(currentShortcut.mac);
	}

	// Mac shortcut was deleted or Windows shortcut was changed.
	return UxKeyboardShortcutUtil.convertWindowsToMac(currentShortcut.windows);

};

// Regenerate Mac from Windows shortcut.
UxKeyboardShortcutUtil.convertWindowsToMac = function(windowsShortcut) {
	var transformedWindowsShortcut = UxKeyboardShortcutUtil.transformKeyToUpperCase(windowsShortcut);

	UxKeyboardShortcutUtil.addInfoMessage('Mac shortcut auto-converted');

	return {
		mac: {
			altKey: transformedWindowsShortcut.altKey,
			metaKey: transformedWindowsShortcut.ctrlKey,
			shiftKey: transformedWindowsShortcut.shiftKey,
			key: transformedWindowsShortcut.key
		},
		windows: transformedWindowsShortcut
	};
};

// Regenerate Windows from Mac shortcut.
UxKeyboardShortcutUtil.convertMacToWindows = function(macShortcut) {
	var transformedMacShortcut = UxKeyboardShortcutUtil.transformKeyToUpperCase(macShortcut);

	UxKeyboardShortcutUtil.addInfoMessage('Windows shortcut auto-converted');

	return {
		mac: transformedMacShortcut,
		windows: {
			altKey: transformedMacShortcut.altKey,
			ctrlKey: transformedMacShortcut.metaKey,
			shiftKey: transformedMacShortcut.shiftKey,
			key: transformedMacShortcut.key
		}
	};
};

// Adding the missing platform key-value pair, before the validation of shortcut
UxKeyboardShortcutUtil.addMissingPlatformToShortcut = function(currentShortcut, previousShortcut, defaultShortcut) {
	if(!currentShortcut.windows) {
		// Windows shortcut was deleted by user. Add the "previously saved or default" windows shortcut
		return {
			mac: currentShortcut.mac,
			windows: previousShortcut.windows || defaultShortcut.windows
		};
	}

	// Mac shortcut was deleted by user. Add the "previously saved or default" mac shortcut
	return {
		mac: previousShortcut.mac || defaultShortcut.mac,
		windows: currentShortcut.windows
	};
};

UxKeyboardShortcutUtil.prototype = {
    type: 'UxKeyboardShortcutUtil'
};
