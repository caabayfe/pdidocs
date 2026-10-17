var ThemeSystemTokenUpdateScript = Class.create();

ThemeSystemTokenUpdateScript.Constants = {
    "M2M_THEME_STYLE_TABLE_NAME": Constants.M2M_THEME_STYLE_TABLE_NAME,
    "THEME_COLUMN_FIELD": Constants.THEME_COLUMN_FIELD,
    "STYLE_COLUMN_FIELD": Constants.STYLE_COLUMN_FIELD,
    "SYS_UX_STYLE_TABLE_NAME": Constants.SYS_UX_STYLE_TABLE_NAME,
    "SYS_ID_COLUMN_FIELD": Constants.SYS_ID_COLUMN_FIELD,
    "SYS_UX_THEME_TABLE_NAME": Constants.SYS_UX_THEME_TABLE_NAME,
    "SYS_UX_THEME_CUSTOMIZATION_TABLE_NAME": Constants.SYS_UX_THEME_CUSTOMIZATION_TABLE_NAME
};

ThemeSystemTokenUpdateScript.validateIfSystemTokenUpdateNeeded = function(themeId) {
    try {
        if (gs.nil(themeId)) {
            throw new Error("Provided theme id is not valid.");
        }
        const customizationGR = ThemeRepository.getCustomizationGR(themeId);
        if (!customizationGR.isValidRecord()) {
            throw new Error('Customization record is not created for this theme, please contact your administrator');
        }

        const customizationObj = ThemeRepository.transformCustomizationStrToObject(customizationGR.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD));

        return customizationObj && customizationObj?.systemTokenVersion !== Constants.SYSTEM_TOKEN_VERSION;
    } catch (err) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error updating style record version: ' + err.toString());
    }
};

ThemeSystemTokenUpdateScript.mapOldThemeHooksToNewThemeHooks = function(styleRecord, hookMap) {
    if (!styleRecord || !hookMap) return;
    for (var oldKey in hookMap) {
        if (!hookMap.hasOwnProperty(oldKey)) continue;
		
        var newKey = hookMap[oldKey];
        if (!newKey || oldKey === newKey) continue;

        // If the source doesn't exist, nothing to map
        if (!styleRecord.hasOwnProperty(oldKey)) continue;

        var oldVal = styleRecord[oldKey];

        // Avoid self-reference like styleRecord[oldKey] === newKey
        if (oldVal === newKey) continue;

        // Move value and rewire alias
        styleRecord[newKey] = oldVal;
        styleRecord[oldKey] = newKey;
    }
};

ThemeSystemTokenUpdateScript.updateCustomizationForStyleHooks = function(customizationObj = {}) {
    if (customizationObj.colors?.componentOverrides) {
        customizationObj.colors.componentOverrides = ThemeSystemTokenUpdateScript.mapCustomizationHooksForNewThemeHooks(
            customizationObj.colors.componentOverrides, Constants.OLD_HOOKS_TO_NEW_HOOKS_MAPPING['colors']['properties']);
    }
    if (customizationObj.shapeAndForm?.overrides) {
        customizationObj.shapeAndForm.overrides = ThemeSystemTokenUpdateScript.mapCustomizationHooksForNewThemeHooks(
            customizationObj.shapeAndForm.overrides, Constants.OLD_HOOKS_TO_NEW_HOOKS_MAPPING['shape']['properties']);
    }
    //mapping dependent hooks to new hook for initialValues incase user has updated base color
    if (customizationObj?.initialValues) {
        Object.keys(customizationObj.initialValues).forEach(hook => {
            customizationObj.initialValues[hook] = Constants.THEME_BUILDER_INITIAL_THEME.colors.properties[hook] || customizationObj.initialValues[hook];
        });
    }
};

ThemeSystemTokenUpdateScript.updateCustomizationForChangedHooksInThemes = function(themeId) {
    try {
        var customizationGR = ThemeRepository.getCustomizationGR(themeId);
        const customizationObj = ThemeRepository.transformCustomizationStrToObject(customizationGR.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD));
        // updating for typography and shape styles
        ThemeSystemTokenUpdateScript.updateCustomizationForStyleHooks(customizationObj);

        // updating for variants styles
        customizationObj?.variants && Object.keys(customizationObj?.variants).forEach((variantId) =>
            ThemeSystemTokenUpdateScript.updateCustomizationForStyleHooks(customizationObj?.variants[variantId])
        );

        customizationObj['systemTokenVersion'] = Constants.SYSTEM_TOKEN_VERSION;
        customizationGR.setValue(Constants.CUSTOMIZATION_COLUMN_FIELD, ThemeRepository.transformCustomizationObjToStr(customizationObj));
        customizationGR.update();
    } catch (err) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error updating customization record version for theme: ' + err.toString());
    }
};

