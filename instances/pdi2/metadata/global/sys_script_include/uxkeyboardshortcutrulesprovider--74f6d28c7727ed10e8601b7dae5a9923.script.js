var UxKeyboardShortcutRulesProvider = Class.create();
UxKeyboardShortcutRulesProvider.prototype = {
    DENY_LIST: "denyList",
    DEFAULT: "default",

    initialize: function(currentShortcut, previousShortcut, defaultShortcut) {
        var validUniversalKeys = ['shiftKey', 'altKey', 'key'];

        this.defaultShortcut = defaultShortcut;
        this.currentShortcut = currentShortcut;
        this.previousShortcut = previousShortcut || defaultShortcut;
        this.shiftEnabledSpecialCharacters = /[!@#$%^&*()_+{}|:"<>?~]/;
        this.validMacKeys = ['metaKey'].concat(validUniversalKeys).sort();
        this.validWindowsKeys = ['ctrlKey'].concat(validUniversalKeys).sort();
        // Intentionally leaving out Shift key here as the Shift key must be used in conjunction with another modifier key
        this.requiredMacKeyModifiers = ['altKey', 'metaKey'];
        this.requiredWindowsKeyModifiers = ['altKey', 'ctrlKey'];
    },

    hasWindowsShortcutChanged: function() {
        return !this.currentShortcut.windows || !UxKeyboardShortcutUtil.areShortcutsEqual(this.currentShortcut.windows, this.previousShortcut.windows);
    },

    hasMacShortcutChanged: function() {
        return !this.currentShortcut.mac || !UxKeyboardShortcutUtil.areShortcutsEqual(this.currentShortcut.mac, this.previousShortcut.mac);
    },

    invalidKeyValueFormat: function(value) {
        return typeof value !== 'string' || JSUtil.nil(value) || value.length > 1 || value === ' ';
    },

    validateShortcutValues: function(shortcut) {
        if (shortcut) {
            var keys = Object.keys(shortcut);

            for (var i = 0; i < keys.length; i++) {
                var value = shortcut[keys[i]];
                if ((keys[i] !== "key" && typeof value !== 'boolean') || (keys[i] === "key" && this.invalidKeyValueFormat(value))) {
                    return false;
                }
            }
        }

        return true;
    },

    /**
     * Returns true if at least one required modifier is enabled in shortcut
     * @param {Array<String>} requiredModifiers
     * @param {Object} shortcut
     * @returns {Boolean}
     */
    hasOneRequiredModifierEnabled: function(requiredModifiers, shortcut) {
        for (var i = 0; i < requiredModifiers.length; i++) {
            if (shortcut[requiredModifiers[i]] === true) {
                return true;
            }
        }
        return false;
    },

    getRules: function() {
        var self = this;
        // Rules engine to validate keyboard shortcut metadata
        return [{
                // Shortcuts have not been modified from default value
                errorCondition: function() {
                    return UxKeyboardShortcutUtil.areShortcutsEqual(self.defaultShortcut.mac, self.currentShortcut.mac) &&
                        UxKeyboardShortcutUtil.areShortcutsEqual(self.defaultShortcut.windows, self.currentShortcut.windows);
                },
                message: gs.getMessage("Must change at least one platform shortcut!"),
                type: this.DEFAULT
            },
            {
                // Shortcut deleted and remaining is set to default or shortcut changed to default value
                errorCondition: function() {
                    return (self.hasWindowsShortcutChanged() && UxKeyboardShortcutUtil.areShortcutsEqual(self.defaultShortcut.windows, self.currentShortcut.windows)) ||
                        (self.hasMacShortcutChanged() && UxKeyboardShortcutUtil.areShortcutsEqual(self.defaultShortcut.mac, self.currentShortcut.mac)) ||
                        (!self.currentShortcut.mac && UxKeyboardShortcutUtil.areShortcutsEqual(self.defaultShortcut.windows, self.currentShortcut.windows)) ||
                        (!self.currentShortcut.windows && UxKeyboardShortcutUtil.areShortcutsEqual(self.defaultShortcut.mac, self.currentShortcut.mac));
                },
                message: gs.getMessage("Shortcuts cannot be set to default values!"),
                type: this.DEFAULT
            },
            {
                // Shortcuts cannot be empty
                errorCondition: function() {
                    return !self.currentShortcut.mac && !self.currentShortcut.windows;
                },
                message: gs.getMessage("Must define at least one platform shortcut!"),
                type: this.DEFAULT
            },
            {
                // Only mac and windows shortcuts are supported
                errorCondition: function() {
                    var keys = Object.keys(self.currentShortcut);
                    if (keys.length > 2) {
                        return true;
                    }
                    for (var i = 0; i < keys.length; i++) {
                        if (keys[i] !== "mac" && keys[i] !== "windows") {
                            return true;
                        }
                    }
                },
                message: gs.getMessage("Shortcut field must only contain mac and/or windows keys!"),
                type: this.DEFAULT
            },
            {
                // Windows shortcut cannot contain metaKey
                errorCondition: function() {
                    return self.currentShortcut.windows && Object.keys(self.currentShortcut.windows).indexOf('metaKey') !== -1;
                },
                message: gs.getMessage("metaKey is not allowed for Windows shortcuts."),
                type: this.DEFAULT
            },
            {
                // Mac shortcut cannot contain ctrlKey
                errorCondition: function() {
                    return self.currentShortcut.mac && Object.keys(self.currentShortcut.mac).indexOf('ctrlKey') !== -1;
                },
                message: gs.getMessage("ctrlKey is not allowed for Mac shortcuts."),
                type: this.DEFAULT
            },
            {
                // Validation to ensure only supported keys are used for Windows
                errorCondition: function() {
                    return self.currentShortcut.windows && !JSUtil.areEqual(Object.keys(self.currentShortcut.windows).sort(), self.validWindowsKeys);
                },
                message: gs.getMessage("Windows shortcuts must only contain {0}", self.validWindowsKeys.join(', ')),
                type: this.DEFAULT
            },
            {
                // Validation to ensure only supported keys are used for Mac
                errorCondition: function() {
                    return self.currentShortcut.mac && !JSUtil.areEqual(Object.keys(self.currentShortcut.mac).sort(), self.validMacKeys);
                },
                message: gs.getMessage("Mac shortcuts must only contain {0}", self.validMacKeys.join(', ')),
                type: this.DEFAULT
            },
            {
                // Validate that the modifiers are of type boolean and key is of type string
                errorCondition: function() {
                    return (self.hasMacShortcutChanged() && !self.validateShortcutValues(self.currentShortcut.mac)) ||
                           (self.hasWindowsShortcutChanged() && !self.validateShortcutValues(self.currentShortcut.windows));
                },
                message: gs.getMessage("Modifier keys must be a boolean (true/false) & key must be a string!"),
                type: this.DEFAULT
            },
            {
                // Validate that at least one required modifier is enabled for Mac
                errorCondition: function() {
                    return self.hasMacShortcutChanged() &&
                        !self.hasOneRequiredModifierEnabled(self.requiredMacKeyModifiers, self.currentShortcut.mac);
                },
                message: gs.getMessage("Mac shortcuts require at least one enabled modifier: {0}", self.requiredMacKeyModifiers.join(', ')),
                type: this.DEFAULT
            },
            {
                // Validate that at least one required modifier is enabled for Windows
                errorCondition: function() {
                    return self.hasWindowsShortcutChanged() &&
                        !self.hasOneRequiredModifierEnabled(self.requiredWindowsKeyModifiers, self.currentShortcut.windows);
                },
                message: gs.getMessage("Windows shortcuts require at least one enabled modifier: {0}", self.requiredMacKeyModifiers.join(', ')),
                type: this.DEFAULT
            },
            {
                // Shift-enabled special characters cannot be used
                errorCondition: function() {
                    var macShortcutKey = self.currentShortcut.mac.key;
                    var windowsShortcutKey = self.currentShortcut.windows.key;

                    return self.shiftEnabledSpecialCharacters.test(macShortcutKey) || self.shiftEnabledSpecialCharacters.test(windowsShortcutKey);
                },
                message: gs.getMessage("Shift-enabled special characters are not allowed!"),
                type: this.DEFAULT
            },
            {
                // Validate that both supported platforms have not been changed.
                errorCondition: function() {
                    var autoConversionEnabled = !GlideProperties.getBoolean('glide.uxf.disable_shortcut_auto_conversion', false);

                    return autoConversionEnabled &&
                        self.hasMacShortcutChanged() &&
                        self.hasWindowsShortcutChanged();
                },
                message: gs.getMessage("Conflicting modifications detected: Simultaneous modification of both platform shortcuts is not allowed. Please allow auto-conversion to take place. "),
                type: this.DEFAULT
            },
            {
                // Validate shortcut doesn't exist in deny list
                errorCondition: function() {
                    var denyListGr = new GlideRecord('sys_ux_keyboard_shortcut_deny_list');

                    denyListGr.addActiveQuery();
                    denyListGr.query();

                    while (denyListGr.next()) {
                        var denyShortcut = JSON.parse(denyListGr.shortcut);

                        if (
                            self.hasMacShortcutChanged() &&
                            UxKeyboardShortcutUtil.areShortcutsEqual(denyShortcut.mac, self.currentShortcut.mac) &&
                            !self.hasWindowsShortcutChanged()) {
                            // Mac changed and new shortcut is in deny list
                            return true;
                        } else if (
                            self.hasWindowsShortcutChanged() &&
                            UxKeyboardShortcutUtil.areShortcutsEqual(denyShortcut.windows, self.currentShortcut.windows) &&
                            !self.hasMacShortcutChanged()
                        ) {
                            // Windows changed and new shortcut is in deny list
                            return true;
                        }
                    }

                    return false;
                },
                message: gs.getMessage("Shortcut reserved by system. Try another."),
                type: this.DENY_LIST
            }
        ];
    },

    validate: function(skipDenyList) {
        var rules = this.getRules();

        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];

            if (skipDenyList && rule.type === this.DENY_LIST) {
                continue;
            }

            if (rule.errorCondition()) {
                UxUserOverrideShortcutsBRError.logError(rule.message);
                return false;
            }
        }

        return true;
    },

    type: 'UxKeyboardShortcutRulesProvider'
};