ThemeSystemTokenUpdateScript.mapCustomizationHooksForNewThemeHooks = function(customizationObj, hookMap) {
    return Object.keys(customizationObj).reduce((newCustomizationObj, hook) => {
        newCustomizationObj[hookMap[hook] || hook] = customizationObj[hook];
        return newCustomizationObj;
    }, {});
};

ThemeSystemTokenUpdateScript.getNewStyleRecordWithUpdatedHooks = function(currentStyleGr) {
    try {
        const initialTheme = JSON.parse(JSON.stringify(Constants.THEME_BUILDER_INITIAL_THEME));
        const styleName = currentStyleGr.getValue(Constants.NAME_COLUMN_FIELD);
        const currentStyle = JSON.parse(currentStyleGr.getValue(Constants.STYLE_COLUMN_FIELD));
        const styleType = currentStyleGr.getValue(Constants.TYPE_COLUMN_FIELD);
        
        // If styleType is not variant, only process supported style names
        const supportedStyleNames = [
            Constants.TYPOGRAPHY_STYLE_TYPE,
            Constants.COLORS_STYLE_TYPE,
            Constants.SHAPE_STYLE_TYPE
        ];
        
        if (styleType !== Constants.STYLE_VARIANT_TYPE && !supportedStyleNames.includes(styleName)) {
            return currentStyle;
        }
        
        const styleKey = styleType === Constants.STYLE_VARIANT_TYPE ? Constants.STYLE_KEY_TYPE_MAPPING[Constants.COLORS_STYLE_TYPE] : Constants.STYLE_KEY_TYPE_MAPPING[styleName];
        
        if (currentStyle && currentStyle.isDark) return currentStyle;
        const initialThemeStyle = initialTheme[styleKey] || {};
        const updatedStyleRecord = Object.keys(initialThemeStyle).reduce((prev, key) => {
            if (["base", "properties", "nativeMobile"].includes(key)) {
                // this part adds new hooks introduced in initial theme
                prev[key] = {
                    ...prev[key],
                    ...currentStyle[key]
                };

                // this is to modify the hooks which have been changed
                ThemeSystemTokenUpdateScript.mapOldThemeHooksToNewThemeHooks(
                    prev[key], Constants.OLD_HOOKS_TO_NEW_HOOKS_MAPPING?.[styleKey]?.[key]);

                // This is to add certain hooks in style
                Constants.ADDITION_TO_HOOKS?.[styleKey]?.[key] && Object.keys(Constants.ADDITION_TO_HOOKS?.[styleKey]?.[key]).forEach(hook => {
                    prev[key][hook] = Constants.ADDITION_TO_HOOKS[styleKey][key][hook];
                });

                // this parts is responsible for deleting hooks
                Constants.HOOKS_TO_DELETE?.[styleKey]?.[key] && Object.keys(Constants.HOOKS_TO_DELETE?.[styleKey]?.[key]).forEach(hook => {
                    delete prev[key][hook];
                });
            }
            return prev;
        }, Object.assign({}, initialThemeStyle));

        return updatedStyleRecord;
    } catch (err) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error fetching updated style record version for theme: ' + err.toString());
    }
};

ThemeSystemTokenUpdateScript.getReadOnlyThemeIds = function(themeId) {
    return ThemeRepository.getReadOnlyThemeIds();
};

ThemeSystemTokenUpdateScript.isStyleReadOnly = function(styleId) {
    return ThemeRepository.isStyleReadOnly(styleId);
};

ThemeSystemTokenUpdateScript.fixCircularDependencyError = function(styleGr) {
    const currentStyle = JSON.parse(styleGr.getValue(Constants.STYLE_COLUMN_FIELD));
	const currentStyleProperties = currentStyle && currentStyle["properties"];
	if(!currentStyleProperties) return currentStyle;
    Object.keys(Constants.INITIAL_VALUES_FOR_REF_ERROR_HOOKS).forEach((key) => {
		if(currentStyleProperties[key] && key === currentStyleProperties[key]) {
			currentStyleProperties[key] = Constants.INITIAL_VALUES_FOR_REF_ERROR_HOOKS[key];
		}
    });

	return currentStyle;
};

ThemeSystemTokenUpdateScript.prototype = {
    type: 'ThemeSystemTokenUpdateScript'
};
