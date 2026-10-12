const ThemeRepository = Class.create();
ThemeRepository.getScopeErrorMessage = function(scopeDisplayValue) {
    return gs.getMessage('This view is read-only. To edit, change your application scope to {0}.', scopeDisplayValue);
};
ThemeRepository.addDomainQueryToGR = function(gr) {
    gr.addQuery(Constants.SYS_DOMAIN_COLUMN_FIELD, ThemeRepository.getDomainId());
};
ThemeRepository.getQueryAfterAddingDomainToQueryArray = function(queryArray) {
    return queryArray.concat(['^sys_domain=', ThemeRepository.getDomainId()]).join(Constants.EMPTY_STR);
};
ThemeRepository.getDomainId = function() {
    return gs.getSession().getCurrentDomainID() || Constants.GLOBAL_DOMAIN_ID;
};
ThemeRepository.getScopeId = function() {
    return gs.getSession().getCurrentApplicationId() || 'global';
};
ThemeRepository.isScopeSame = function(recordScopeId, userScopeId) {
    return recordScopeId === userScopeId;
};
ThemeRepository.isStyleObjectNil = function(parsedStyle) {
    return gs.nil(parsedStyle) || gs.nil(parsedStyle.properties);
};
ThemeRepository._appendRGB = function(rgbVal) {
    return ['rgb(', rgbVal, ')'].join(Constants.EMPTY_STR);
};
ThemeRepository.initializeGR = function(table, fields) {
    var gr = new GlideRecord(table);
    gr.initialize();
    Object.keys(fields).forEach(function(key) {
        gr.setValue(key, fields[key]);
    });
    return gr;
};
ThemeRepository.getGR = function(table, query) {
    var gr = new GlideRecordSecure(table);
    gr.addUserEncodedQuery(query);
    gr.query();
    if (gr.next()) {
        return gr;
    }
    return null;
};
ThemeRepository.getRowCount = function(table, query) {
    var gr = new GlideRecordSecure(table);
    gr.addUserEncodedQuery(query);
    gr.query();
    return gr.getRowCount();
};
ThemeRepository.createGR = function(table, fields) {
    var gr = ThemeRepository.initializeGR(table, fields);
    if (gr.canCreate()) {
        gr.insert();
        return gr;
    }
    return null;
};
ThemeRepository.getUniqueValueAfterInsert = function(table, fields) {
    return ThemeRepository.initializeGR(table, fields).insert();
};
ThemeRepository.getUniqueNameForDuplicateTheme = function(table, name) {
    var nameStr = name + ' Copy';
    var count = 0;
    var arrayLength = nameStr.split(' ').length;
    var themeGR = new GlideRecord(table);
    themeGR.addQuery('name', 'CONTAINS', nameStr);
    themeGR.query();
    while (themeGR.next()) {
        var nameGR = themeGR.getValue('name');
        var nameGRArray = nameGR.split(' ');
        var grArrLength = nameGRArray.length;
        if (nameGR === nameStr && count <= 2) {
            count = 2;
        } else {
            if (arrayLength + 1 === grArrLength &&
                count <= parseInt(nameGRArray[grArrLength - 1])) {
                count = parseInt(nameGRArray[grArrLength - 1]) + 1;
            }
        }
    }
    if (count === 0) return nameStr;
    else return nameStr + ' ' + (count);
};
ThemeRepository.getUniqueNameForDuplicateGroup = function(name) {
        var nameStr = name + ' Copy';
        var count = 0;
        var arrayLength = nameStr.split(' ').length;
        var customizationGR = new GlideRecordSecure(Constants.SYS_UX_THEME_CUSTOMIZATION_TABLE_NAME);
        customizationGR.query();
        while (customizationGR.next()) {
            var customizationObj = ThemeRepository.transformCustomizationStrToObject(customizationGR.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD));
            var groupName = customizationObj['groupName'];
            var nameGRArray = groupName.split(' ');
            var grArrLength = nameGRArray.length;
            if (groupName === nameStr && count <= 2) {
                count = 2;
            } else {
                if (arrayLength + 1 === grArrLength &&
                    count <= parseInt(nameGRArray[grArrLength - 1])) {
                    count = parseInt(nameGRArray[grArrLength - 1]) + 1;
                }
            }
        }
        if (count === 0) return nameStr;
        else return nameStr + ' ' + (count);
    },
    ThemeRepository.getUniqueNameForDuplicateVariant = function(name, styleType) {
        if (styleType !== Constants.STYLE_VARIANT_TYPE) return name;
        var nameStr = name + ' Copy';
        var count = 0;
        var arrayLength = nameStr.split(' ').length;
        var styleGr = new GlideRecord(Constants.SYS_UX_STYLE_TABLE_NAME);
        styleGr.addQuery('name', 'CONTAINS', nameStr);
        styleGr.query();
        while (styleGr.next()) {
            var nameGR = styleGr.getValue('name');
            var nameGRArray = nameGR.split(' ');
            var grArrLength = nameGRArray.length;
            if (nameGR === nameStr && count <= 2) {
                count = 2;
            } else {
                if (arrayLength + 1 === grArrLength &&
                    count <= parseInt(nameGRArray[grArrLength - 1])) {
                    count = parseInt(nameGRArray[grArrLength - 1]) + 1;
                }
            }
        }
        if (count === 0) return nameStr;
        else return nameStr + ' ' + (count);
    };
ThemeRepository.updateGR = function(table, query, fields) {
    var gr = new GlideRecordSecure(table);
    gr.addUserEncodedQuery(query);
    gr.query();
    if (gr.next()) {
        Object.keys(fields).forEach(function(key) {
            gr.setValue(key, fields[key]);
        });
        if (gr.update()) {
            return gr;
        }
    }
    return null;
};

ThemeRepository.getMultiThemeInfo = function() {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {
        var multiThemeInfo = {};
        var m2mAppThemeGR = new GlideRecord(Constants.M2M_APP_THEME_TABLE_NAME);
        multiThemeInfo.m2mAppThemeExists = m2mAppThemeGR.isValid();
        if (!multiThemeInfo.m2mAppThemeExists) {
            multiThemeInfo.m2mAppThemeEntriesExist = false;
            return multiThemeInfo;
        }
        m2mAppThemeGR.setLimit(1);
        m2mAppThemeGR.addQuery(Constants.UX_APP_COLUMN_FIELD, Constants.UNIFIED_NAV_APP_SHELL_SYS_ID);
        m2mAppThemeGR.query();
        if (m2mAppThemeGR.next()) {
            multiThemeInfo.m2mAppThemeEntriesExist = true;
        } else {
            multiThemeInfo.m2mAppThemeEntriesExist = false;
        }
        return multiThemeInfo;
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while accessing the multi theme info: ' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to get multi theme info. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};

ThemeRepository.isThemeCreatedByTB = function(themeId) {
    var customizationGR = ThemeRepository.getCustomizationGR(themeId);
    if (!customizationGR) {
        return false;
    }
    return true;
};
ThemeRepository.getThemeDescription = function(gr) {
    return gr[Constants.DESCRIPTION_COLUMN_FIELD][Constants.VALUE];
};
ThemeRepository.getScope = function(gr) {
    return {
        id: gr[Constants.SYS_SCOPE_COLUMN_FIELD][Constants.VALUE],
        label: gr[Constants.SYS_SCOPE_COLUMN_FIELD][Constants.DISPLAY_VALUE]
    };
};
ThemeRepository.getDomain = function(gr) {
    var domainObj = {};
    if (gs.nil(gr)) {
        return domainObj;
    }
    try {
        domainObj.id = gr[Constants.SYS_DOMAIN_COLUMN_FIELD] && gr[Constants.SYS_DOMAIN_COLUMN_FIELD][Constants.VALUE];
        domainObj.label = gr[Constants.SYS_DOMAIN_COLUMN_FIELD] && gr[Constants.SYS_DOMAIN_COLUMN_FIELD][Constants.DISPLAY_VALUE];
        domainObj.path = gr[Constants.SYS_DOMAIN_PATH] && gr[Constants.SYS_DOMAIN_PATH][Constants.VALUE];
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while accessing the domain details:' + e.toString());
    }
    return domainObj;
};
ThemeRepository.updatePrimaryColorInJSONObj = function(jsonObj, primaryColor, isDark = false) {
    jsonObj.base[Constants.PRIMARY_COLOR_HOOK_NAME] = primaryColor;
    if (!isDark) {
        jsonObj.base[Constants.SELECTION_PRIMARY_COLOR_HOOK_NAME] = primaryColor;
        jsonObj.base[Constants.CHROME_BRAND_COLOR_HOOK_NAME] = primaryColor;
        jsonObj.base[Constants.CHROME_DIVIDER_COLOR_HOOK_NAME] = primaryColor;
        jsonObj.base[Constants.INTERACTIVE_COLOR_HOOK_NAME] = primaryColor;
    }
    jsonObj.properties[Constants.BRAND_PRIMARY_COLOR_HOOK_NAME] = primaryColor;
};
ThemeRepository.handleComponentUpdateOnPrimaryOverride = function(primaryColor, styleDetails, customizationObj, variantDetails) {
    var primaryDependentBaseHooks = [
        Constants.PRIMARY_COLOR_HOOK_NAME,
        Constants.SURFACE_BRAND_COLOR_HOOK_NAME,
        Constants.SELECTION_PRIMARY_COLOR_HOOK_NAME,
        Constants.CHROME_BRAND_COLOR_HOOK_NAME,
        Constants.CHROME_DIVIDER_COLOR_HOOK_NAME,
        Constants.INTERACTIVE_COLOR_HOOK_NAME,
        Constants.BRAND_PRIMARY_COLOR_HOOK_NAME
    ];
    var brandColorDetails = {
        brandDependentHooks: primaryDependentBaseHooks,
        brandColor: primaryColor,
        brandHookName: Constants.BRAND_PRIMARY_COLOR_HOOK_NAME
    }
    ThemeRepository.handleComponentUpdateOnBrandOverride(brandColorDetails, styleDetails, customizationObj, variantDetails);
};


ThemeRepository.updateSecondaryColorInJSONObj = function(jsonObj, secondaryColor, isDark = false) {
    jsonObj.base[Constants.SECONDARY_COLOR_HOOK_NAME] = secondaryColor;
    if (!isDark) {
        jsonObj.base[Constants.SELECTION_SECONDARY_COLOR_HOOK_NAME] = secondaryColor;
        jsonObj.base[Constants.SURFACE_BRAND_COLOR_HOOK_NAME] = secondaryColor;
    }
    jsonObj.properties[Constants.BRAND_SECONDARY_COLOR_HOOK_NAME] = secondaryColor;
};

ThemeRepository.handleComponentUpdateOnSecondaryOverride = function(secondaryColor, styleDetails, customizationObj, variantDetails) {
    var secondaryDependentBaseHooks = [
        Constants.SECONDARY_COLOR_HOOK_NAME,
        Constants.SELECTION_SECONDARY_COLOR_HOOK_NAME,
        Constants.SURFACE_BRAND_COLOR_HOOK_NAME

    ];
    var brandColorDetails = {
        brandDependentHooks: secondaryDependentBaseHooks,
        brandColor: secondaryColor,
        brandHookName: Constants.BRAND_SECONDARY_COLOR_HOOK_NAME
    }
    ThemeRepository.handleComponentUpdateOnBrandOverride(brandColorDetails, styleDetails, customizationObj, variantDetails);
};

ThemeRepository.updateNeutralColorInJSONObj = function(jsonObj, neutralColor, isDark = false) {
    jsonObj.base[Constants.NEUTRAL_COLOR_HOOK_NAME] = neutralColor;
    if (!isDark) {
        jsonObj.base[Constants.SECONDARY_NAV_BRAND_COLOR_HOOK_NAME] = neutralColor;
        jsonObj.base[Constants.SECONDARY_NAV_DIVIDER_COLOR_HOOK_NAME] = neutralColor;
    }
    jsonObj.properties[Constants.BRAND_NEUTRAL_COLOR_HOOK_NAME] = neutralColor;
};

ThemeRepository.handleComponentUpdateOnNeutralOverride = function(neutralColor, styleDetails, customizationObj, variantDetails) {
    var neutralDependentBaseHooks = [
        Constants.SECONDARY_COLOR_HOOK_NAME,
        Constants.SELECTION_SECONDARY_COLOR_HOOK_NAME,
        Constants.SURFACE_BRAND_COLOR_HOOK_NAME

    ];
    var brandColorDetails = {
        brandDependentHooks: neutralDependentBaseHooks,
        brandColor: neutralColor,
        brandHookName: Constants.BRAND_NEUTRAL_COLOR_HOOK_NAME
    }
    ThemeRepository.handleComponentUpdateOnBrandOverride(brandColorDetails, styleDetails, customizationObj, variantDetails);
};

ThemeRepository.handleComponentUpdateOnBrandOverride = function(brandColorDetails, styleDetails, customizationObj, variantDetails) {
    var brandDependentHooks = brandColorDetails.brandDependentHooks;
    var brandColor = brandColorDetails.brandColor;
    var brandHookName = brandColorDetails.brandHookName;
    var isVariant = variantDetails.isVariant,
        variantStyleId = variantDetails.styleId;
    var customizedColors;
    if (isVariant) {
        customizedColors = customizationObj['variants'][variantStyleId].colors;
    } else {
        customizedColors = customizationObj.colors;
    }

    var nonOverriddenHooks = [];
    for (var i = 0; i < brandDependentHooks.length; i++) {
        var globalBaseHook = brandDependentHooks[i];
        if (!customizedColors || !customizedColors.overrides || !customizedColors.overrides[globalBaseHook]) {
            nonOverriddenHooks.push({
                id: globalBaseHook,
                value: brandColor

            });
        }
    }
    nonOverriddenHooks.push({
        id: brandHookName,
        value: brandColor
    });

    ThemeRepository.handleComponentUpdateOnColorOverride(nonOverriddenHooks, styleDetails, customizationObj, variantDetails);
};

ThemeRepository.getInitialColors = function() {
    var styleObj = JSON.parse(JSON.stringify(Constants.THEME_BUILDER_INITIAL_THEME.colors));
    ThemeRepository.updatePrimaryColorInJSONObj(styleObj, Constants.PRIMARY_COLOR_RGB_DEFAULT);
    ThemeRepository.updateSecondaryColorInJSONObj(styleObj, Constants.SECONDARY_COLOR_RGB_DEFAULT);
    ThemeRepository.updateNeutralColorInJSONObj(styleObj, Constants.NEUTRAL_COLOR_RGB_DEFAULT);
    return JSON.stringify(styleObj);
};

ThemeRepository.getVariantColors = function(coreThemeColors, isDark, variantStyle) {
    var neutralColor = isDark ? Constants.DARK_VARIANT_NEUTRAL_COLOR_RGB_DEFAULT : coreThemeColors.neutral;
    var initialColor = isDark ? Constants.DARK_VARIANT.colors : Constants.THEME_BUILDER_INITIAL_THEME.colors;
    var styleObj = JSON.parse(variantStyle);
    ThemeRepository.updatePrimaryColorInJSONObj(styleObj, coreThemeColors.primary);
    ThemeRepository.updateSecondaryColorInJSONObj(styleObj, coreThemeColors.secondary);
    ThemeRepository.updateNeutralColorInJSONObj(styleObj, neutralColor);
    return JSON.stringify(styleObj);
};

ThemeRepository.validateNameInput = function(name) {
    if (gs.nil(name)) {
        return false;
    }
    var trimmedName = name.trim();
    var length = trimmedName.length;
    return length >= Constants.MINLENGTH && length < Constants.MAXLENGTH;
};

ThemeRepository.transformCustomizationObjToStr = function(sourceObj) {
    var destinationObj = {
        colors: [],
        typography: [],
        shapeAndForm: [],
        feedback: [],
        groupName: '',
        variants: [],
        imagery: [],
        systemTokenVersion: ''
    };
    destinationObj.initialValues = sourceObj.initialValues || {}

    var sourceColors = sourceObj.colors;
    var destinationColors = destinationObj.colors;
    var sourceVariants = sourceObj.variants;
    var destinationVariants = destinationObj.variants;
    if (!gs.nil(sourceObj.groupName))
        destinationObj.groupName = sourceObj.groupName;

    if (!gs.nil(sourceObj.systemTokenVersion))
        destinationObj.systemTokenVersion = sourceObj.systemTokenVersion;

    ThemeRepository.transformColorsToArray(sourceColors, destinationColors);
    if (sourceVariants) {
        Object.keys(sourceVariants).forEach(function(variantId) {
            var variantObj = {};
            var sourceVariantObj = sourceVariants[variantId];
            variantObj.id = variantId;
            variantObj.colors = [];
            variantObj.initialValues = sourceVariantObj.initialValues;
            if (sourceVariantObj.colors)
                ThemeRepository.transformColorsToArray(sourceVariantObj.colors, variantObj.colors);
            destinationVariants.push(variantObj);
        });
    }

    var sourceTypography = sourceObj.typography;
    var destinationTypography = destinationObj.typography;
    if (sourceTypography.customizedNames) {
        Object.keys(sourceTypography.customizedNames).forEach(function(id) {
            destinationTypography.push(ThemeRepository.getEntityObject(id, sourceTypography.customizedNames[id], Constants.CUSTOMIZED_NAME));
        });
    }
    if (sourceTypography.overrides) {
        Object.keys(sourceTypography.overrides).forEach(function(id) {
            destinationTypography.push(ThemeRepository.getEntityObject(id, sourceTypography.overrides[id], Constants.COMPONENT_HOOK_OVERRIDDEN));
        });
    }
    if (sourceTypography.fontFamilyMapping) {
        Object.keys(sourceTypography.fontFamilyMapping).forEach(function(id) {
            destinationTypography.push(ThemeRepository.getEntityObject(id, sourceTypography.fontFamilyMapping[id], Constants.FONT_FAMILY_MAPPING));
        });
    }
    if (sourceTypography.customFonts) {
        sourceTypography.customFonts?.forEach(function(font) {
            destinationTypography.push({
                value: font?.name,
                type: Constants.CUSTOM_FONT_UPLOADED,
                createdAt: font?.createdAt
            });
        });
    }

    var sourceShapeAndForm = sourceObj.shapeAndForm;
    var destinationShapeAndForm = destinationObj.shapeAndForm;
    if (sourceShapeAndForm.overrides) {
        Object.keys(sourceShapeAndForm.overrides).forEach(function(id) {
            destinationShapeAndForm.push(ThemeRepository.getEntityObject(id, sourceShapeAndForm.overrides[id], Constants.COMPONENT_HOOK_OVERRIDDEN));
        });
    }

    var sourceImagery = sourceObj.imagery;
    var destinationImagery = destinationObj.imagery;
    if (sourceImagery.overrides) {
        Object.keys(sourceImagery.overrides).forEach(function(id) {
            destinationImagery.push(ThemeRepository.getEntityObject(id, sourceImagery.overrides[id], Constants.COMPONENT_HOOK_OVERRIDDEN));
        });
    }

    var sourceFeedback = sourceObj.feedback;
    var destinationFeedback = destinationObj.feedback;
    if (sourceFeedback) {
        Object.keys(sourceFeedback).forEach(function(id) {
            destinationFeedback.push(ThemeRepository.getEntityObject(id, sourceFeedback[id], Constants.FEEDBACK));
        });
    }
    // Extend this logic to other types, such as imagery, shape, and theme.
    if (destinationColors.length === 0) {
        delete destinationObj.colors;
    }
    if (destinationVariants.length === 0) {
        delete destinationObj.variants;
    }
    if (destinationTypography.length === 0) {
        delete destinationObj.typography;
    }
    if (destinationShapeAndForm.length === 0) {
        delete destinationObj.shapeAndForm;
    }

    if (destinationFeedback.length === 0) {
        delete destinationObj.destinationFeedback;
    }
    return Object.keys(destinationObj).length === 0 ? Constants.EMPTY_STR : JSON.stringify(destinationObj, null, 2);
};
ThemeRepository.getAppliedThemeCustomization = function(themeId) {
    var syspropGR = new GlideRecord('sys_properties');
    syspropGR.addQuery('name=glide.ui.polaris.theme.custom');
    syspropGR.query();
    if (syspropGR.next()) {
        if (syspropGR.value == themeId)
            return {
                id: 'applied',
                value: themeId,
                type: 'applied_theme'
            }
    }
};
ThemeRepository.transformCustomizationStrToObject = function(sourceStr) {
    var destinationObj = {
        colors: {
            customizedNames: {},
            contrastRatioViolations: {},
            overrides: {},
            baseColors: {},
            componentOverrides: {},
            isSecondaryColorUpdated: false
        },
        typography: {
            customizedNames: {},
            overrides: {},
            customFonts: [],
            fontFamilyMapping: {}
        },
        feedback: {},
        groupName: '',
        variants: {},
        shapeAndForm: {
            overrides: {}
        },
        imagery: {
            overrides: {}
        },
        systemTokenVersion: ''
    };
    if (gs.nil(sourceStr)) {
        return destinationObj;
    }
    var sourceObj = JSON.parse(sourceStr);
    var sourceColors = sourceObj.colors;
    destinationObj.initialValues = sourceObj.initialValues || {};
    if (!gs.nil(sourceObj.groupName))
        destinationObj.groupName = sourceObj.groupName;

    if (!gs.nil(sourceObj.systemTokenVersion))
        destinationObj.systemTokenVersion = sourceObj.systemTokenVersion;

    if (sourceColors && Array.isArray(sourceColors)) {
        var destinationColors = destinationObj.colors;
        sourceColors.forEach(function(obj) {
            switch (obj.type) {
                case Constants.CUSTOMIZED_NAME:
                    destinationColors.customizedNames[obj.id] = obj.value;
                    break;
                case Constants.CONTRAST_RATIO_VIOLATED:
                    destinationColors.contrastRatioViolations[obj.id] = obj.value;
                    break;
                case Constants.COLOR_HOOK_OVERRIDDEN:
                    destinationColors.overrides[obj.id] = obj.value;
                    break;
                case Constants.COMPONENT_BASE_HOOK_OVERRIDDEN:
                    var compBaseColors = {};
                    if (!destinationColors.baseColors[obj.component]) {
                        compBaseColors = destinationColors.baseColors[obj.component] = {};
                    }
                    compBaseColors[obj.id] = {
                        value: obj.value
                    };
                    if (obj.hook)
                        compBaseColors[obj.id].hook = obj.hook;
                    break;
                case Constants.COMPONENT_HOOK_OVERRIDDEN:
                    destinationColors.componentOverrides[obj.id] = {
                        value: obj.value,
                        hook: obj.hook
                    };
                    break;
                case Constants.SECONDARY_COLOR_UPDATED:
                    destinationColors.isSecondaryColorUpdated = obj.value;
                    break;
            }
        });
    }
    var sourceVariants = sourceObj.variants;
    if (sourceVariants && Array.isArray(sourceVariants)) {
        var destinationVariants = destinationObj.variants;
        sourceVariants.forEach(function(sourceVariant) {
            var variantColors = sourceVariant.colors;
            var variantId = sourceVariant.id;
            destinationVariants[variantId] = {
                colors: {
                    customizedNames: {},
                    contrastRatioViolations: {},
                    overrides: {},
                    baseColors: {},
                    componentOverrides: {},
                    isSecondaryColorUpdated: false
                },
                initialValues: sourceVariant.initialValues || {}
            };
            variantColors.forEach(function(variantColor) {
                switch (variantColor.type) {
                    case Constants.CUSTOMIZED_NAME:
                        destinationVariants[variantId].colors.customizedNames[variantColor.id] = variantColor.value;
                        break;
                    case Constants.CONTRAST_RATIO_VIOLATED:
                        destinationVariants[variantId].colors.contrastRatioViolations[variantColor.id] = variantColor.value;
                        break;
                    case Constants.COLOR_HOOK_OVERRIDDEN:
                        destinationVariants[variantId].colors.overrides[variantColor.id] = variantColor.value;
                        break;
                    case Constants.COMPONENT_BASE_HOOK_OVERRIDDEN:
                        var compBaseColors;
                        if (!destinationVariants[variantId].colors.baseColors[variantColor.component]) {
                            compBaseColors = destinationVariants[variantId].colors.baseColors[variantColor.component] = {};
                        }
                        compBaseColors[variantColor.id] = {
                            value: variantColor.value
                        };
                        if (variantColor.hook)
                            compBaseColors[variantColor.id].hook = variantColor.hook;
                        break;
                    case Constants.COMPONENT_HOOK_OVERRIDDEN:
                        destinationVariants[variantId].colors.componentOverrides[variantColor.id] = {
                            value: variantColor.value,
                            hook: variantColor.hook
                        };

                        break;

                    case Constants.SECONDARY_COLOR_UPDATED:
                        destinationVariants[variantId].colors.isSecondaryColorUpdated = variantColor.value;
                        break;
                }
            });
        });
    }
    var sourceTypography = sourceObj.typography;
    if (sourceTypography && Array.isArray(sourceTypography)) {
        var destinationTypography = destinationObj.typography;
        sourceTypography.forEach(function(obj) {
            switch (obj.type) {
                case Constants.CUSTOMIZED_NAME:
                    destinationTypography.customizedNames[obj.id] = obj.value;
                    break;

                case Constants.COMPONENT_HOOK_OVERRIDDEN:
                    destinationTypography.overrides[obj.id] = obj.value;
                    break;
                case Constants.CUSTOM_FONT_UPLOADED:
                    destinationTypography.customFonts.push({
                        name: obj.value,
                        createdAt: obj.createdAt
                    })
                    break
                case Constants.FONT_FAMILY_MAPPING:
                    destinationTypography.fontFamilyMapping[obj.id] = obj.value;
                    break;
            }
        });
    }

    var sourceShapeAndForm = sourceObj.shapeAndForm;
    if (sourceShapeAndForm && Array.isArray(sourceShapeAndForm)) {
        var destinationShapeAndForm = destinationObj.shapeAndForm;
        sourceShapeAndForm.forEach(function(obj) {
            switch (obj.type) {
                case Constants.CUSTOMIZED_NAME:
                    destinationShapeAndForm.customizedNames[obj.id] = obj.value;
                    break;

                case Constants.COMPONENT_HOOK_OVERRIDDEN:
                    destinationShapeAndForm.overrides[obj.id] = obj.value;
                    break;

            }
        });
    }

    const sourceImagery = sourceObj.imagery;
    if (sourceImagery && Array.isArray(sourceImagery)) {
        const destinationImagery = destinationObj.imagery;
        sourceImagery.forEach(function(obj) {
            destinationImagery.overrides[obj.id] = obj.value;
        });
    }

    var sourceFeedback = sourceObj.feedback;
    if (sourceFeedback && Array.isArray(sourceFeedback)) {
        var destinationFeedback = destinationObj.feedback;
        sourceFeedback.forEach(function(obj) {
            switch (obj.type) {
                case Constants.FEEDBACK:
                    destinationFeedback[obj.id] = obj.value;
                    break;
            }
        });
    }

    //Extend this logic to other types, such as imagery, shape, and theme.
    return destinationObj;
};
ThemeRepository.getEntityObject = function(id, value, type) {
    return {
        id: id,
        value: value,
        type: type
    };
};
ThemeRepository.validateRGB = function(colorRGB) {
    var rgbArray = colorRGB.split(Constants.COMMA);
    var length = rgbArray.length;
    if (!length === 3) {
        return false;
    }
    for (var i = 0; i < length; i++) {
        try {
            var value = parseInt(rgbArray[i]);
            if (!(value >= Constants.MINVAL && value <= Constants.MAXVALUE)) {
                return false;
            }
        } catch (er) {
            return false;
        }
    }
    return true;
};
ThemeRepository.validateAdditionalColorsInput = function(additional) {
    if (additional && Array.isArray(additional)) {
        for (var i = 0; i < additional.length; i++) {
            if (!ThemeRepository.validateRGB(additional[i].value)) {
                return false;
            }
        }
    }
    return true;
};
ThemeRepository.validateColorsInput = function(primary, secondary, neutral) {
    if (primary) {
        if (!ThemeRepository.validateRGB(primary)) {
            return false;
        }
    }
    if (secondary) {
        if (!ThemeRepository.validateRGB(secondary)) {
            return false;
        }
    }
    if (neutral) {
        if (!ThemeRepository.validateRGB(neutral)) {
            return false;
        }
    }
    return true;
};
ThemeRepository.getFileNameAndExtension = function(fileName) {
    if (!fileName) return null;
    var extMatch = fileName.match(Constants.FILE_EXTENSION_REGEX);
    if (!extMatch) return null;
    return {
        fileName: extMatch[1],
        extension: extMatch[2]
    };
};
ThemeRepository.uploadFile = function(record, fileName, fileType, file) {
    return new GlideSysAttachment().writeBase64(record, fileName, fileType, file);
};
ThemeRepository.deleteFile = function(table, id) {
    var attachmentGR = new GlideRecord(Constants.SYS_ATTACHEMENT_TABLE_NAME);
    attachmentGR.addQuery(Constants.TABLE_NAME_COLUMN_FIELD, table);
    attachmentGR.addQuery(Constants.TABLE_ID_COLUMN_FIELD, id);
    attachmentGR.query();
    if (attachmentGR.next()) {
        new GlideSysAttachment().deleteAttachment(attachmentGR.sys_id);
        return true;
    }
    return false;
};
ThemeRepository.getTBCreatedThemeIds = function() {
    var themeIds = [];
    var customizationGR = new GlideRecordSecure(Constants.SYS_UX_THEME_CUSTOMIZATION_TABLE_NAME);
    customizationGR.addActiveQuery();
    ThemeRepository.addDomainQueryToGR(customizationGR);
    customizationGR.query();
    while (customizationGR.next()) {
        themeIds.push(customizationGR.getValue(Constants.THEME_COLUMN_FIELD));
    }
    return themeIds;
};

ThemeRepository.getCustomizationGR = function(themeId) {
    var customizationGR = new GlideRecordSecure(Constants.SYS_UX_THEME_CUSTOMIZATION_TABLE_NAME);
    customizationGR.setLimit(1);
    customizationGR.addActiveQuery();
    if (themeId) {
        customizationGR.addQuery(Constants.THEME_COLUMN_FIELD, themeId);
    }
    ThemeRepository.addDomainQueryToGR(customizationGR);
    customizationGR.query();
    if (customizationGR.next()) {
        return customizationGR;
    }
    return null;
};

ThemeRepository.getCompanyUILogosrc = function(companyId) {
    var companyLogoGR = new GlideRecordSecure(Constants.CORE_COMPANY_RECORD);
    if (companyLogoGR.get(companyId)) {
        var attachment = new GlideRecordSecure(Constants.SYS_ATTACHEMENT_TABLE_NAME);
        if (attachment.get(companyLogoGR.getValue(Constants.CORE_COMPANY_BANNER_IMAGE_LIGHT))) {
            var gsAttachment = new GlideSysAttachment();

            return {
                file: gsAttachment.getContentBase64(attachment),
                fileName: attachment.getValue(Constants.FILE_NAME_COLUMN_FIELD),
                fileType: attachment.getValue(Constants.CONTENT_TYPE_COLUMN_FIELD),
                attachmentId: attachment.getUniqueValue()
            };
        }
    }
    return null;
};

ThemeRepository.getTheme = function(themeId) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {
        if (!ThemeRepository.isThemeCreatedByTB(themeId) && !ThemeRepository.isThemeReadOnly(themeId)) {
            logObject.message = gs.getMessage('You need to get permission to view this theme. Contact your system administrator for permission.');
            return logObject;
        }
        var themeGR = new GlideRecordSecure(Constants.SYS_UX_THEME_TABLE_NAME);
        themeGR.setLimit(1);
        themeGR.addActiveQuery();
        themeGR.addQuery(Constants.SYS_ID_COLUMN_FIELD, themeId);
        ThemeRepository.addDomainQueryToGR(themeGR);
        themeGR.query();
        if (themeGR.next()) {
            return themeGR;
        }
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while accessing the theme: ' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to get your theme. Try it again or contact your system administrator for more help.');
        return logObject;
    }
    return logObject;
};

ThemeRepository.getPaginatedRecords = function(gr, window_start, window_size) {
    // try setWindow
    gr.chooseWindow(window_start, window_start + window_size);
    gr.query();
    // check value if affecting acls as we are using GlideRecordSecure
    var rowCount = gr.getRowCount();
    var hasNext = window_start + window_size < rowCount;

    const result = {
        rowCount,
        hasNext,
        themes: gr
    };

    return result;
};

ThemeRepository.sortThemes = function(a, b) {
    // If either order is null or undefined, move it to the bottom
    if ((a.order === null || a.order === undefined) && (b.order === null || b.order === undefined)) {
        return b.updatedOn.localeCompare(a.updatedOn); // If both are null or undefined, sort by updatedOn
    } else if (a.order === null || a.order === undefined) {
        return 1; // Move a to the bottom
    } else if (b.order === null || b.order === undefined) {
        return -1; // Move b to the bottom
    }

    // Sort by order first
    var orderComparison = a.order - b.order;
    if (orderComparison !== 0) {
        return orderComparison;
    }

    // If order is equal, sort by updatedOn, recently updated will be first
    return b.updatedOn.localeCompare(a.updatedOn);
};

ThemeRepository.getM2MAppThemesWithTBOrder = function() {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {
        var tbThemes = [];
        var m2mAppThemeGR = new GlideRecord(Constants.M2M_APP_THEME_TABLE_NAME);
        if (!m2mAppThemeGR.isValid()) {
            return tbThemes;
        }
        m2mAppThemeGR.addQuery(Constants.UX_APP_COLUMN_FIELD, Constants.UNIFIED_NAV_APP_SHELL_SYS_ID);
        m2mAppThemeGR.orderBy(Constants.ORDER_COLUMN_FIELD);
        m2mAppThemeGR.query();

        var managerPageOrder = 1;
        while (m2mAppThemeGR.hasNext()) {
            m2mAppThemeGR.next();
            var themeObj = {
                id: m2mAppThemeGR.getValue(Constants.SYS_ID_COLUMN_FIELD),
                themeId: m2mAppThemeGR.getValue(Constants.THEME_COLUMN_FIELD),
                order: m2mAppThemeGR.getValue(Constants.ORDER_COLUMN_FIELD),
                managerPageOrder: managerPageOrder++
            }
            tbThemes.push(themeObj);
        }
        return tbThemes;
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while accessing the multi themes: ' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to get multi theme info. Try it again or contact your system administrator for more help.');
        return logObject;
    }
}

ThemeRepository.getAllThemesWithOrderAndPublishedInfo = function(encodedQuery) {
    try {
        var themesGR = new GlideRecordSecure(Constants.SYS_UX_THEME_TABLE_NAME);
        themesGR.addActiveQuery();
        var TBCreatedThemeIds = ThemeRepository.getTBCreatedThemeIds();
        TBCreatedThemeIds = ThemeRepository.getReadOnlyThemeIds().concat(TBCreatedThemeIds);
        themesGR.addQuery(Constants.SYS_ID_COLUMN_FIELD, Constants.IN_OPERATOR, TBCreatedThemeIds);
        ThemeRepository.addDomainQueryToGR(themesGR);
        if (encodedQuery) themesGR.addUserEncodedQuery(encodedQuery);
        themesGR.query()

        var themeIds = []
        var publishedThemeOrderMap = ThemeRepository.getPublishedThemeOrderMap();
        while (themesGR.hasNext()) {
            themesGR.next();
            var themeId = themesGR.getValue(Constants.SYS_ID_COLUMN_FIELD);
            var themeObj = {
                themeId: themeId
            };
            themeObj.updatedOn = themesGR.getValue(Constants.SYS_UPDATED_ON_COLUMN_FIELD);
            if (themeId in publishedThemeOrderMap) {
                for (var m2mAppTheme of publishedThemeOrderMap[themeId]) {
                    let currentThemeObj = {
                        ...themeObj,
                        order: m2mAppTheme.order,
                        id: m2mAppTheme.id,
                        isPublished: true,
                    }
                    themeIds.push(currentThemeObj);
                }
            } else {
                themeIds.push(themeObj);
            }
        }
        return themeIds;
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while accessing the themes: ' + e.toString());
        return [];
    }
};

ThemeRepository.getPublishedThemeOrderMap = function() {
    var m2mThemes = ThemeRepository.getM2MAppThemesWithTBOrder();
    var themeToOrderMap = {}
    for (var {
            themeId,
            managerPageOrder,
            id
        }
        of m2mThemes) {

        if (!themeToOrderMap[themeId]) themeToOrderMap[themeId] = [];

        themeToOrderMap[themeId].push({
            order: managerPageOrder,
            id: id
        });
    }
    return themeToOrderMap;
}

ThemeRepository.getAllThemesSortedByOrder = function(encodedQuery) {
    var themeIds = ThemeRepository.getAllThemesWithOrderAndPublishedInfo(encodedQuery);
    themeIds.sort(ThemeRepository.sortThemes);
    return themeIds;
}

ThemeRepository.getAllThemes = function(encodedQuery, start, pageSize) {
    try {
        var orderedThemes = ThemeRepository.getAllThemesSortedByOrder(encodedQuery);
        // Calculate the endIndex based on start index and pageSize
        var endIndex = start + pageSize;
        // Return the subset using slice
        var paginatedThemes = orderedThemes.slice(start, endIndex);
        var pageRowCount = orderedThemes.length;
        var hasNext = start + pageSize < pageRowCount;
        return {
            themes: paginatedThemes,
            hasNext: hasNext,
            rowCount: pageRowCount
        };
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while accessing the themes: ' + e.toString());
        return {
            rowCount: 0,
            hasNext: false,
            themes: []
        };
    }
};

ThemeRepository.hasNonThemeBuilderThemes = function() {

    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {
        var tbThemes = [];
        var m2mAppThemeGR = new GlideRecord(Constants.M2M_APP_THEME_TABLE_NAME);
        if (m2mAppThemeGR.isValid()) {
            var themeIdsCreatedByTB = ThemeRepository.getTBCreatedThemeIds();
            themeIdsCreatedByTB = ThemeRepository.getReadOnlyThemeIds().concat(themeIdsCreatedByTB);

            m2mAppThemeGR.addQuery(Constants.THEME_COLUMN_FIELD, "NOT IN", themeIdsCreatedByTB);
            m2mAppThemeGR.addQuery(Constants.UX_APP_COLUMN_FIELD, Constants.UNIFIED_NAV_APP_SHELL_SYS_ID);
            m2mAppThemeGR.query();
            if (m2mAppThemeGR.hasNext()) {
                return true;
            }
        }
        return false;
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while accessing the multi themes: ' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to get multi theme info. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};
ThemeRepository.getAllThemeNames = function(encodedQuery) {
    var allThemesObj = ThemeRepository.getAllThemesSortedByOrder(encodedQuery);

    var themeNames = [];
    for (var {
            themeId
        }
        of allThemesObj) {
        var uxThemeGR = ThemeRepository.getGR(Constants.SYS_UX_THEME_TABLE_NAME, 'sys_id=' + themeId);
        var themeName = uxThemeGR.getValue("name");
        var customizationThemeGR = ThemeRepository.getCustomizationGR(themeId);
        var groupName = undefined;
        if (!gs.nil(customizationThemeGR)) {
            var customizationStr = customizationThemeGR.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD);
            if (!gs.nil(customizationStr)) {
                var customizationObj = ThemeRepository.transformCustomizationStrToObject(customizationStr);
                groupName = customizationObj['groupName'];
            }
        }

        var variants = ThemeRepository.getThemeVariants(themeId);
        var themeObj = {
            id: themeId,
            name: themeName,
            groupName,
            variants,
        };
        themeNames.push(themeObj);
    }
    return themeNames;
};

ThemeRepository.getMobileApps = function() {
    var mobileAppGR = new GlideRecordSecure(Constants.SYS_SG_NATIVE_CLIENT_TABLE_NAME);
    mobileAppGR.query();
    return mobileAppGR;
};

ThemeRepository.getMobileThemeGlideRecord = function(themeId) {
    if (!ThemeRepository.isThemeCreatedByTB(themeId) && !ThemeRepository.isThemeReadOnly(themeId)) {
        return null;
    }
    var themeGR = new GlideRecordSecure(Constants.SYS_UX_THEME_TABLE_NAME);
    themeGR.setLimit(1);
    themeGR.addActiveQuery();
    themeGR.addQuery(Constants.SYS_ID_COLUMN_FIELD, themeId);
    ThemeRepository.addDomainQueryToGR(themeGR);
    themeGR.query();
    if (themeGR.next()) {
        return themeGR;
    }
    return null;
};

ThemeRepository.getStyleType = function(styleRecord) {
    try {
        switch (styleRecord.name.value) {
            case Constants.IMAGERY_STYLE_TYPE:
                return Constants.IMAGERY_STYLE_GRAPHQL_TYPE;
            case Constants.TYPOGRAPHY_STYLE_TYPE:
                return Constants.TYPOGRAPHY_STYLE_GRAPHQL_TYPE;
            case Constants.COLORS_STYLE_TYPE:
                return Constants.COLORS_STYLE_GRAPHQL_TYPE;
            case Constants.SHAPE_STYLE_TYPE:
                return Constants.SHAPE_STYLE_GRAPHQL_TYPE;
            default:
                return Constants.UNKNOWN_STYLE_GRAPHQL_TYPE;
        }
    } catch (e) {
        return Constants.UNKNOWN_STYLE_GRAPHQL_TYPE;
    }
};

ThemeRepository.getThemeVariants = function(themeId) {
    var variants = [];
    if (ThemeRepository.isThemeReadOnly(themeId)) {
        return variants;
    }
    var variantsStyles = ThemeRepository.getThemeStyles(themeId, true);
    while (variantsStyles.next()) {
        var variantId = variantsStyles.getValue("sys_id");
        var variantName = variantsStyles.getValue("sys_name");
        variants.push({
            id: variantId,
            name: variantName
        });
    }
    return variants;
};

ThemeRepository.getThemeStyles = function(themeId, onlyVariants) {
    var themeStyleIds = [];
    var themeStyleM2M = new GlideRecordSecure(Constants.M2M_THEME_STYLE_TABLE_NAME);
    themeStyleM2M.addQuery(Constants.THEME_COLUMN_FIELD, themeId);
    themeStyleM2M.query();
    while (themeStyleM2M.next()) {
        themeStyleIds.push(themeStyleM2M.getValue(Constants.STYLE_COLUMN_FIELD));
    }
    var stylesGR = new GlideRecordSecure(Constants.SYS_UX_STYLE_TABLE_NAME);
    stylesGR.addQuery(Constants.SYS_ID_COLUMN_FIELD, themeStyleIds);
    if (onlyVariants && !ThemeRepository.isThemeReadOnly(themeId)) {
        stylesGR.addQuery(Constants.TYPE_COLUMN_FIELD, Constants.STYLE_VARIANT_TYPE);
    }
    if (ThemeRepository.isThemeReadOnly(themeId)) {
        stylesGR.addQuery(Constants.TYPE_COLUMN_FIELD, Constants.STYLE_CORE_TYPE)
    }
    stylesGR.query();
    return stylesGR;
};
ThemeRepository.getColors = function(styleStr) {
    var styleObj = JSON.parse(styleStr);
    if (ThemeRepository.isStyleObjectNil(styleObj)) {
        return null;
    }
    var colors = {};
    colors.primary = ThemeRepository._appendRGB(styleObj.properties[Constants.BRAND_PRIMARY_COLOR_HOOK_NAME]);
    colors.secondary = ThemeRepository._appendRGB(styleObj.properties[Constants.BRAND_SECONDARY_COLOR_HOOK_NAME]);
    colors.neutral = ThemeRepository._appendRGB(styleObj.properties[Constants.BRAND_NEUTRAL_COLOR_HOOK_NAME]);
    colors.additional = [];
    var additionalColorsRegex = Constants.ADDITIONAL_COLORS_REFERENCE_REGEX;
    var match = null;
    while ((match = additionalColorsRegex.exec(styleStr)) != null) {
        colors.additional.push({
            hook: match[0],
            value: ThemeRepository._appendRGB(styleObj.properties[match[0]])
        });
        // colors.additional.push(ThemeRepository._appendRGB(styleObj.properties[match[0]]));
    }
    return colors;
};
ThemeRepository.getTypographyStyle = function(styleStr) {
    var typography = {};
    if (gs.nil(styleStr)) {
        return typography;
    }
    var styleObj = JSON.parse(styleStr);
    var fontFamily = styleObj.properties[Constants.NOW_FONT_FAMILY_HOOK_NAME];
    if (fontFamily) {
        typography.value = fontFamily.split(Constants.COMMA)[0];
    }
    return typography;
};
ThemeRepository.getShapeStyle = function(styleStr) {
    var shape = {};
    if (gs.nil(styleStr)) {
        return shape;
    }
    var styleObj = JSON.parse(styleStr);
    shape.value = styleObj.properties[Constants.ACTIONABLE_BORDER_RADIUS_HOOK_NAME];
    return shape;
};
ThemeRepository.isHeaderLogo = function(m2mProperties) {
    if (gs.nil(m2mProperties)) {
        return false;
    }
    return JSON.parse(m2mProperties).position === Constants.IMAGE_LOCATION;
};
ThemeRepository.getLogosStyle = function(styleId) {
    var logos = [];
    var assetIds = [];
    var styleAssetM2M = new GlideRecordSecure(Constants.M2M_STYLE_ASSET_TABLE_NAME);
    styleAssetM2M.addQuery(Constants.STYLE_COLUMN_FIELD, styleId);
    styleAssetM2M.query();
    while (styleAssetM2M.next()) {
        var currLogo = {};
        currLogo.props = styleAssetM2M.getValue(Constants.PROPERTIES_COLUMN_FIELD);
        if (ThemeRepository.isHeaderLogo(currLogo.props)) {
            currLogo.m2mStyleAssetId = styleAssetM2M.getUniqueValue();
            currLogo.assetId = styleAssetM2M.getValue(Constants.ASSET_COLUMN_FIELD);
            logos.push(currLogo);
            assetIds.push(currLogo.assetId);
            break;
        }
    }
    var logosData = {};
    var attachment = new GlideRecordSecure(Constants.SYS_ATTACHEMENT_TABLE_NAME);
    attachment.addQuery(Constants.TABLE_ID_COLUMN_FIELD, assetIds);
    attachment.query();
    var gsAttachment = new GlideSysAttachment();
    while (attachment.next()) {
        logosData[attachment.getValue(Constants.TABLE_ID_COLUMN_FIELD)] = {
            file: gsAttachment.getContentBase64(attachment),
            fileName: attachment.getValue(Constants.FILE_NAME_COLUMN_FIELD),
            fileType: attachment.getValue(Constants.CONTENT_TYPE_COLUMN_FIELD),
            attachmentId: attachment.getUniqueValue()
        };
    }
    return logos.map(function(logo) {
        var logoData = logosData[logo.assetId] || {};
        logo.file = logoData.file;
        logo.fileName = logoData.fileName;
        logo.fileType = logoData.fileType;
        logo.attachmentId = logoData.attachmentId;
        return logo;
    });
};
ThemeRepository.getFontsForTypography = function(styleId) {
    var fonts = [];
    var assetIds = [];
    var styleAssetM2MGr = new GlideRecordSecure(Constants.M2M_STYLE_ASSET_TABLE_NAME);
    styleAssetM2MGr.addQuery(Constants.STYLE_COLUMN_FIELD, styleId);
    styleAssetM2MGr.query();
    while (styleAssetM2MGr.next()) {
        var properties = JSON.parse(styleAssetM2MGr.getValue('properties'));
        var assetGr = styleAssetM2MGr.asset.getRefRecord();
        fonts.push({
            name: assetGr.getValue("name"),
            url: `${gs.getProperty('glide.servlet.uri')}uxta/${assetGr.getValue('sys_id')}.assetx`,
            properties: {
                style: properties["font-style"],
                weight: properties["font-weight"],
                subFamily: properties["font-subfamily"]
            },
            assetId: assetGr.getValue('sys_id'),
            m2mStyleAssetId: styleAssetM2MGr.getValue('sys_id')
        })
    }

    return fonts
};
ThemeRepository.getAllExperiences = function() {
    var experiences = [];
    var adminConfigIds = [];
    var experienceGR = new GlideRecordSecure(Constants.SYS_UX_PAGE_REGISTRY_TABLE_NAME);
    experienceGR.addActiveQuery();
    // pull the children of the unified navigation app shell
    experienceGR.addUserEncodedQuery(
        'parent_app=c86a62e2c7022010099a308dc7c26022^admin_panel_table=sys_ux_app_config'
    );
    experienceGR.query();
    while (experienceGR.next()) {
        var experience = {
            id: experienceGR.getUniqueValue(),
            title: experienceGR.getValue(Constants.TITLE_COLUMN_FIELD),
            basePath: experienceGR.getValue(Constants.PATH_COLUMN_FIELD),
            adminPanelID: experienceGR.getValue(Constants.ADMIN_PANEL_COLUMN_FIELD)
        };
        adminConfigIds.push(experience.adminPanelID);
        experiences.push(experience);
    }
    var adminConfigGR = new GlideRecordSecure(Constants.SYS_UX_APP_CONFIG_TABLE_NAME);
    adminConfigGR.addActiveQuery();
    adminConfigGR.addQuery(Constants.SYS_ID_COLUMN_FIELD, adminConfigIds);
    adminConfigGR.query();
    var configData = {};
    while (adminConfigGR.next()) {
        configData[adminConfigGR.getUniqueValue()] = adminConfigGR.getValue(Constants.LANDING_PATH_COLUMN_FIELD);
    }
    experiences.forEach(function(experience) {
        experience.uri = [Constants.NOW, experience.basePath, configData[experience.adminPanelID]]
            .join(Constants.FORWARD_SLASH);
        return experience;
    });
    return experiences.filter(function(experience) {
        var appRouteGR = new GlideRecordSecure(Constants.SYS_UX_APP_ROUTE_TABLE_NAME);
        appRouteGR.addQuery(Constants.APP_CONFIG_COLUMN_FIELD, experience.adminPanelID);
        appRouteGR.addQuery(Constants.ROUTE_TYPE_COLUMN_FIELD, configData[experience.adminPanelID]);
        appRouteGR.query();
        return appRouteGR.next();
    });
};
ThemeRepository.deleteTheme = function(deleteThemeInput) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE,
    };
    try {
        var themeId = deleteThemeInput.id;
        var themeGR = ThemeRepository.getTheme(themeId);
        if (gs.nil(themeGR) || ThemeRepository.isThemeReadOnly(themeId)) {
            logObject.message = gs.getMessage('You need to get permission to delete this theme. Contact your system administrator for permission.');
            return logObject;
        }
        var themeStyleIds = [];
        var imageryStyleId;
        var themeStylesGR = ThemeRepository.getThemeStyles(themeId);
        var themeStyleM2M = new GlideRecordSecure(Constants.M2M_THEME_STYLE_TABLE_NAME);
        themeStyleM2M.addQuery(Constants.THEME_COLUMN_FIELD, themeId);
        themeStyleM2M.query();
        while (themeStylesGR.next()) {
            var styleName = themeStylesGR.getValue(Constants.NAME_COLUMN_FIELD);
            if (styleName === Constants.IMAGERY_STYLE_TYPE)
                imageryStyleId = themeStylesGR.getUniqueValue();
            themeStyleIds.push(themeStylesGR.getUniqueValue());
        }
        var imageryAssetId = '';
        var styleAssetM2M = new GlideRecordSecure(Constants.M2M_STYLE_ASSET_TABLE_NAME);
        styleAssetM2M.addQuery(Constants.STYLE_COLUMN_FIELD, themeStyleIds);
        styleAssetM2M.query();
        while (styleAssetM2M.next()) {
            if (styleAssetM2M.getValue(Constants.STYLE_COLUMN_FIELD) === imageryStyleId)
                imageryAssetId = styleAssetM2M.getValue(Constants.ASSET_COLUMN_FIELD);
        }
        var customizedGR = ThemeRepository.getCustomizationGR(themeId);
        if (!customizedGR.deleteRecord()) {
            if (ThemeRepository.isScopeSame(customizedGR.getValue(Constants.SYS_SCOPE_COLUMN_FIELD),
                    ThemeRepository.getScopeId())) {
                logObject.message = gs.getMessage('You need to get permission to delete this theme. Contact your system administrator for permission.');
            } else {
                logObject.message = ThemeRepository.getScopeErrorMessage(customizedGR.getDisplayValue(Constants.SYS_SCOPE_COLUMN_FIELD));
            }
            return logObject;
        }
        if (imageryAssetId !== '') {
            ThemeRepository.deleteFile(Constants.SYS_UX_THEME_ASSET_TABLE_NAME, imageryAssetId);
            var assetGR = new GlideRecordSecure(Constants.SYS_UX_THEME_ASSET_TABLE_NAME);
            assetGR.addQuery(Constants.SYS_ID_COLUMN_FIELD, imageryAssetId);
            assetGR.query();
            assetGR.deleteMultiple();
        }
        themeStyleM2M.deleteMultiple();
        styleAssetM2M.deleteMultiple();
        themeStylesGR.deleteMultiple();
        themeGR.deleteRecord();
        return {
            value: themeId
        };
    } catch (e) {
        gs.error(
            Constants.THEME_BUILDER_PREFIX +
            'Error while deleting the theme: ' +
            e.toString()
        );
        logObject.message = gs.getMessage('There was an error when trying to delete the theme. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};
ThemeRepository.createDuplicateTheme = function(createDuplicateThemeInput) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE,
    };
    try {
        var originalThemeId = createDuplicateThemeInput.id;
        var originalThemeGR = ThemeRepository.getTheme(originalThemeId);
        if (gs.nil(originalThemeGR) || ThemeRepository.isThemeReadOnly(originalThemeId)) {
            return logObject;
        }
        var currentThemeName = ThemeRepository.getUniqueNameForDuplicateTheme(Constants.SYS_UX_THEME_TABLE_NAME, originalThemeGR.getValue(Constants.NAME_COLUMN_FIELD));
        var duplicateThemeGR = ThemeRepository.createGR(
            Constants.SYS_UX_THEME_TABLE_NAME, {
                name: currentThemeName,
                description: originalThemeGR.getValue(Constants.DESCRIPTION_COLUMN_FIELD),
            }
        );
        if (gs.nil(duplicateThemeGR)) {
            logObject.message = gs.getMessage('You need to get permission to duplicate this theme. Contact your system administrator for permission.');
            return logObject;
        }
        var duplicateThemeId = duplicateThemeGR.getUniqueValue();
        var originalStylesGR = ThemeRepository.getThemeStyles(originalThemeId);
        var duplicateStylesMapper = {};
        var originalStyleIdsMapper = {};
        var variantIdMapper = {};
        while (originalStylesGR.next()) {
            var styleName = originalStylesGR.getValue(Constants.NAME_COLUMN_FIELD);
            originalStyleIdsMapper[styleName] =
                originalStylesGR.getUniqueValue();
            var styleId = (duplicateStylesMapper[styleName] =
                ThemeRepository.getUniqueValueAfterInsert(
                    Constants.SYS_UX_STYLE_TABLE_NAME, {
                        name: ThemeRepository.getUniqueNameForDuplicateVariant(originalStylesGR.getValue(Constants.NAME_COLUMN_FIELD), originalStylesGR.getValue(Constants.TYPE_COLUMN_FIELD)),
                        type: originalStylesGR.getValue(Constants.TYPE_COLUMN_FIELD),
                        style: originalStylesGR.getValue(Constants.STYLE_COLUMN_FIELD),
                    }
                ));
            ThemeRepository.getUniqueValueAfterInsert(
                Constants.M2M_THEME_STYLE_TABLE_NAME, {
                    theme: duplicateThemeId,
                    style: styleId,
                }
            );
            var type = originalStylesGR.getValue(Constants.TYPE_COLUMN_FIELD);
            if (type === 'variant') {
                var oldStyleId = originalStylesGR.getUniqueValue();
                variantIdMapper[oldStyleId] = styleId;
            }
        }
        Constants.UPLOAD_FONTS.forEach(function(font) {
            ThemeRepository.getUniqueValueAfterInsert(
                Constants.M2M_STYLE_ASSET_TABLE_NAME, {
                    style: duplicateStylesMapper[Constants.TYPOGRAPHY_STYLE_TYPE],
                    asset: font.asset,
                    properties: font.properties,
                }
            );
        });
        var originalImageryId = originalStyleIdsMapper[Constants.IMAGERY_STYLE_TYPE];
        var logoStyles = ThemeRepository.getLogosStyle(originalImageryId);
        if (logoStyles && Array.isArray(logoStyles) && logoStyles.length > 0) {
            var logo = logoStyles[0];
            var assetGR = ThemeRepository.createGR(
                Constants.SYS_UX_THEME_ASSET_TABLE_NAME, {
                    name: logo.fileName || Constants.EMPTY_STR,
                    category: Constants.IMAGE_CATEGORY_VALUE,
                }
            );
            if (!gs.nil(logo.file)) {
                ThemeRepository.uploadFile(
                    assetGR,
                    logo.fileName,
                    logo.fileType,
                    logo.file
                );
            }
            ThemeRepository.createGR(Constants.M2M_STYLE_ASSET_TABLE_NAME, {
                properties: logo.props,
                style: duplicateStylesMapper[Constants.IMAGERY_STYLE_TYPE],
                asset: assetGR.getUniqueValue(),
            });
        }
        var customizedDuplicateGR =
            ThemeRepository.getCustomizationGR(originalThemeId);
        var customizationObj = ThemeRepository.transformCustomizationStrToObject(customizedDuplicateGR.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD));
        var customizationStr = customizedDuplicateGR.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD);
        var groupName = customizationObj['groupName'];
        if (!gs.nil(groupName)) {
            var duplicatedGroupName = ThemeRepository.getUniqueNameForDuplicateGroup(groupName);
            customizationObj['groupName'] = duplicatedGroupName;
            customizationStr = ThemeRepository.transformCustomizationObjToStr(customizationObj);
            for (var oldVariantId in variantIdMapper) {
                customizationStr = customizationStr.replace(oldVariantId, variantIdMapper[oldVariantId]);
            }
        }
        ThemeRepository.createGR(
            Constants.SYS_UX_THEME_CUSTOMIZATION_TABLE_NAME, {
                name: customizedDuplicateGR.getValue(Constants.NAME_COLUMN_FIELD),
                theme: duplicateThemeId,
                customization: customizationStr,
            }
        );
        return duplicateThemeGR;
    } catch (e) {
        gs.error(
            Constants.THEME_BUILDER_PREFIX +
            'Error while duplicating the theme: ' +
            e.toString()
        );
        logObject.message = gs.getMessage('There was an error when trying to duplicate the theme. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};
ThemeRepository.createVariant = function(createVariantInput) {
    try {
        var name = createVariantInput.name;
        var groupName = createVariantInput.groupName;
        var themeId = createVariantInput.themeId;
        var isDark = createVariantInput.isDark;
        var coreThemeColors = createVariantInput.colors;
        var variantStyle = createVariantInput.variantStyle;
        var variantSysId = ThemeRepository.getUniqueValueAfterInsert(Constants.SYS_UX_STYLE_TABLE_NAME, {
            name: name,
            type: Constants.STYLE_VARIANT_TYPE,
            style: ThemeRepository.getVariantColors(coreThemeColors, isDark, variantStyle),
        });
        ThemeRepository.getUniqueValueAfterInsert(Constants.M2M_THEME_STYLE_TABLE_NAME, {
            theme: themeId,
            style: variantSysId
        });
        var customizationGR = ThemeRepository.getCustomizationGR(themeId);
        var customizationObj = ThemeRepository.transformCustomizationStrToObject(customizationGR.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD));
        var themeGr = ThemeRepository.getGR(Constants.SYS_UX_THEME_TABLE_NAME, 'sys_id=' + themeId);
        if (!gs.nil(customizationObj) && !gs.nil(groupName)) {
            customizationObj['groupName'] = groupName;
            customizationObj.variants[variantSysId] = {};
            customizationGR.setValue(Constants.CUSTOMIZATION_COLUMN_FIELD, ThemeRepository.transformCustomizationObjToStr(customizationObj));
            customizationGR.update();
        }
        return themeGr;
    } catch (e) {
        gs.error(
            Constants.THEME_BUILDER_PREFIX +
            'Error while duplicating the theme: ' +
            e.toString()
        );
    }
};
ThemeRepository.createTheme = function(createThemeInput) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {
        var name = createThemeInput.name;
        if (!ThemeRepository.validateNameInput(name)) {
            logObject.message = gs.getMessage('There was an error when adding your theme name. Try adding it again.');
            return logObject;
        }
        var themeGR = ThemeRepository.createGR(Constants.SYS_UX_THEME_TABLE_NAME, {
            name: name,
            description: createThemeInput.description || Constants.EMPTY_STR
        });
        if (gs.nil(themeGR)) {
            logObject.message = gs.getMessage('You need to get permission to create this theme. Contact your system administrator for permission.');
            return logObject;
        }
        var themeId = themeGR.getUniqueValue();
        var initial = Constants.THEME_BUILDER_INITIAL_THEME;
        var colorsStyleId = ThemeRepository.getUniqueValueAfterInsert(Constants.SYS_UX_STYLE_TABLE_NAME, {
            name: Constants.COLORS_STYLE_TYPE,
            type: Constants.STYLE_CORE_TYPE,
            style: ThemeRepository.getInitialColors()
        });
        var shapeStyleId = ThemeRepository.getUniqueValueAfterInsert(Constants.SYS_UX_STYLE_TABLE_NAME, {
            name: Constants.SHAPE_STYLE_TYPE,
            type: Constants.STYLE_CORE_TYPE,
            style: JSON.stringify(initial.shape)
        });
        var imageStyleId = ThemeRepository.getUniqueValueAfterInsert(Constants.SYS_UX_STYLE_TABLE_NAME, {
            name: Constants.IMAGERY_STYLE_TYPE,
            type: Constants.STYLE_CORE_TYPE,
            style: JSON.stringify(initial.imagery)
        });
        var typographyStyleId = ThemeRepository.getUniqueValueAfterInsert(Constants.SYS_UX_STYLE_TABLE_NAME, {
            name: Constants.TYPOGRAPHY_STYLE_TYPE,
            type: Constants.STYLE_CORE_TYPE,
            style: JSON.stringify(initial.typography)
        });
        var mobileStyleId = ThemeRepository.getUniqueValueAfterInsert(Constants.SYS_UX_STYLE_TABLE_NAME, {
            name: Constants.MOBILE_STYLE_TYPE,
            type: Constants.STYLE_CORE_TYPE,
            style: JSON.stringify(initial.mobile)
        });
        var ui16DashBoardId = ThemeRepository.getUniqueValueAfterInsert(Constants.SYS_UX_STYLE_TABLE_NAME, {
            name: Constants.DASHBOARD_VISUALIZATION_COMPATIBILITY,
            type: Constants.STYLE_CORE_TYPE,
            style: JSON.stringify(initial.ui16Dashboard)
        });
        [colorsStyleId, shapeStyleId, imageStyleId, typographyStyleId, mobileStyleId, ui16DashBoardId].forEach(function(styleId) {
            ThemeRepository.getUniqueValueAfterInsert(Constants.M2M_THEME_STYLE_TABLE_NAME, {
                theme: themeId,
                style: styleId
            });
        });
        Constants.UPLOAD_FONTS.forEach(function(font) {
            ThemeRepository.getUniqueValueAfterInsert(Constants.M2M_STYLE_ASSET_TABLE_NAME, {
                style: typographyStyleId,
                asset: font.asset,
                properties: font.properties
            });
        });

        const customizationGR = ThemeRepository.createGR(Constants.SYS_UX_THEME_CUSTOMIZATION_TABLE_NAME, {
            name: name,
            theme: themeId
        });
        const customizationObj = ThemeRepository.transformCustomizationStrToObject(customizationGR.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD));
        customizationObj['systemTokenVersion'] = Constants.SYSTEM_TOKEN_VERSION;
        customizationGR.setValue(Constants.CUSTOMIZATION_COLUMN_FIELD, ThemeRepository.transformCustomizationObjToStr(customizationObj));
        customizationGR.update();

        return themeGR;
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while creating the theme: ' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to create your theme. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};
ThemeRepository.getHighestOrderFromM2MAppTheme = function() {

    var gr = new GlideRecord(Constants.M2M_APP_THEME_TABLE_NAME);

    // Sort the records by the order field in descending order
    gr.orderByDesc('order');

    // Limit the result to one record
    gr.setLimit(1);

    // Execute the query
    gr.query();

    if (gr.next()) {
        // The GlideRecord with the highest order value is now available
        var order = gr.getValue('order');
        return order;
    } else {
        gs.info('No records found');
    }
    return -1
}

ThemeRepository.publishTheme = function(themeId, newOrder) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {
        if (newOrder) {
            newOrder = newOrder - 1;
            var m2mOrderForNewOrder = ThemeRepository.getM2MOrderAtIndex(newOrder);
            var themesInM2M = new GlideRecordSecure(Constants.M2M_APP_THEME_TABLE_NAME);
            themesInM2M.orderBy('order');
            themesInM2M.addQuery('order>=' + m2mOrderForNewOrder);
            themesInM2M.query();


            while (themesInM2M.hasNext()) {
                themesInM2M.next();
                themesInM2M.order = themesInM2M.order + 1;
                themesInM2M.update();
            }
            var m2mAppThemeGr = ThemeRepository.createGR(Constants.M2M_APP_THEME_TABLE_NAME, {
                theme: themeId,
                ux_app: Constants.UNIFIED_NAV_APP_SHELL_SYS_ID,
                order: +m2mOrderForNewOrder
            });
        } else {
            var order = ThemeRepository.getHighestOrderFromM2MAppTheme();

            var m2mAppThemeGr = ThemeRepository.createGR(Constants.M2M_APP_THEME_TABLE_NAME, {
                theme: themeId,
                ux_app: Constants.UNIFIED_NAV_APP_SHELL_SYS_ID,
                order: +order + 1
            });
        }
        var orderedM2mAppThemes = ThemeRepository.getPublishedThemeOrderMap();
        var themeBuilderOrder = orderedM2mAppThemes[themeId][0].order;
        var id = orderedM2mAppThemes[themeId][0].id;
        return {
            id: id,
            themeId: themeId,
            order: themeBuilderOrder,
            isPublished: true
        };
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while publishing the theme: ' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to publish your theme. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};

ThemeRepository.getM2MUXAppTheme = function(themeId) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {
        var orderedM2mAppThemes = ThemeRepository.getPublishedThemeOrderMap();
        if (themeId in orderedM2mAppThemes) {

            var themeBuilderOrder = orderedM2mAppThemes[themeId][0].order;
            var id = orderedM2mAppThemes[themeId][0].id;
            return {
                id: id,
                themeId: themeId,
                order: themeBuilderOrder,
                isPublished: true
            };
        } else {
            return {
                themeId: themeId,
                isPublished: false
            }
        }

    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while publishing the theme: ' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to publish your theme. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};

ThemeRepository.triggerUnpublishTheme = function(sysId) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {
        var m2mGr = ThemeRepository.getGR(Constants.M2M_APP_THEME_TABLE_NAME, 'sys_id=' + sysId);
        var themeId;
        var isDuplicateThemeRecordExistInM2MAppTheme = false;
        if (m2mGr) {
            themeId = m2mGr.getValue(Constants.THEME_COLUMN_FIELD);
            gs.eventQueue(Constants.UNPUBLISH_EVENT_NAME, m2mGr, sysId);
        }
        var sameThemeM2mGr = ThemeRepository.getRowCount(Constants.M2M_APP_THEME_TABLE_NAME, 'theme=' + themeId);
        if (sameThemeM2mGr > 1) isDuplicateThemeRecordExistInM2MAppTheme = true;
        return {
            themeId: themeId,
            id: sysId,
            isDuplicateThemeRecordExistInM2MAppTheme: isDuplicateThemeRecordExistInM2MAppTheme
        };
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while unpublishing the theme: ' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to unpublish your theme. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};

ThemeRepository.unpublishTheme = function(sysId) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {
        var m2mGr = ThemeRepository.getGR(Constants.M2M_APP_THEME_TABLE_NAME, 'sys_id=' + sysId);
        var themeId;
        var isDuplicateThemeRecordExistInM2MAppTheme = false;
        if (m2mGr) {
            themeId = m2mGr.getValue(Constants.THEME_COLUMN_FIELD);
            m2mGr.deleteRecord();

            // check if same theme referenced in m2m_app_theme
            var sameThemeM2mGr = ThemeRepository.getGR(Constants.M2M_APP_THEME_TABLE_NAME, 'theme=' + themeId);
            if (sameThemeM2mGr) isDuplicateThemeRecordExistInM2MAppTheme = true;

        }
        return {
            themeId: themeId,
            id: sysId,
            isDuplicateThemeRecordExistInM2MAppTheme: isDuplicateThemeRecordExistInM2MAppTheme
        };
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while unpublishing the theme: ' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to unpublish your theme. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};

ThemeRepository.getM2MOrderAtIndex = function(newOrder) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {

        var themeAtNewOrderIndex = new GlideRecordSecure(Constants.M2M_APP_THEME_TABLE_NAME);
        themeAtNewOrderIndex.orderBy('order');
        themeAtNewOrderIndex.query();

        var index = 0;
        while (themeAtNewOrderIndex.next()) {
            if (index === newOrder) {
                return themeAtNewOrderIndex.getValue('order');
            }
            index++;
        }
        return +themeAtNewOrderIndex.getValue('order') + 1;
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while getting the getM2MOrderAtIndex');
        logObject.message = gs.getMessage('There was an error when getting getM2MOrderAtIndex. Try it again or contact your system administrator for more help.');
        return logObject;
    }
}

ThemeRepository.triggerUpdateThemeOrder = function(sysId, newOrder) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };

    try {
        var m2mAppThemeGr = ThemeRepository.getGR(Constants.M2M_APP_THEME_TABLE_NAME, 'sys_id=' + sysId);
        var themeId = m2mAppThemeGr.theme;
        if (m2mAppThemeGr) {
            gs.eventQueue(Constants.UPDATE_THEME_ORDER_EVENT, m2mAppThemeGr, sysId, newOrder);
            return {
                themeId: m2mAppThemeGr.theme,
                id: sysId,
                order: newOrder,
            };
        }
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while marking the theme as default: ');
        logObject.message = gs.getMessage('There was an error when updating the theme order. Try it again or contact your system administrator for more help. Error details: {0}', e.toString());

        return logObject;
    }
};

ThemeRepository.updateThemeOrder = function(sysId, newOrder) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };

    try {
        var m2mOrderForNewOrder = ThemeRepository.getM2MOrderAtIndex(newOrder);
        var m2mAppThemeGr = ThemeRepository.getGR(Constants.M2M_APP_THEME_TABLE_NAME, 'sys_id=' + sysId);
        var m2mOrderForExistingOrder = m2mAppThemeGr.order;
        var themeId = m2mAppThemeGr.theme;
        if (m2mAppThemeGr) {
            if (m2mOrderForNewOrder > m2mOrderForExistingOrder) {
                var themesBetweenCurrentOrderAndNewOrder = new GlideRecordSecure(Constants.M2M_APP_THEME_TABLE_NAME);
                themesBetweenCurrentOrderAndNewOrder.addQuery('order>' + m2mOrderForExistingOrder);
                themesBetweenCurrentOrderAndNewOrder.addQuery('order<=' + m2mOrderForNewOrder);
                themesBetweenCurrentOrderAndNewOrder.query();
                while (themesBetweenCurrentOrderAndNewOrder.hasNext()) {
                    themesBetweenCurrentOrderAndNewOrder.next();
                    themesBetweenCurrentOrderAndNewOrder.order = themesBetweenCurrentOrderAndNewOrder.order - 1;
                    themesBetweenCurrentOrderAndNewOrder.update();
                }
                m2mAppThemeGr.order = m2mOrderForNewOrder;
                m2mAppThemeGr.update();
                return {
                    themeId: m2mAppThemeGr.theme,
                    id: sysId,
                    order: newOrder,
                };
            } else {
                var themesBetweenNewOrderAndCurrentOrder = new GlideRecordSecure(Constants.M2M_APP_THEME_TABLE_NAME);
                themesBetweenNewOrderAndCurrentOrder.addQuery('order<' + m2mOrderForExistingOrder);
                themesBetweenNewOrderAndCurrentOrder.addQuery('order>=' + m2mOrderForNewOrder);
                themesBetweenNewOrderAndCurrentOrder.query();
                while (themesBetweenNewOrderAndCurrentOrder.hasNext()) {
                    themesBetweenNewOrderAndCurrentOrder.next();
                    themesBetweenNewOrderAndCurrentOrder.order = themesBetweenNewOrderAndCurrentOrder.order + 1;
                    themesBetweenNewOrderAndCurrentOrder.update();
                }
                m2mAppThemeGr.order = m2mOrderForNewOrder;
                m2mAppThemeGr.update();
                return {
                    themeId: m2mAppThemeGr.theme,
                    id: sysId,
                    order: newOrder,
                };
            }

        }
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while marking the theme as default: ');
        logObject.message = gs.getMessage('There was an error when updating the theme order. Try it again or contact your system administrator for more help. Error details: {0}', e.toString());

        return logObject;
    }
};

ThemeRepository.updateTheme = function(updateThemeInput) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {
        var name = updateThemeInput.name;
        var description = updateThemeInput.description;
        var themeId = updateThemeInput.id;
        if (!ThemeRepository.validateNameInput(name)) {
            logObject.message = gs.getMessage('There was an error when adding your theme name. Try adding it again.');
            return logObject;
        }
        var themeGR = ThemeRepository.getGR(Constants.SYS_UX_THEME_TABLE_NAME,
            ThemeRepository.getQueryAfterAddingDomainToQueryArray([Constants.SYS_ID_QUERY_KEY, themeId]));
        var message = gs.getMessage('You need to get permission to update this theme. Contact your system administrator for permission.');
        if (gs.nil(themeGR)) {
            logObject.message = gmessage;
            return logObject;
        }
        themeGR.setValue(Constants.NAME_COLUMN_FIELD, name);
        themeGR.setValue(Constants.DESCRIPTION_COLUMN_FIELD, description);
        if (!themeGR.update()) {
            if (ThemeRepository.isScopeSame(themeGR.getValue(Constants.SYS_SCOPE_COLUMN_FIELD),
                    ThemeRepository.getScopeId())) {
                logObject.message = message;
            } else {
                logObject.message = ThemeRepository.getScopeErrorMessage(themeGR.getDisplayValue(Constants.SYS_SCOPE_COLUMN_FIELD));
            }
            return logObject;
        } else {
            return themeGR;
        }
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while updating the theme: ' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to update your theme. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};
ThemeRepository.updateThemeRecordForMobile = function(themeId) {
    try {
        if (themeId) {
            var grThemeStyle = new GlideRecordSecure('m2m_theme_style');
            grThemeStyle.addQuery('theme', themeId);
            grThemeStyle.query();
            var hasMobileStyle = false;
            var grStyle = new GlideRecordSecure('sys_ux_style');
            while (grThemeStyle.next()) {
                var styleId = grThemeStyle.getValue('style');
                grStyle.get(styleId);
                var styleObj = JSON.parse(grStyle.getValue('style'));
                if (styleObj.nativeMobile) {
                    hasMobileStyle = true;
                    break;
                }
            }
            if (!hasMobileStyle) {
                var mobileStyleId = ThemeRepository.getUniqueValueAfterInsert(Constants.SYS_UX_STYLE_TABLE_NAME, {
                    name: Constants.MOBILE_STYLE_TYPE,
                    type: Constants.STYLE_CORE_TYPE,
                    style: JSON.stringify(Constants.THEME_BUILDER_INITIAL_THEME.mobile)
                });
                ThemeRepository.getUniqueValueAfterInsert(Constants.M2M_THEME_STYLE_TABLE_NAME, {
                    theme: themeId,
                    style: mobileStyleId
                });
            }
        }
        return true;
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while updating the mobile theme: ' + e.toString());
        return false;
    }
};
ThemeRepository.getGeneratedColors = function(styleInput) {
    try {
        var styleObj = JSON.parse(styleInput);
        var props = GlideUxTheme.processBaseProperties(styleObj.base, styleObj.isDark, styleObj.colorGenerationVersion);
        return JSON.stringify(props);
    } catch (e) {
        return {};
    }
};
ThemeRepository.getCustomizationObj = function(themeId) {
    var customizationGR = ThemeRepository.getCustomizationGR(themeId);
    if (gs.nil(customizationGR)) {
        return {
            messageType: Constants.ERROR_LOG_TYPE,
            message: gs.getMessage('You need to get permission to view this customization. Contact your system administrator for permission.')
        }
    }
    var customizationObj = ThemeRepository.transformCustomizationStrToObject(customizationGR.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD));
    var appliedTheme = ThemeRepository.getAppliedThemeCustomization(themeId);
    if (appliedTheme) {
        customizationObj['theme'] = [appliedTheme];
    }
    // Don't send feedback to frontend
    delete customizationObj.feedback;
    return {
        id: customizationGR.getUniqueValue(),
        value: JSON.stringify(customizationObj)
    };
};
ThemeRepository.getCustomization = function(themeId) {
    if (ThemeRepository.isThemeReadOnly(themeId)) return null;
    var customizationGR = ThemeRepository.getCustomizationGR(themeId);
    var customizationObj = ThemeRepository.transformCustomizationStrToObject(customizationGR.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD));
    var appliedTheme = ThemeRepository.getAppliedThemeCustomization(themeId);
    if (appliedTheme) {
        customizationObj['theme'] = [appliedTheme];
    }
    // Don't send feedback to frontend
    delete customizationObj.feedback;
    return {
        id: customizationGR.getUniqueValue(),
        value: JSON.stringify(customizationObj),
        isPublishedTheme: customizationObj.isPublishedTheme,
        order: customizationObj.order
    };
};
ThemeRepository.updateAdditionalBrandColors = function(updateAdditionalBrandColorsInput) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {
        var styleId = updateAdditionalBrandColorsInput.id;
        var themeId = updateAdditionalBrandColorsInput.themeId;
        var additional = updateAdditionalBrandColorsInput.additional;
        var isVariant = updateAdditionalBrandColorsInput.isVariant;
        var themeStyleM2M = new GlideRecordSecure(Constants.M2M_THEME_STYLE_TABLE_NAME);
        themeStyleM2M.addQuery(Constants.STYLE_COLUMN_FIELD, styleId);
        themeStyleM2M.query();
        if (!ThemeRepository.validateAdditionalColorsInput(additional) || !themeStyleM2M.next()) {
            logObject.message = gs.getMessage('There was an error when adding your color. Try adding it again.');
            return logObject;
        }
        var styleGR = ThemeRepository.getGR(Constants.SYS_UX_STYLE_TABLE_NAME,
            ThemeRepository.getQueryAfterAddingDomainToQueryArray([Constants.SYS_ID_QUERY_KEY, styleId]));
        var message = gs.getMessage('You need to get permission to update this color. Contact your system administrator for permission.');
        if (gs.nil(styleGR)) {
            logObject.message = message;
            return logObject;
        }
        var customizationGR = ThemeRepository.getCustomizationGR(themeId);
        if (gs.nil(customizationGR) || ThemeRepository.isThemeReadOnly(themeId)) {
            logObject.message = message;
            return logObject;
        }
        var customizationObj = ThemeRepository.transformCustomizationStrToObject(customizationGR.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD));

        var styleStr = styleGR.getValue(Constants.STYLE_COLUMN_FIELD);
        var styleObj = JSON.parse(styleStr);
        var oldAdditionalColors = [],
            oldAdditionalColorKeys = [];
        if (additional && Array.isArray(additional)) {
            var match = null;
            while ((match = Constants.ADDITIONAL_COLORS_REFERENCE_REGEX.exec(styleStr)) != null) {
                oldAdditionalColors.push({
                    hook: match[0],
                    value: styleObj.properties[match[0]]
                });
                oldAdditionalColorKeys.push(match[0]);
            }
            for (var oldColorIdx = 0; oldColorIdx < oldAdditionalColors.length; oldColorIdx++) {
                var oldColor = oldAdditionalColors[oldColorIdx];

                var newColor = ThemeRepository.getAdditionalColor(additional, oldColor.hook);
                if (!newColor) {
                    delete styleObj.properties[oldColor.hook];
                    ThemeRepository.handleComponentUpdateOnColorRevert([{
                            id: oldColor.hook,
                            value: oldColor.value
                        }], {
                            styleObj: styleObj
                        },
                        customizationObj, {
                            isVariant: isVariant,
                            styleId: styleId
                        }
                    );
                } else if (newColor.value !== oldColor.value) {
                    styleObj.properties[oldColor.hook] = newColor.value;
                    ThemeRepository.handleComponentUpdateOnColorOverride([{
                            id: newColor.hook,
                            value: newColor.value
                        }], {
                            styleObj: styleObj
                        },
                        customizationObj, {
                            isVariant: isVariant,
                            styleId: styleId
                        }
                    );
                }
            }
            for (var newColorIdx = 0; newColorIdx < additional.length; newColorIdx++) {
                var newColor = additional[newColorIdx];
                if (oldAdditionalColorKeys.indexOf(newColor.hook) === -1) {
                    styleObj.properties[newColor.hook] = newColor.value;
                }
            }


            styleGR.setValue(Constants.STYLE_COLUMN_FIELD, JSON.stringify(styleObj, null, 2));
            if (!styleGR.update()) {
                if (ThemeRepository.isScopeSame(styleGR.getValue(Constants.SYS_SCOPE_COLUMN_FIELD),
                        ThemeRepository.getScopeId())) {
                    logObject.message = message;
                } else {
                    logObject.message = ThemeRepository.getScopeErrorMessage(styleGR.getDisplayValue(Constants.SYS_SCOPE_COLUMN_FIELD));
                }
                return logObject;
            }
            customizationGR.setValue(Constants.CUSTOMIZATION_COLUMN_FIELD, ThemeRepository.transformCustomizationObjToStr(customizationObj));
            customizationGR.update();
        }
        return styleGR;
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while updating the additional brand colors: ' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to update color. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};
ThemeRepository.getAdditionalColor = function(additionalColors, hook) {
    var additionalColor;
    for (var i = 0; i < additionalColors.length; i++) {
        if (additionalColors[i].hook === hook) {
            additionalColor = additionalColors[i];
            break;
        }

    }
    return additionalColor;

};

ThemeRepository.updateGroupName = function(themeId, groupName) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {
        var customizationGR = ThemeRepository.getCustomizationGR(themeId);
        var message = gs.getMessage('You need to get permission to update the theme group name. Contact your system administrator for permission.');
        if (gs.nil(customizationGR)) {
            logObject.message = message;
            return logObject;
        }

        var customizationObj = ThemeRepository.transformCustomizationStrToObject(customizationGR.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD));
        customizationObj.groupName = groupName;
        customizationGR.setValue(Constants.CUSTOMIZATION_COLUMN_FIELD, ThemeRepository.transformCustomizationObjToStr(customizationObj));
        customizationGR.update();
        return {
            id: themeId,
            value: JSON.stringify(customizationObj)
        };

    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while updating the theme group name ' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to update the theme group name. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};

ThemeRepository.updateBrandColors = function(updateBrandColorsInput) {
    try {
        var primary = updateBrandColorsInput.primary;
        var secondary = updateBrandColorsInput.secondary;
        var neutral = updateBrandColorsInput.neutral;
        var additional = updateBrandColorsInput.additional;
        var propertyOverrides = updateBrandColorsInput.propertyOverrides;
        var styleId = updateBrandColorsInput.id;
        var themeId = updateBrandColorsInput.themeId;
        var isSecondaryColorUpdated = updateBrandColorsInput.isSecondaryColorUpdated;
        var isVariant = updateBrandColorsInput.isVariant;
        var logObject = {
            messageType: Constants.ERROR_LOG_TYPE
        };
        var themeStyleM2M = new GlideRecordSecure(Constants.M2M_THEME_STYLE_TABLE_NAME);
        themeStyleM2M.addQuery(Constants.STYLE_COLUMN_FIELD, styleId);
        themeStyleM2M.query();
        if (!ThemeRepository.validateColorsInput(primary, secondary, neutral) || !themeStyleM2M.next()) {
            logObject.message = gs.getMessage('There was an error when adding your color. Try adding it again.');
            return logObject;
        }
        var customizationGR = ThemeRepository.getCustomizationGR(themeId);
        var message = gs.getMessage('You need to get permission to update this color. Contact your system administrator for permission.');
        if (gs.nil(customizationGR) || ThemeRepository.isThemeReadOnly(themeId)) {
            logObject.message = message;
            return logObject;
        }
        var styleGR = ThemeRepository.getGR(Constants.SYS_UX_STYLE_TABLE_NAME,
            ThemeRepository.getQueryAfterAddingDomainToQueryArray([Constants.SYS_ID_QUERY_KEY, styleId]));
        if (gs.nil(styleGR)) {
            logObject.message = message;
            return logObject;
        }
        var styleStr = styleGR.getValue(Constants.STYLE_COLUMN_FIELD);
        var styleObj = JSON.parse(styleStr);
        var customizationObj = ThemeRepository.transformCustomizationStrToObject(customizationGR.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD));
        var appliedTheme = ThemeRepository.getAppliedThemeCustomization(themeId);
        if (appliedTheme) {
            customizationObj['theme'] = [appliedTheme];
        }
        var variantDetails = {
            isVariant: isVariant,
            styleId: styleId
        };
        if (primary) {
            ThemeRepository.updatePrimaryColorInJSONObj(styleObj, primary);
            ThemeRepository.handleComponentUpdateOnPrimaryOverride(primary, {
                styleObj: styleObj
            }, customizationObj, variantDetails);
        }
        if (secondary) {
            ThemeRepository.updateSecondaryColorInJSONObj(styleObj, secondary);
            ThemeRepository.handleComponentUpdateOnSecondaryOverride(secondary, {
                styleObj: styleObj
            }, customizationObj, variantDetails);
        }
        if (neutral) {
            ThemeRepository.updateNeutralColorInJSONObj(styleObj, neutral);
            ThemeRepository.handleComponentUpdateOnNeutralOverride(neutral, {
                styleObj: styleObj
            }, customizationObj, variantDetails);
        }
        if (additional && Array.isArray(additional)) {
            var match = null;
            while ((match = Constants.ADDITIONAL_COLORS_REFERENCE_REGEX.exec(styleStr)) != null) {
                delete styleObj.properties[match[0]];
            }
            additional.forEach(function(color, index) {
                styleObj.properties[Constants.ADDITIONAL_COLORS_REFERENCE_PREFIX + index] = color;
            });
        }


        var customizedColors;
        if (isVariant) {
            customizedColors = customizationObj['variants'][styleId].colors;
        } else {
            customizedColors = customizationObj.colors;
        }

        if (customizedColors) {
            for (var color in customizedColors.overrides) {
                styleObj.base[color] = customizedColors.overrides[color];
            };
        }

        if (propertyOverrides && Array.isArray(propertyOverrides)) {
            propertyOverrides.forEach(function(propertyOverride) {
                styleObj.properties[propertyOverride.id] = propertyOverride.value;
            });
        }
        styleGR.setValue(Constants.STYLE_COLUMN_FIELD, JSON.stringify(styleObj, null, 2));
        if (!styleGR.update()) {
            if (ThemeRepository.isScopeSame(styleGR.getValue(Constants.SYS_SCOPE_COLUMN_FIELD),
                    ThemeRepository.getScopeId())) {
                logObject.message = message;
            } else {
                logObject.message = ThemeRepository.getScopeErrorMessage(styleGR.getDisplayValue(Constants.SYS_SCOPE_COLUMN_FIELD));
            }
            return logObject;
        }
        // Also update contrast ratio violations
        if (isSecondaryColorUpdated) {
            if (isVariant && customizationObj.variants.hasOwnProperty([styleId])) {
                customizationObj.variants[styleId].colors.isSecondaryColorUpdated = isSecondaryColorUpdated;

            } else {
                if (!customizationObj.colors.isSecondaryColorUpdated) {
                    customizationObj.colors.isSecondaryColorUpdated = isSecondaryColorUpdated;

                }
            }
        }
        customizationGR.setValue(Constants.CUSTOMIZATION_COLUMN_FIELD, ThemeRepository.transformCustomizationObjToStr(customizationObj));
        customizationGR.update();
        return styleGR;
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while updating the brand colors: ' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to update color. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};
ThemeRepository.updateStyle = function(styleId, properties, actionType) {
    var styleGR = ThemeRepository.getGR(Constants.SYS_UX_STYLE_TABLE_NAME,
        ThemeRepository.getQueryAfterAddingDomainToQueryArray([Constants.SYS_ID_QUERY_KEY, styleId]));
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    var themeStyleM2M = new GlideRecordSecure(Constants.M2M_THEME_STYLE_TABLE_NAME);
    themeStyleM2M.addQuery(Constants.STYLE_COLUMN_FIELD, styleId);
    themeStyleM2M.query();
    var shapeMessage = gs.getMessage('You need to get permission to update this shape. Contact your system administrator for permission.');
    var typographyMessage = gs.getMessage('You need to get permission to update this typography. Contact your system administrator for permission.');
    if (gs.nil(styleGR) || !themeStyleM2M.next()) {
        switch (actionType) {
            case 'shape':
                logObject.message = shapeMessage;
                break;
            case 'typography':
                logObject.message = typographyMessage;
                break;
        }
        return logObject;
    }
    var styleStr = styleGR.getValue(Constants.STYLE_COLUMN_FIELD);
    var styleObj = JSON.parse(styleStr);
    if (properties && Array.isArray(properties) && properties.length > 0) {
        properties.forEach(function(property) {
            styleObj.properties[property.id] = property.value;
        });
        styleGR.setValue(Constants.STYLE_COLUMN_FIELD, JSON.stringify(styleObj, null, 2));
        if (!styleGR.update()) {
            if (ThemeRepository.isScopeSame(styleGR.getValue(Constants.SYS_SCOPE_COLUMN_FIELD),
                    ThemeRepository.getScopeId())) {
                switch (actionType) {
                    case 'shape':
                        logObject.message = shapeMessage;
                        break;
                    case 'typography':
                        logObject.message = typographyMessage;
                        break;
                }
            } else {
                logObject.message = ThemeRepository.getScopeErrorMessage(styleGR.getDisplayValue(Constants.SYS_SCOPE_COLUMN_FIELD));
            }
            return logObject;
        }
    }
    return styleGR;
};
ThemeRepository.updateShape = function(updateShapeInput) {
    try {
        return ThemeRepository.updateStyle(updateShapeInput.id, updateShapeInput.properties, 'shape');
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while updating the shape: ' + e.toString());
        return {
            messageType: Constants.ERROR_LOG_TYPE,
            message: gs.getMessage('There was an error when trying to update the shape. Try it again or contact your system administrator for more help.')
        };
    }
};
ThemeRepository.updateTypography = function(updateTypographyInput) {
    try {
        return ThemeRepository.updateStyle(updateTypographyInput.id, updateTypographyInput.properties, 'typography');
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while updating the typography: ' + e.toString());
        return {
            messageType: Constants.ERROR_LOG_TYPE,
            message: gs.getMessage('There was an error when trying to update the typography. Try it again or contact your system administrator for more help.')
        };
    }
};

ThemeRepository.revertIllustrationOverride = function(revertIllustrationInput) {
    /*
     * This function is used to revert an illustration override.
     * It will delete the m2m record between the style and the asset.
     * It will also delete the asset record if it is not being used by any other style.
     * It will update the style record with the default asset.
     * It will also update the theme record with the new asset.
     * It will return the updated style record.
     */
    const logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {
        const {
            styleId,
            tokenId,
            themeId
        } = revertIllustrationInput;
        const styleGR = ThemeRepository.getGR(Constants.SYS_UX_STYLE_TABLE_NAME,
            ThemeRepository.getQueryAfterAddingDomainToQueryArray([Constants.SYS_ID_QUERY_KEY, styleId]));
        const message = gs.getMessage('You need to get permission to revert this illustration. Contact your system administrator for permission.');
        if (gs.nil(styleGR)) {
            logObject.message = message;
            return logObject;
        }
        const m2mStyleAsset = ThemeRepository.getGR(Constants.M2M_STYLE_ASSET_TABLE_NAME,
            ThemeRepository.getQueryAfterAddingDomainToQueryArray([Constants.STYLE_QUERY_KEY, styleId]));
        if (m2mStyleAsset) {
            const assetId = m2mStyleAsset.getValue(Constants.ASSET_COLUMN_FIELD);
            const assetGR = ThemeRepository.getGR(Constants.SYS_UX_THEME_ASSET_TABLE_NAME,
                ThemeRepository.getQueryAfterAddingDomainToQueryArray([Constants.SYS_ID_QUERY_KEY, assetId]));
            if (assetGR) {
                ThemeRepository.deleteFile(Constants.SYS_UX_THEME_ASSET_TABLE_NAME, assetId);

                const customization = ThemeRepository.updateCustomizationForIllustration(themeId, {
                    value: '',
                    id: tokenId,
                    type: Constants.COMPONENT_HOOK_DEFAULT
                }, true);

                const styleErrorResponse = ThemeRepository.updateStyleGRWithIllustration(styleGR, null, tokenId, message, true);
                if (styleErrorResponse) return styleErrorResponse;
                return {
                    imagery: {
                        ...styleGR
                    },
                    customization
                }
            }
        }
        logObject.message = gs.getMessage('There was an error when trying to revert the illustration. Try it again or contact your system administrator for more help.');
        return logObject;
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while reverting the illustration: ' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to revert the illustration. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};

ThemeRepository.updateCustomizationForCustomFont = function(themeId, fontFamilyName) {
    var customizationGr = ThemeRepository.getCustomizationGR(themeId);
    if (customizationGr) {
        const transformedCustomizationObj = ThemeRepository.transformCustomizationStrToObject(customizationGr.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD));
        if (!transformedCustomizationObj?.typography)
            transformedCustomizationObj.typography = {};
        if (!transformedCustomizationObj.typography?.customFonts)
            transformedCustomizationObj.typography.customFonts = []
        const customFonts = transformedCustomizationObj.typography.customFonts;
        if (customFonts?.findIndex(font => (font?.name === fontFamilyName)) === -1) customFonts.push({
            name: fontFamilyName,
            createdAt: new GlideDateTime().toString()
        });
        customizationGr.setValue(Constants.CUSTOMIZATION_COLUMN_FIELD, ThemeRepository.transformCustomizationObjToStr(transformedCustomizationObj));
        customizationGr.update();
    }
};

ThemeRepository.uploadCustomFonts = function(params) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE,
    };
    try {
        var {
            themeId,
            fontsPayload
        } = params;
        if (!themeId) throw new Error("No valid theme id present");

        var themeGr = ThemeRepository.getGR(Constants.SYS_UX_THEME_TABLE_NAME, Constants.SYS_ID_QUERY_KEY + themeId);
        if (!(themeGr && themeGr.isValidRecord())) throw new Error("No valid theme id present");

        var m2mStyleGr = new GlideRecord(Constants.M2M_THEME_STYLE_TABLE_NAME);
        m2mStyleGr.addQuery(Constants.THEME_COLUMN_FIELD, themeId);
        var typographyStyleGr = m2mStyleGr.addJoinQuery(Constants.SYS_UX_STYLE_TABLE_NAME, Constants.STYLE_COLUMN_FIELD, Constants.SYS_ID_COLUMN_FIELD);
        typographyStyleGr.addCondition(Constants.NAME_COLUMN_FIELD, Constants.TYPOGRAPHY_STYLE_TYPE)
        m2mStyleGr.query();

        var typographyStyleGr = undefined
        while (m2mStyleGr.next()) {
            typographyStyleGr = m2mStyleGr.style.getRefRecord();
        }

        if (!(typographyStyleGr && typographyStyleGr.isValidRecord())) throw new Error("Not found the typography style");
        var fontFamilyName;
        fontsPayload.forEach((fontData) => {
            var {
                metadata,
                font
            } = fontData;
            fontFamilyName = metadata.fontFamily;
            var assetGR = ThemeRepository.createGR(Constants.SYS_UX_THEME_ASSET_TABLE_NAME, {
                name: fontFamilyName,
                category: "font"
            });

            var m2mStyleAssetGr = ThemeRepository.createGR(Constants.M2M_STYLE_ASSET_TABLE_NAME, {
                properties: JSON.stringify({
                    "font-style": metadata.fontStyle,
                    "font-weight": metadata.fontWeight,
                    "font-subfamily": metadata.fontSubfamily
                }),
                style: typographyStyleGr.getValue(Constants.SYS_ID_COLUMN_FIELD),
                asset: assetGR.getUniqueValue()
            });

            ThemeRepository.uploadFile(
                assetGR,
                metadata.fontFileName,
                'application/octet-stream',
                font
            );

        })

        ThemeRepository.updateCustomizationForCustomFont(themeId, fontFamilyName)
        return {
            customization: {
                ...themeGr
            },
            typography: {
                ...typographyStyleGr
            }
        }
    } catch (e) {
        gs.error(
            Constants.THEME_BUILDER_PREFIX +
            'Error while uploading custom font: ' +
            e.toString()
        );
        logObject.message = gs.getMessage('There was an error when trying to upload a custom font. Try it again or contact your system administrator for more help.');
        return logObject;
    }
}

ThemeRepository.getExistingAssetId = (styleGR, tokenId) => {

    let styleObj = JSON.parse(styleGR.getValue("style"));

    let illustrationId = styleObj?.properties?.[tokenId];
    if (illustrationId) {
        extractIdFromPath(illustrationId)
    }

    return null;

    function extractIdFromPath(path) {
        const match = path.match(/\/uxta\/([^\/]+)\.assetx$/);
        return match ? match[1] : null;
    }
}

ThemeRepository.uploadIllustration = function(uploadIllustrationInput) {
    /*
        * This function is used to upload an illustration to a style.
        * It will create a new asset if it doesn't exist, or update the existing one.
        * It will also create a new m2m record between the style and the asset.
        Steps involved:
        1. Store the illustration in attachement table
        2. Create the asset record if it doesn't exist, update it with attachement
        3. Create the m2m record between the style and the asset
        4. Update the style record with the new asset
        5. Return the updated style record
        */

    const logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {
        const {
            styleId,
            file,
            fileName,
            fileType,
            tokenId,
            themeId
        } = uploadIllustrationInput;
        const fileInfo = ThemeRepository.getFileNameAndExtension(fileName);
        if (gs.nil(fileInfo)) {
            logObject.message = gs.getMessage('There was an error when adding your illustration. Try adding it again.');
            return logObject;
        }
        const styleGR = ThemeRepository.getGR(Constants.SYS_UX_STYLE_TABLE_NAME,
            ThemeRepository.getQueryAfterAddingDomainToQueryArray([Constants.SYS_ID_QUERY_KEY, styleId]));
        const message = gs.getMessage('You need to get permission to upload this file. Contact your system administrator for permission.');
        if (gs.nil(styleGR)) {
            logObject.message = message;
            return logObject;
        }
        let assetGR = null;
        let createM2MRecord = true;
        const assetId = ThemeRepository.getExistingAssetId(styleGR, tokenId);
        let m2mStyleAsset;
        if (assetId) {
            m2mStyleAsset = ThemeRepository.getGR(Constants.M2M_STYLE_ASSET_TABLE_NAME,
                ThemeRepository.getQueryAfterAddingDomainToQueryArray([Constants.STYLE_QUERY_KEY, styleId]) + `^${Constants.ASSET_COLUMN_FIELD}=${assetId}`);
        }
        if (m2mStyleAsset) {
            assetGR = ThemeRepository.getGR(Constants.SYS_UX_THEME_ASSET_TABLE_NAME,
                ThemeRepository.getQueryAfterAddingDomainToQueryArray([Constants.SYS_ID_QUERY_KEY, assetId]));
            if (gs.nil(assetGR)) {
                logObject.message = message;
                return logObject;
            }
            assetGR.setValue(Constants.NAME_COLUMN_FIELD, fileInfo.fileName);
            if (!assetGR.update()) {
                if (ThemeRepository.isScopeSame(assetGR.getValue(Constants.SYS_SCOPE_COLUMN_FIELD),
                        ThemeRepository.getScopeId())) {
                    logObject.message = message;
                } else {
                    logObject.message = ThemeRepository.getScopeErrorMessage(assetGR.getDisplayValue(Constants.SYS_SCOPE_COLUMN_FIELD));
                }
                return logObject;
            }
            ThemeRepository.deleteFile(Constants.SYS_UX_THEME_ASSET_TABLE_NAME, assetId);
            createM2MRecord = false;
        } else {
            assetGR = ThemeRepository.createGR(Constants.SYS_UX_THEME_ASSET_TABLE_NAME, {
                name: fileInfo.fileName,
                category: Constants.IMAGE_CATEGORY_VALUE
            });
            if (gs.nil(assetGR)) {
                logObject.message = message;
                return logObject;
            }
        }
        ThemeRepository.uploadFile(assetGR, fileName, fileType, file);
        if (createM2MRecord) {
            const illustrationProperties = JSON.stringify({
                size: uploadIllustrationInput.size,
            }, null, 2);
            ThemeRepository.createGR(Constants.M2M_STYLE_ASSET_TABLE_NAME, {
                properties: illustrationProperties,
                style: styleGR.getUniqueValue(),
                asset: assetGR.getUniqueValue()
            });
        }
        const customization = ThemeRepository.updateCustomizationForIllustration(themeId, {
            value: fileName,
            id: tokenId,
            type: Constants.COMPONENT_HOOK_OVERRIDDEN
        }, false);
        const styleResponse = ThemeRepository.updateStyleGRWithIllustration(styleGR, assetGR.getUniqueValue(), tokenId, message);
        if (styleResponse) return styleResponse;

        return {
            customization,
            imagery: {
                ...styleGR
            }
        }
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while creating the illustration: ' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to create your illustration. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};
ThemeRepository.updateCustomizationForIllustration = function(themeId, imageDetails, isRevert) {
    const logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {
        const customizationGR = ThemeRepository.getCustomizationGR(themeId);
        const message = gs.getMessage('You need to get permission to update the theme group name. Contact your system administrator for permission.');
        if (gs.nil(customizationGR)) {
            logObject.message = message;
            return logObject;
        }

        const customizationObj = ThemeRepository.transformCustomizationStrToObject(customizationGR.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD));
        if (!customizationObj?.imagery)
            customizationObj.imagery = {};
        if (!customizationObj.imagery?.overrides)
            customizationObj.imagery.overrides = {}

        const imageryOverrides = customizationObj.imagery.overrides;
        if (isRevert) {
            delete imageryOverrides[imageDetails.id];
        } else {
            imageryOverrides[imageDetails.id] = imageDetails.value;
        }

        customizationGR.setValue(Constants.CUSTOMIZATION_COLUMN_FIELD, ThemeRepository.transformCustomizationObjToStr(customizationObj));
        customizationGR.update();
        return {
            id: themeId,
            value: JSON.stringify(customizationObj)
        };

    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while updating the illustration in customiation' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to update the illustration customization. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};

ThemeRepository.updateStyleGRWithIllustration = (styleGR, assetSysId, tokenId, message, isRevert) => {
    let styleObj = JSON.parse(styleGR.getValue("style"));
    if (!styleObj) styleObj = {};
    if (!styleObj.properties) styleObj.properties = {};
    if (isRevert)
        delete styleObj.properties[tokenId];
    else
        styleObj.properties[tokenId] = `/uxta/${assetSysId}.assetx`
    styleGR.setValue(Constants.STYLE_COLUMN_FIELD, JSON.stringify(styleObj, null, 2));
    return ThemeRepository.updateStyleRecord(styleGR, message); // if style record update is succeeded then there is no value returned, so styleGR should be returned.
}
ThemeRepository.createLogo = function(createLogoInput) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {
        var styleId = createLogoInput.styleId;
        var file = createLogoInput.file;
        var fileName = createLogoInput.fileName;
        var fileType = createLogoInput.fileType;
        var logoProperties = JSON.stringify({
            position: Constants.IMAGE_LOCATION
        }, null, 2);
        var fileInfo = ThemeRepository.getFileNameAndExtension(fileName);
        if (gs.nil(fileInfo)) {
            logObject.message = gs.getMessage('There was an error when adding your logo. Try adding it again.');
            return logObject;
        }
        var styleGR = ThemeRepository.getGR(Constants.SYS_UX_STYLE_TABLE_NAME,
            ThemeRepository.getQueryAfterAddingDomainToQueryArray([Constants.SYS_ID_QUERY_KEY, styleId]));
        var message = gs.getMessage('You need to get permission to create this logo. Contact your system administrator for permission.');
        if (gs.nil(styleGR)) {
            logObject.message = message;
            return logObject;
        }
        var assetGR = null;
        var createM2MRecord = true;
        var m2mStyleAsset = ThemeRepository.getGR(Constants.M2M_STYLE_ASSET_TABLE_NAME,
            ThemeRepository.getQueryAfterAddingDomainToQueryArray([Constants.STYLE_QUERY_KEY, styleId]));
        if (m2mStyleAsset) {
            // If logo existed already.
            var assetId = m2mStyleAsset.getValue(Constants.ASSET_COLUMN_FIELD);
            assetGR = ThemeRepository.getGR(Constants.SYS_UX_THEME_ASSET_TABLE_NAME,
                ThemeRepository.getQueryAfterAddingDomainToQueryArray([Constants.SYS_ID_QUERY_KEY, assetId]));
            if (gs.nil(assetGR)) {
                logObject.message = message;
                return logObject;
            }
            assetGR.setValue(Constants.NAME_COLUMN_FIELD, fileInfo.fileName);
            if (!assetGR.update()) {
                if (ThemeRepository.isScopeSame(assetGR.getValue(Constants.SYS_SCOPE_COLUMN_FIELD),
                        ThemeRepository.getScopeId())) {
                    logObject.message = message;
                } else {
                    logObject.message = ThemeRepository.getScopeErrorMessage(assetGR.getDisplayValue(Constants.SYS_SCOPE_COLUMN_FIELD));
                }
                return logObject;
            }
            ThemeRepository.deleteFile(Constants.SYS_UX_THEME_ASSET_TABLE_NAME, assetId);
            createM2MRecord = false;
        } else {
            assetGR = ThemeRepository.createGR(Constants.SYS_UX_THEME_ASSET_TABLE_NAME, {
                name: fileInfo.fileName,
                category: Constants.IMAGE_CATEGORY_VALUE
            });
            if (gs.nil(assetGR)) {
                logObject.message = message;
                return logObject;
            }
        }
        ThemeRepository.uploadFile(assetGR, fileName, fileType, file);
        if (createM2MRecord) {
            ThemeRepository.createGR(Constants.M2M_STYLE_ASSET_TABLE_NAME, {
                properties: logoProperties,
                style: styleGR.getUniqueValue(),
                asset: assetGR.getUniqueValue()
            });
        }
        return styleGR;
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error creating the logo: ' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to create your logo. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};
ThemeRepository.updateLogo = function(updateLogoInput) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {
        var assetId = updateLogoInput.assetId;
        var file = updateLogoInput.file;
        var fileName = updateLogoInput.fileName;
        var fileType = updateLogoInput.fileType;
        var fileInfo = ThemeRepository.getFileNameAndExtension(fileName);
        if (gs.nil(fileInfo)) {
            logObject.message = gs.getMessage('There was an error when adding your logo. Try adding it again.');
            return logObject;
        }
        var assetGR = ThemeRepository.getGR(Constants.SYS_UX_THEME_ASSET_TABLE_NAME,
            ThemeRepository.getQueryAfterAddingDomainToQueryArray([Constants.SYS_ID_QUERY_KEY, assetId]));
        var message = gs.getMessage('You need to get permission to update this logo. Contact your system administrator for permission.');
        if (gs.nil(assetGR)) {
            logObject.message = message;
            return logObject;
        }
        assetGR.setValue(Constants.NAME_COLUMN_FIELD, fileInfo.fileName);
        if (!assetGR.update()) {
            if (ThemeRepository.isScopeSame(assetGR.getValue(Constants.SYS_SCOPE_COLUMN_FIELD),
                    ThemeRepository.getScopeId())) {
                logObject.message = message;
            } else {
                logObject.message = ThemeRepository.getScopeErrorMessage(assetGR.getDisplayValue(Constants.SYS_SCOPE_COLUMN_FIELD));
            }
            return logObject;
        }
        ThemeRepository.deleteFile(Constants.SYS_UX_THEME_ASSET_TABLE_NAME, assetId);
        return {
            value: ThemeRepository.uploadFile(assetGR, fileName, fileType, file)
        };
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error updating the logo: ' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to update your logo. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};
ThemeRepository.removeLogo = function(removeLogoInput) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {
        var m2mStyleAssetId = removeLogoInput.m2mStyleAssetId;
        var m2mStyleAssetGR = ThemeRepository.getGR(Constants.M2M_STYLE_ASSET_TABLE_NAME,
            ThemeRepository.getQueryAfterAddingDomainToQueryArray([Constants.SYS_ID_QUERY_KEY, m2mStyleAssetId]));
        var message = gs.getMessage('You need to get permission to remove this logo. Contact your system administrator for permission.');
        if (gs.nil(m2mStyleAssetGR)) {
            logObject.message = message;
            return logObject;
        }
        var assetId = m2mStyleAssetGR.getValue(Constants.ASSET_COLUMN_FIELD);
        var assetGR = ThemeRepository.getGR(Constants.SYS_UX_THEME_ASSET_TABLE_NAME,
            ThemeRepository.getQueryAfterAddingDomainToQueryArray([Constants.SYS_ID_QUERY_KEY, assetId]));
        if (gs.nil(assetGR)) {
            logObject.message = message;
            return logObject;
        }
        if (!(m2mStyleAssetGR.deleteRecord() && ThemeRepository.deleteFile(Constants.SYS_UX_THEME_ASSET_TABLE_NAME, assetId) &&
                assetGR.deleteRecord())) {
            if (ThemeRepository.isScopeSame(assetGR.getValue(Constants.SYS_SCOPE_COLUMN_FIELD),
                    ThemeRepository.getScopeId())) {
                logObject.message = gs.getMessage('It looks like someone else already did that. Try refreshing your page to see an updated view.');
            } else {
                logObject.message = ThemeRepository.getScopeErrorMessage(assetGR.getDisplayValue(Constants.SYS_SCOPE_COLUMN_FIELD));
            }
            return logObject;
        }
        return {
            value: true
        };
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error removing the logo: ' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to remove the logo. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};
ThemeRepository.updateColorOverride = function(updateColorOverrideInput) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {
        var styleId = updateColorOverrideInput.id;
        var themeId = updateColorOverrideInput.themeId;
        var override = updateColorOverrideInput.override;
        var propertyOverrides = updateColorOverrideInput.propertyOverrides;
        var isVariant = updateColorOverrideInput.isVariant;
        var isRevert = updateColorOverrideInput.isRevert;
        var primaryDependentBaseHooks = [
            Constants.PRIMARY_COLOR_HOOK_NAME,
            Constants.SURFACE_BRAND_COLOR_HOOK_NAME,
            Constants.SELECTION_PRIMARY_COLOR_HOOK_NAME,
            Constants.CHROME_BRAND_COLOR_HOOK_NAME,
            Constants.CHROME_DIVIDER_COLOR_HOOK_NAME,
            Constants.INTERACTIVE_COLOR_HOOK_NAME,
        ];


        var secondaryDependentBaseHooks = [
            Constants.SECONDARY_COLOR_HOOK_NAME,
            Constants.SELECTION_SECONDARY_COLOR_HOOK_NAME,
            Constants.SURFACE_BRAND_COLOR_HOOK_NAME
        ];

        var neutralDependentBaseHooks = [
            Constants.NEUTRAL_COLOR_HOOK_NAME,
            Constants.SECONDARY_NAV_BRAND_COLOR_HOOK_NAME,
            Constants.SECONDARY_NAV_DIVIDER_COLOR_HOOK_NAME
        ];

        var updateColorPermissionMessage = gs.getMessage('You need to get permission to update this color. Contact your system administrator for permission.');
        var styleGR = ThemeRepository.getGR(Constants.SYS_UX_STYLE_TABLE_NAME,
            ThemeRepository.getQueryAfterAddingDomainToQueryArray([Constants.SYS_ID_QUERY_KEY, styleId]));
        if (gs.nil(styleGR)) {
            logObject.message = updateColorPermissionMessage;
            return logObject;
        }
        var styleStr = styleGR.getValue(Constants.STYLE_COLUMN_FIELD);
        var styleObj = JSON.parse(styleStr);

        let overrideValue;
        if (isRevert) {
            if (primaryDependentBaseHooks.includes(override.id)) {
                overrideValue = styleObj.properties[Constants.BRAND_PRIMARY_COLOR_HOOK_NAME];
            } else if (secondaryDependentBaseHooks.includes(override.id)) {
                overrideValue = styleObj.properties[Constants.BRAND_SECONDARY_COLOR_HOOK_NAME];
            } else if (neutralDependentBaseHooks.includes(override.id)) {
                overrideValue = styleObj.properties[Constants.BRAND_NEUTRAL_COLOR_HOOK_NAME];
            } else {
                overrideValue = ThemeRepository.getInitialHookValueForBaseColors(override.id);
            }
        } else {
            overrideValue = override.value;
        }

        if (!ThemeRepository.validateRGB(overrideValue)) {
            logObject.message = gs.getMessage('There was an error when adding your color. Try adding it again.');
            return logObject;
        }
        var customizationGR = ThemeRepository.getCustomizationGR(themeId);
        if (gs.nil(customizationGR) || ThemeRepository.isThemeReadOnly(themeId)) {
            logObject.message = updateColorPermissionMessage;
            return logObject;
        }
        styleObj.base[override.id] = overrideValue;
        if (propertyOverrides && Array.isArray(propertyOverrides)) {
            propertyOverrides.forEach(function(propertyOverride) {
                styleObj.properties[propertyOverride.id] = propertyOverride.value;
            });
        }

        var customizationObj = ThemeRepository.transformCustomizationStrToObject(customizationGR.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD));
        var appliedTheme = ThemeRepository.getAppliedThemeCustomization(themeId);
        if (appliedTheme) {
            customizationObj['theme'] = [appliedTheme];
        }
        var styleObjForResult = {
            base: {},
            properties: {}
        };
        ThemeRepository.handleComponentUpdateOnColorOverride([{
            id: override.id,
            value: overrideValue
        }], {
            styleObj: styleObj,
            styleObjForResult: styleObjForResult.properties
        }, customizationObj, {
            isVariant: isVariant,
            styleId: styleId
        });
        styleGR.setValue(Constants.STYLE_COLUMN_FIELD, JSON.stringify(styleObj, null, 2));
        if (!styleGR.update()) {
            if (ThemeRepository.isScopeSame(styleGR.getValue(Constants.SYS_SCOPE_COLUMN_FIELD),
                    ThemeRepository.getScopeId())) {
                logObject.message = updateColorPermissionMessage;
            } else {
                logObject.message = ThemeRepository.getScopeErrorMessage(styleGR.getDisplayValue(Constants.SYS_SCOPE_COLUMN_FIELD));
            }
            return logObject;
        }

        if (isVariant) {
            if (!customizationObj.variants)
                customizationObj.variants = {};
            if (!customizationObj.variants[styleId]) {
                customizationObj.variants[styleId] = {
                    colors: {
                        overrides: {}
                    }
                };
            }
            if (isRevert) {
                delete customizationObj.variants[styleId].colors.overrides[override.id];
            } else {
                customizationObj.variants[styleId].colors.overrides[override.id] = overrideValue;
            }
        } else {
            if (isRevert) {
                delete customizationObj.colors.overrides[override.id];
            } else {
                customizationObj.colors.overrides[override.id] = overrideValue;
            }
        }

        customizationGR.setValue(Constants.CUSTOMIZATION_COLUMN_FIELD, ThemeRepository.transformCustomizationObjToStr(customizationObj));
        customizationGR.update();
        return styleGR;
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while updating the color overrides: ' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to update the colors. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};

ThemeRepository.handleComponentUpdateOnColorRevert = function(globalHooksArr, styleDetails, customizationObj, variantDetails) {
    var baseColors, componentOverrides;
    var baseAndCompOverrides = ThemeRepository.getBaseAndComponentOverrides(customizationObj, variantDetails);
    baseColors = baseAndCompOverrides.baseColors, componentOverrides = baseAndCompOverrides.componentOverrides;

    for (var i = 0; i < globalHooksArr.length; i++) {
        var globalHookId = globalHooksArr[i].id;
        Object.keys(baseColors).forEach(function(componentId) {
            var compBaseColors = baseColors[componentId];
            Object.keys(compBaseColors).forEach(function(id) {
                var baseColor = compBaseColors[id];
                if (!baseColor.hook) return;
                var baseHook = baseColor.hook;
                baseHook = '--' + baseHook;
                if (baseHook === globalHookId) {
                    var baseHookDetails = {
                        id: id,
                        component: componentId,
                    };
                    ThemeRepository.updateStyleAndCustomizationOnBaseRevert(baseHookDetails, styleDetails, customizationObj, variantDetails);
                }
            });

        });

        Object.keys(componentOverrides).forEach(function(componentHookId) {
            var componentColor = componentOverrides[componentHookId];
            if (!componentColor.hook) return;
            var componentHook = componentColor.hook;
            componentHook = '--' + componentHook;
            var componentHookDetails = {
                id: componentHookId
            }
            if (componentHook === globalHookId) {
                ThemeRepository.updateStyleAndCustomizationOnComponentRevert(componentHookDetails, styleDetails, customizationObj, variantDetails);
            }

        });
    }
};

ThemeRepository.updateStyleAndCustomizationOnBaseRevert = function(hookDetails, styleDetails, customizationObj, variantDetails) {
    var hookId = hookDetails.id;
    var component = hookDetails.component;
    var styleObj = styleDetails.styleObj,
        styleObjForResult = styleDetails.styleObjForResult;
    var variantStyleId = variantDetails.styleId;

    var baseColorObj = ThemeRepository.getBaseColorObject(component, hookId);
    var dependentHooks = baseColorObj.hooks;

    var initialHookValues = ThemeRepository.getInitialHookValues(dependentHooks, 'colors');
    const initialValuesFromCustomizationObj = ThemeRepository.getInitialValuesFromCustomization(customizationObj, variantDetails.isVariant, variantStyleId);

    for (var i = 0; i < dependentHooks.length; i++) {
        dependentHook = dependentHooks[i];
        if (!ThemeRepository.isHookOverriden(dependentHook, customizationObj, 'colors', '', variantDetails)) {
            const initialHookVal = initialValuesFromCustomizationObj[dependentHook] || initialHookValues[dependentHook];
            initialHookVal && (styleObj.properties[dependentHook] = initialHookVal);
            initialHookVal && styleObjForResult && (styleObjForResult[dependentHook] = initialHookVal);
        }
    }

    if (variantDetails.isVariant) {
        customizationObj.variants[variantStyleId].colors.baseColors[component] && delete customizationObj.variants[variantStyleId].colors.baseColors[component][hookId];
    } else {
        customizationObj.colors.baseColors[component] && delete customizationObj.colors.baseColors[component][hookId];
    }
};

ThemeRepository.updateStyleAndCustomizationOnComponentRevert = function(hookDetails, styleDetails, customizationObj, variantDetails) {
    var hookId = hookDetails.id;
    var component = hookDetails.component;
    var styleObj = styleDetails.styleObj,
        styleObjForResult = styleDetails.styleObjForResult;
    var variantStyleId = variantDetails.styleId;

    var initialHookValues = ThemeRepository.getInitialHookValues([hookId], 'colors');
    const initialHookVal = initialHookValues[hookId];
    var baseColorObj = ThemeRepository.getBaseColorObject(component, '', hookId);

    let initialColor;
    if (variantDetails.isVariant) {
        if (customizationObj.variants[variantStyleId].colors.componentOverrides[hookId]) {
            initialColor = customizationObj.variants[variantStyleId].initialValues[hookId];
            delete customizationObj.variants[variantStyleId].colors.componentOverrides[hookId];
        }
    } else {
        if (customizationObj.colors.componentOverrides[hookId]) {
            initialColor = customizationObj.initialValues[hookId];
            delete customizationObj.colors.componentOverrides[hookId];
        }
    }
    // If there is no initial color available in customization table, the set it to the default initial hook value
    if (!initialColor) initialColor = initialHookValues[hookId];

    if (component || baseColorObj) {
        if (!component) component = baseColorObj.component;
        var isBaseOverridden = baseColorObj && ThemeRepository.isHookOverriden(baseColorObj.baseColor, customizationObj, 'colors', component, variantDetails);
        if (isBaseOverridden) {
            // if base color is overridden, we need to resolve the hooks initial value to find scaled initial value and we'll use the found inital scale to find the new color from overridden base color
            var resolvedHookValues = ThemeRepository.getResolvedInitialHookValue([hookId], 'colors')
            var resolvedHookValue = resolvedHookValues[hookId]
            var baseColorScale = ThemeRepository.getColorScale(baseColorObj.baseColor, isBaseOverridden.value);
            baseColorScale[resolvedHookValue] && (styleObj.properties[hookId] = baseColorScale[resolvedHookValue]);
            baseColorScale[resolvedHookValue] && styleObjForResult && (styleObjForResult[hookId] = baseColorScale[resolvedHookValue]);
        } else {
            styleObj.properties[hookId] = initialColor;
            styleObjForResult && (styleObjForResult[hookId] = initialColor);
        }
    } else {
        styleObj.properties[hookId] = initialColor;
        styleObjForResult && (styleObjForResult[hookId] = initialColor);
    }
}

ThemeRepository.getBaseAndComponentOverrides = function(customizationObj, variantDetails) {
    var baseColors, componentOverrides;
    if (variantDetails && variantDetails.isVariant) {
        var variantStyleId = variantDetails.styleId;
        baseColors = customizationObj.variants[variantStyleId] && customizationObj.variants[variantStyleId].colors && customizationObj.variants[variantStyleId].colors.baseColors;
        componentOverrides = customizationObj.variants[variantStyleId] && customizationObj.variants[variantStyleId].colors && customizationObj.variants[variantStyleId].colors.componentOverrides;
    } else {
        baseColors = customizationObj.colors && customizationObj.colors.baseColors;
        componentOverrides = customizationObj.colors && customizationObj.colors.componentOverrides;
    }
    return {
        baseColors: baseColors,
        componentOverrides: componentOverrides
    };
}

ThemeRepository.handleComponentUpdateOnColorOverride = function(globalHooksArr, styleDetails, customizationObj, variantDetails) {
    var baseColors, componentOverrides;
    var baseAndCompOverrides = ThemeRepository.getBaseAndComponentOverrides(customizationObj, variantDetails);
    baseColors = baseAndCompOverrides.baseColors, componentOverrides = baseAndCompOverrides.componentOverrides;
    for (var i = 0; i < globalHooksArr.length; i++) {
        var globalHookId = globalHooksArr[i].id;
        var globalHookVal = globalHooksArr[i].value;
        Object.keys(baseColors).forEach(function(componentId) {
            var compBaseColors = baseColors[componentId];
            Object.keys(compBaseColors).forEach(function(id) {
                var baseColor = compBaseColors[id];
                if (!baseColor.hook) return;
                var baseHook = baseColor.hook;
                baseHook = '--' + baseHook;
                if (baseHook.indexOf(globalHookId) === 0) {
                    var globalHookScale = ThemeRepository.getColorScale(globalHookId, globalHookVal);
                    var newCompBaseColor = globalHookScale[baseHook];
                    var baseHookDetails = {
                        id: id,
                        component: componentId,
                        value: newCompBaseColor,
                        hook: baseColor.hook
                    };
                    ThemeRepository.updateStyleAndCustomizationOnBaseUpdate(baseHookDetails, styleDetails, customizationObj, variantDetails);
                }
            });

        });
        var styleObj = styleDetails.styleObj,
            styleObjForResult = styleDetails.styleObjForResult;
        Object.keys(componentOverrides).forEach(function(componentHookId) {
            var componentColor = componentOverrides[componentHookId];
            if (!componentColor.hook) return;
            var componentHook = componentColor.hook;
            componentHook = '--' + componentHook;
            if (componentHook.indexOf(globalHookId) === 0) {
                styleObj.properties[componentHookId] = globalHookVal;
                styleObjForResult && (styleObjForResult[componentHookId] = globalHookVal);
                componentColor.value = globalHookVal;
            }
        });

    }
};

ThemeRepository.getInitialValuesFromCustomization = (customizationObj, isVariant, variantStyleId) => {
    if (isVariant) {
        if (!customizationObj.variants)
            customizationObj.variants = {};
        if (!customizationObj.variants[variantStyleId]) {
            customizationObj.variants[variantStyleId] = {
                colors: {
                    baseColors: {}
                },
                initialValues: {}
            };
        }
        return customizationObj.variants[variantStyleId].initialValues;
    }
    if (!customizationObj.initialValues) {
        customizationObj.initialValues = {}
    }
    return customizationObj.initialValues;
}

ThemeRepository.updateStyleAndCustomizationOnBaseUpdate = function(hookDetails, styleDetails, customizationObj, variantDetails) {
    var hookId = hookDetails.id;
    var hookVal = hookDetails.value;
    var overrideHook = hookDetails.hook;
    var component = hookDetails.component;
    var styleObj = styleDetails.styleObj,
        styleObjForResult = styleDetails.styleObjForResult;
    var variantStyleId = variantDetails.styleId;

    var baseColorObj = ThemeRepository.getBaseColorObject(component, hookId);
    var dependentHooks = baseColorObj.hooks;
    var baseColorScale = ThemeRepository.getColorScale(hookId, hookVal);
    var initialHookValues = ThemeRepository.getResolvedInitialHookValue(dependentHooks, 'colors');
    let initialValuesFromCustomizationObj = ThemeRepository.getInitialValuesFromCustomization(customizationObj, variantDetails.isVariant, variantStyleId);
    for (var i = 0; i < dependentHooks.length; i++) {
        dependentHook = dependentHooks[i];
        if (!ThemeRepository.isHookOverriden(dependentHook, customizationObj, 'colors', '', variantDetails)) {
            if (!initialValuesFromCustomizationObj[dependentHook])
                initialValuesFromCustomizationObj[dependentHook] = styleObj.properties[dependentHook];
            initialHookVal = initialHookValues[dependentHook];
            var newHookValue = baseColorScale[initialHookVal];
            newHookValue && (styleObj.properties[dependentHook] = newHookValue);
            newHookValue && styleObjForResult && (styleObjForResult[dependentHook] = newHookValue);
        }
    }
    var baseColorCustObj = {
        value: hookVal,
    };
    if (overrideHook) {
        baseColorCustObj.hook = overrideHook;
    }
    if (variantDetails.isVariant) {
        if (!customizationObj.variants)
            customizationObj.variants = {};
        if (!customizationObj.variants[variantStyleId]) {
            customizationObj.variants[variantStyleId] = {
                colors: {
                    baseColors: {}
                },
                initialValues: {}
            };
        }
        if (!customizationObj.variants[variantStyleId].colors.baseColors[component])
            customizationObj.variants[variantStyleId].colors.baseColors[component] = {};
        customizationObj.variants[variantStyleId].colors.baseColors[component][hookId] = baseColorCustObj;

    } else {
        if (!customizationObj.colors.baseColors[component])
            customizationObj.colors.baseColors[component] = {};
        customizationObj.colors.baseColors[component][hookId] = baseColorCustObj;
    }

};
ThemeRepository.updateComponentProp = function(updateComponentPropInput) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {
        var styleId = updateComponentPropInput.id;
        var themeId = updateComponentPropInput.themeId;
        var override = updateComponentPropInput.override;
        var overrideType = override.type;

        var customizationGR = ThemeRepository.getCustomizationGR(themeId);
        var message = gs.getMessage('You need to get permission to update this property. Contact your system administrator for permission.');
        if (gs.nil(customizationGR) || ThemeRepository.isThemeReadOnly(themeId)) {
            logObject.message = message;
            return logObject;
        }

        var styleGR = ThemeRepository.getGR(Constants.SYS_UX_STYLE_TABLE_NAME,
            ThemeRepository.getQueryAfterAddingDomainToQueryArray([Constants.SYS_ID_QUERY_KEY, styleId]));
        if (gs.nil(styleGR)) {
            logObject.message = message;
            return logObject;
        }

        var tableRecords = {
            customizationGR: customizationGR,
            styleGR: styleGR
        };

        if (overrideType === 'base_color' || overrideType === 'color') {
            return ThemeRepository.updateComponentColorProp(updateComponentPropInput, tableRecords);
        } else {
            var isRevert = updateComponentPropInput.isRevert;
            var styleObjForResult = {};
            var updateResult = {};
            var customizationObj = ThemeRepository.transformCustomizationStrToObject(customizationGR.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD));

            var customizationProp = ThemeRepository.getCustomizationPropForType(overrideType);
            var initialThemeTypeProp = ThemeRepository.getInitialThemePropForType(overrideType);
            var styleStr = styleGR.getValue(Constants.STYLE_COLUMN_FIELD);
            var styleObj = JSON.parse(styleStr);
            if (isRevert) {
                var initialHookValues = ThemeRepository.getInitialHookValues([override.id], initialThemeTypeProp);
                styleObj.properties[override.id] = initialHookValues[override.id];
                styleObjForResult[override.id] = initialHookValues[override.id];
                delete customizationObj[customizationProp].overrides[override.id];

            } else {
                styleObj.properties[override.id] = override.value;
                styleObjForResult[override.id] = override.value;
                customizationObj[customizationProp].overrides[override.id] = override.value;
            }
            styleGR.setValue(Constants.STYLE_COLUMN_FIELD, JSON.stringify(styleObj, null, 2));
            var updateStyleResult = ThemeRepository.updateStyleRecord(styleGR, message);
            if (updateStyleResult)
                return updateStyleResult;

            customizationGR.setValue(Constants.CUSTOMIZATION_COLUMN_FIELD, ThemeRepository.transformCustomizationObjToStr(customizationObj));
            customizationGR.update();
            updateResult.style = JSON.stringify(styleObjForResult);
            updateResult.customization = {
                id: themeId,
                value: JSON.stringify(customizationObj)
            };

            return updateResult;
        }
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while updating the component property overrides: ' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to update the property. Try it again or contact your system administrator for more help.');
        return logObject;
    }

};
ThemeRepository.updateComponentFontProperties = function(updateComponentFontPropertiesInput) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {
        var styleId = updateComponentFontPropertiesInput.id;
        var themeId = updateComponentFontPropertiesInput.themeId;
        var customizationGR = ThemeRepository.getCustomizationGR(themeId);
        var styleGR = ThemeRepository.getGR(Constants.SYS_UX_STYLE_TABLE_NAME,
            ThemeRepository.getQueryAfterAddingDomainToQueryArray([Constants.SYS_ID_QUERY_KEY, styleId]));
        var overrides = updateComponentFontPropertiesInput.override;
        var isRevert = updateComponentFontPropertiesInput.isRevert;
        var fontFamily = updateComponentFontPropertiesInput.fontFamily;

        var styleObj = JSON.parse(styleGR.getValue(Constants.STYLE_COLUMN_FIELD));
        var customizationObj = ThemeRepository.transformCustomizationStrToObject(customizationGR.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD));

        var styleObjForResult = {};
        var updateResult = {};

        overrides.forEach(function(override) {
            var overrideType = override.type;
            var customizationProp = ThemeRepository.getCustomizationPropForType(overrideType);
            var initialThemeTypeProp = ThemeRepository.getInitialThemePropForType(overrideType);
            const isRevertForComp = override.isRevert || isRevert;

            if (!customizationObj[customizationProp]) {
                customizationObj[customizationProp] = {
                    overrides: {}
                };
            }
            if (isRevertForComp) {
                var initialHookValues = ThemeRepository.getInitialHookValues([override.id], initialThemeTypeProp);
                const valueFromInput = override.value;
                styleObj.properties[override.id] = valueFromInput || initialHookValues[override.id];
                styleObjForResult[override.id] = valueFromInput || initialHookValues[override.id];
                delete customizationObj[customizationProp].overrides[override.id];
                if (override.id.includes("font-family")) {
                    delete customizationObj[customizationProp].fontFamilyMapping[override.component]
                }
            } else {
                styleObj.properties[override.id] = override.value;
                styleObjForResult[override.id] = override.value;
                customizationObj[customizationProp].overrides[override.id] = override.value;
                customizationObj[customizationProp].fontFamilyMapping[override.component] = fontFamily;
            }
        });

        styleGR.setValue(Constants.STYLE_COLUMN_FIELD, JSON.stringify(styleObj, null, 2));
        var message = gs.getMessage('You need to get permission to update this property. Contact your system administrator for permission.');
        var updateStyleResult = ThemeRepository.updateStyleRecord(styleGR, message);
        if (updateStyleResult)
            return updateStyleResult;
        customizationGR.setValue(Constants.CUSTOMIZATION_COLUMN_FIELD, ThemeRepository.transformCustomizationObjToStr(customizationObj));
        customizationGR.update();
        updateResult.style = JSON.stringify(styleObjForResult);
        updateResult.customization = {
            id: themeId,
            value: JSON.stringify(customizationObj)
        };

        return updateResult;
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while updating the component property overrides: ' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to update the property. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};

ThemeRepository.getCustomizationPropForType = function(propType) {
    if (propType === 'color') {
        return 'colors';
    } else if (propType === 'shape_and_form') {
        return 'shapeAndForm';
    } else if (propType === 'typography') {
        return 'typography';
    }
};

ThemeRepository.getInitialThemePropForType = function(propType) {
    if (propType === 'color' || propType === 'base_color') {
        return 'colors';
    } else if (propType === 'shape_and_form') {
        return 'shape';
    } else if (propType === 'typography') {
        return 'typography';
    }
};


ThemeRepository.updateComponentColorProp = function(updateComponentColorPropInput, tableRecords) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE
    };
    try {

        var override = updateComponentColorPropInput.override;
        var overrideType = override.type;

        if (overrideType === 'base_color') {
            return ThemeRepository.updateBaseColorProp(updateComponentColorPropInput, tableRecords);
        } else if (overrideType === 'color') {
            return ThemeRepository.updateDependentColorProp(updateComponentColorPropInput, tableRecords);
        }
    } catch (e) {
        gs.error(Constants.THEME_BUILDER_PREFIX + 'Error while updating the component color overrides: ' + e.toString());
        logObject.message = gs.getMessage('There was an error when trying to update the colors. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};

ThemeRepository.updateStyleRecord = function(styleGR, message) {
    var logObject;
    if (!styleGR.update()) {
        logObject.messageType = Constants.ERROR_LOG_TYPE;
        if (ThemeRepository.isScopeSame(styleGR.getValue(Constants.SYS_SCOPE_COLUMN_FIELD),
                ThemeRepository.getScopeId())) {
            logObject.message = message;
        } else {
            logObject.message = ThemeRepository.getScopeErrorMessage(styleGR.getDisplayValue(Constants.SYS_SCOPE_COLUMN_FIELD));
        }
    }
    return logObject;
};

ThemeRepository.updateBaseColorProp = function(updateComponentColorPropInput, tableRecords) {
    var styleId = updateComponentColorPropInput.id;
    var themeId = updateComponentColorPropInput.themeId;
    var isRevert = updateComponentColorPropInput.isRevert;
    var override = updateComponentColorPropInput.override;
    var isVariant = updateComponentColorPropInput.isVariant;

    var updateResult = {};
    var styleObjForResult = {};

    var customizationGR = tableRecords.customizationGR;
    var customizationObj = ThemeRepository.transformCustomizationStrToObject(customizationGR.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD));
    var styleGR = tableRecords.styleGR;
    var styleStr = styleGR.getValue(Constants.STYLE_COLUMN_FIELD);
    var styleObj = JSON.parse(styleStr);

    var hookDetails = {
        id: override.id,
        value: override.value,
        hook: override.hook,
        component: override.component
    };
    var styleDetails = {
        styleObj: styleObj,
        styleObjForResult: styleObjForResult
    };
    var variantDetails = {
        isVariant: isVariant,
        styleId: styleId
    };

    if (isRevert) {
        ThemeRepository.updateStyleAndCustomizationOnBaseRevert(hookDetails, styleDetails, customizationObj, variantDetails);
    } else {
        ThemeRepository.updateStyleAndCustomizationOnBaseUpdate(hookDetails, styleDetails, customizationObj, variantDetails);
    }
    var message = gs.getMessage('You need to get permission to update this color. Contact your system administrator for permission.');
    styleGR.setValue(Constants.STYLE_COLUMN_FIELD, JSON.stringify(styleObj, null, 2));
    var updateStyleResult = ThemeRepository.updateStyleRecord(styleGR, message);
    if (updateStyleResult)
        return updateStyleResult;

    customizationGR.setValue(Constants.CUSTOMIZATION_COLUMN_FIELD, ThemeRepository.transformCustomizationObjToStr(customizationObj));
    customizationGR.update();

    updateResult.style = JSON.stringify(styleObjForResult);
    updateResult.customization = {
        id: themeId,
        value: JSON.stringify(customizationObj)
    };
    return updateResult;
};

ThemeRepository.updateDependentColorProp = function(updateComponentColorPropInput, tableRecords) {
    var styleId = updateComponentColorPropInput.id;
    var themeId = updateComponentColorPropInput.themeId;
    var isRevert = updateComponentColorPropInput.isRevert;
    var override = updateComponentColorPropInput.override;
    var isVariant = updateComponentColorPropInput.isVariant;

    var overrideType = override.type;
    var overrideComp = override.component;

    var updateResult = {};
    var styleObjForResult = {};


    var customizationGR = tableRecords.customizationGR;
    var customizationObj = ThemeRepository.transformCustomizationStrToObject(customizationGR.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD));
    var styleGR = tableRecords.styleGR;
    var styleStr = styleGR.getValue(Constants.STYLE_COLUMN_FIELD);
    var styleObj = JSON.parse(styleStr);
    var baseColorObj;

    if (isRevert) {
        var hookDetails = {
            id: override.id,
            component: override.component
        };
        var styleDetails = {
            styleObj: styleObj,
            styleObjForResult: styleObjForResult
        };
        var variantDetails = {
            isVariant: isVariant,
            styleId: styleId
        };
        ThemeRepository.updateStyleAndCustomizationOnComponentRevert(hookDetails, styleDetails, customizationObj, variantDetails);
    } else {
        if (overrideComp) {
            baseColorObj = ThemeRepository.getBaseColorObject(overrideComp, '', override.id);
            if (baseColorObj && baseColorObj.hooks.length > 0 && ThemeRepository.areAllDependentHooksOverridden(baseColorObj.hooks, customizationObj, override.id, {
                    isVariant: isVariant,
                    styleId: styleId
                })) {
                if (isVariant)
                    customizationObj.variants[styleId].colors.baseColors[overrideComp] && delete customizationObj.variants[styleId].colors.baseColors[overrideComp][baseColorObj.baseColor];
                else
                    customizationObj.colors.baseColors[overrideComp] && delete customizationObj.colors.baseColors[overrideComp][baseColorObj.baseColor];
            }
        }
        let initialColor = customizationObj?.initialValues?.[override.id] || styleObj.properties[override.id];
        styleObj.properties[override.id] = override.value;
        styleObjForResult[override.id] = override.value;

        var compColorCustObj = {
            value: override.value,
            hook: override.hook
        };

        if (isVariant) {
            if (!customizationObj.variants)
                customizationObj.variants = {};
            else if (customizationObj?.variants[styleId]?.initialValues?.[override.id]) {
                initialColor = customizationObj?.variants[styleId]?.initialValues?.[override.id]
            }
            if (!customizationObj.variants[styleId]) {
                customizationObj.variants[styleId] = {
                    colors: {
                        componentOverrides: {}
                    },
                    initialValues: {}
                };
            }
            customizationObj.variants[styleId].colors.componentOverrides[override.id] = compColorCustObj;
            if (customizationObj?.variants[styleId]?.initialValues?.[override.id])
                customizationObj.variants[styleId].initialValues[override.id] = initialColor;
        } else {
            if (customizationObj?.initialValues?.[override.id]) {
                customizationObj.initialValues[override.id] = customizationObj?.initialValues?.[override.id];
            }
            if (customizationObj?.colors?.componentOverrides?.[override.id]) {
                customizationObj.colors.componentOverrides[override.id] = compColorCustObj;
            } else {
                customizationObj.colors = customizationObj.colors || {};
                customizationObj.colors.componentOverrides = customizationObj.colors.componentOverrides || {};
                customizationObj.colors.componentOverrides[override.id] = compColorCustObj;

            }
        }

    }
    var message = gs.getMessage('You need to get permission to update this color. Contact your system administrator for permission.');
    styleGR.setValue(Constants.STYLE_COLUMN_FIELD, JSON.stringify(styleObj, null, 2));
    var updateStyleResult = ThemeRepository.updateStyleRecord(styleGR, message);
    if (updateStyleResult)
        return updateStyleResult;

    customizationGR.setValue(Constants.CUSTOMIZATION_COLUMN_FIELD, ThemeRepository.transformCustomizationObjToStr(customizationObj));
    customizationGR.update();

    updateResult.style = JSON.stringify(styleObjForResult);
    updateResult.customization = {
        id: themeId,
        value: JSON.stringify(customizationObj)
    };

    return updateResult;
};

ThemeRepository.areAllDependentHooksOverridden = function(dependentHooks, customizationObj, currHook, variantDetails) {
    var allOverriddenFlag = true;
    for (var i = 0; i < dependentHooks.length; i++) {
        if (!ThemeRepository.isHookOverriden(dependentHooks[i], customizationObj, 'colors', '', variantDetails) && currHook !== dependentHooks[i]) {
            allOverriddenFlag = false;
            break;
        }
    }
    return allOverriddenFlag;

};

ThemeRepository.getBaseColorObject = function(component, baseColor, componentHook) {
    var baseColorObj, componentHooks;
    var processComponentHooks = function(componentHooks, baseColor, componentHook) {
        var baseColorObj;
        for (var i = 0; i < componentHooks.length; i++) {
            var currBaseColorObj = componentHooks[i];
            if (componentHook && currBaseColorObj.hooks.indexOf(componentHook) !== -1) {
                baseColorObj = currBaseColorObj;
                break;
            }
            if (baseColor && currBaseColorObj.baseColor === baseColor) {
                baseColorObj = currBaseColorObj;
                break;
            }
        }
        return baseColorObj;
    };
    if (component) {
        componentHooks = Constants.BASE_COLOR_MAPPING[component];
        if (!componentHooks)
            return baseColorObj;
        return processComponentHooks(componentHooks, baseColor, componentHook);

    } else {
        var componentKeys = Object.keys(Constants.BASE_COLOR_MAPPING);
        for (var i = 0; i < componentKeys.length; i++) {
            var componentKey = componentKeys[i];
            componentHooks = Constants.BASE_COLOR_MAPPING[componentKey];
            var compBaseColorObj = processComponentHooks(componentHooks, baseColor, componentHook);
            if (compBaseColorObj) {
                compBaseColorObj.component = componentKey;
                return compBaseColorObj;
            };
        }
        return baseColorObj;
    }
    return baseColorObj;
};

ThemeRepository.getColorScale = function(propName, propValue) {
    var styleObj = {
        colorGenerationVersion: "V1",
        isDark: false,
    };
    var baseObj = {};
    baseObj[propName] = propValue;
    styleObj.base = baseObj;

    return JSON.parse(ThemeRepository.getGeneratedColors(JSON.stringify(styleObj)));
};

ThemeRepository.getInitialHookValues = function(hooks, type) {
    var hooksWithVal = {};
    for (var i = 0; i < hooks.length; i++) {
        hooksWithVal[hooks[i]] = Constants.THEME_BUILDER_INITIAL_THEME[type].properties[hooks[i]];
    }
    return hooksWithVal;
};

ThemeRepository.getResolvedInitialHookValue = function(hooks, type) {
    var hooksWithVal = {};
    var properties = Constants.THEME_BUILDER_INITIAL_THEME[type].properties;

    function resolveValue(key, seen = new Set()) {
        let val = properties[key];

        // Detect circular reference
        if (seen.has(key)) return undefined;
        seen.add(key);

        while (typeof val === 'string' && properties.hasOwnProperty(val)) {
            if (seen.has(val)) return undefined; // prevent infinite loop
            seen.add(val);
            val = properties[val];
        }
        return val;
    }
    for (var i = 0; i < hooks.length; i++) {
        var key = hooks[i];
        hooksWithVal[key] = resolveValue(key);
    }
    return hooksWithVal;
};

ThemeRepository.getInitialHookValueForBaseColors = function(hook) {
    return Constants.THEME_BUILDER_INITIAL_THEME['colors'].base[hook];
};

ThemeRepository.isHookOverriden = function(hookId, customizationObj, type, component, variantDetails) {
    var custType = customizationObj[type];
    if (!variantDetails || !variantDetails.isVariant) {
        custType = customizationObj[type];
    } else {
        custType = customizationObj.variants[variantDetails.styleId][type];
    }
    if (type === 'colors') {
        return (component && custType.baseColors[component] && custType.baseColors[component][hookId]) ||
            custType.componentOverrides[hookId];
    } else {
        return custType.overrides[hookId];
    }
};

ThemeRepository.getComponentUpdateResultType = function(resultObject) {
    return gs.nil(resultObject.messageType) ? Constants.COMPONENT_PROPERTY_RESULT : Constants.LOGGER_GRAPHQL_TYPE;
};

ThemeRepository.addFeedback = function(feedback) {
    var TRUE = true;
    if (gs.nil(feedback)) {
        return TRUE;
    }
    var customizationGR = new GlideRecordSecure(Constants.SYS_UX_THEME_CUSTOMIZATION_TABLE_NAME);
    customizationGR.setLimit(1);
    customizationGR.addActiveQuery();
    customizationGR.addQuery(Constants.SYS_ID_COLUMN_FIELD, '9745147a53a31110d7bcddeeff7b1231');
    customizationGR.query();
    if (customizationGR.next()) {
        var customizationObj = ThemeRepository.transformCustomizationStrToObject(customizationGR.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD));
        var count = Object.keys(customizationObj.feedback).length;
        customizationObj.feedback[count + Constants.EMPTY_STR] = feedback;
        customizationGR.setValue(Constants.CUSTOMIZATION_COLUMN_FIELD, ThemeRepository.transformCustomizationObjToStr(customizationObj));
        customizationGR.update();
    }
    return TRUE;
};
ThemeRepository.getThemeResultType = function(resultObject) {
    return gs.nil(resultObject.messageType) ? Constants.THEME_GRAPHQL_TYPE : Constants.LOGGER_GRAPHQL_TYPE;
};
ThemeRepository.getM2mUxAppThemeResultType = function(resultObject) {
    return gs.nil(resultObject.messageType) ? 'M2MUXAppTheme' : Constants.LOGGER_GRAPHQL_TYPE;
};
ThemeRepository.getCustomizationResultType = function(resultObject) {
    return gs.nil(resultObject.messageType) ? Constants.CUSTOMIZATION_GRAPHQL_TYPE : Constants.LOGGER_GRAPHQL_TYPE;
};
ThemeRepository.getColorsStyleResultType = function(resultObject) {
    return gs.nil(resultObject.messageType) ? Constants.COLORS_STYLE_GRAPHQL_TYPE : Constants.LOGGER_GRAPHQL_TYPE;
};
ThemeRepository.getShapeStyleResultType = function(resultObject) {
    return gs.nil(resultObject.messageType) ? Constants.SHAPE_STYLE_GRAPHQL_TYPE : Constants.LOGGER_GRAPHQL_TYPE;
};
ThemeRepository.getTypographyStyleResultType = function(resultObject) {
    return gs.nil(resultObject.messageType) ? Constants.TYPOGRAPHY_STYLE_GRAPHQL_TYPE : Constants.LOGGER_GRAPHQL_TYPE;
};
ThemeRepository.getImageryStyleResultType = function(resultObject) {
    return gs.nil(resultObject.messageType) ? Constants.IMAGERY_STYLE_GRAPHQL_TYPE : Constants.LOGGER_GRAPHQL_TYPE;
};
ThemeRepository.getIllustrationStyleResultType = function(resultObject) {
    return gs.nil(resultObject.messageType) ? Constants.ILLUSTRATION_STYLE_GRAPHQL_TYPE : Constants.LOGGER_GRAPHQL_TYPE;
};
ThemeRepository.getUploadCustomFontResultType = function(resultObject) {
    return gs.nil(resultObject.messageType) ? Constants.UPLOAD_RESULT_GRAPHQL_TYPE : Constants.LOGGER_GRAPHQL_TYPE;
};
ThemeRepository.getBooleanResultType = function(resultObject) {
    return gs.nil(resultObject.messageType) ? Constants.BOOLEAN_GRAPHQL_TYPE : Constants.LOGGER_GRAPHQL_TYPE;
};
ThemeRepository.getStringResultType = function(resultObject) {
    return gs.nil(resultObject.messageType) ? Constants.STRING_GRAPHQL_TYPE : Constants.LOGGER_GRAPHQL_TYPE;
};
ThemeRepository.isThemeReadOnly = function(themeId) {
    return ThemeRepository.getReadOnlyThemeIds().indexOf(themeId) >= 0;
};
ThemeRepository.isStyleReadOnly = function(styleId) {
    return ThemeRepository.getReadOnlyStyleIds().indexOf(styleId) >= 0;
};
ThemeRepository.getReadOnlyThemeIds = function() {
    return [Constants.POLARIS_THEME_ID, Constants.USWDS_THEME_ID, Constants.CORAL_THEME_ID];
};
ThemeRepository.getReadOnlyStyleIds = function() {
    return [].concat(
        Constants.POLARIS_STYLES_ID,
        Constants.CORAL_STYLES_ID,
        Constants.USWDS_STYLES_ID
    );
};
ThemeRepository.deleteVariant = function(deleteVariantInput) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE,
    };
    try {
        var styleId = deleteVariantInput.id;
        var themeId = deleteVariantInput.themeId;
        var themeGR = ThemeRepository.getTheme(themeId);
        if (gs.nil(themeGR) || ThemeRepository.isThemeReadOnly(themeId)) {
            logObject.message = gs.getMessage('You need to get permission to delete this theme. Contact your system administrator for permission.');
            return logObject;
        }
        var customizationGR = ThemeRepository.getCustomizationGR(themeId);
        if (customizationGR) {
            var customizationObj = ThemeRepository.transformCustomizationStrToObject(customizationGR.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD));
            if (customizationObj.variants) {
                delete customizationObj.variants[styleId];

            }
            var customizationStr = ThemeRepository.transformCustomizationObjToStr(customizationObj);
            customizationGR.setValue(Constants.CUSTOMIZATION_COLUMN_FIELD, customizationStr);
            customizationGR.update();
        }
        var themeStyleM2M = new GlideRecordSecure(Constants.M2M_THEME_STYLE_TABLE_NAME);
        themeStyleM2M.addQuery(Constants.THEME_COLUMN_FIELD, themeId);
        themeStyleM2M.addQuery(Constants.STYLE_COLUMN_FIELD, styleId);
        themeStyleM2M.query();
        if (themeStyleM2M.next()) themeStyleM2M.deleteMultiple();
        var styleGr = new GlideRecordSecure(Constants.SYS_UX_STYLE_TABLE_NAME);
        styleGr.get(styleId);
        if (styleGr.next()) styleGr.deleteRecord();
        return themeGR;
    } catch (e) {
        gs.error(
            Constants.THEME_BUILDER_PREFIX +
            'Error while deleting the variant: ' +
            e.toString()
        );
        logObject.message = gs.getMessage('There was an error when trying to delete the variant. Try it again or contact your system administrator for more help.');
        return logObject;
    }
};
ThemeRepository.transformColorsToArray = function(sourceColors, destinationColors) {

    if (sourceColors.isSecondaryColorUpdated) {
        destinationColors.push(ThemeRepository.getEntityObject(Constants.IS_SECONDARY_COLOR_UPDATED, true, Constants.SECONDARY_COLOR_UPDATED));
    }
    if (sourceColors.customizedNames) {
        Object.keys(sourceColors.customizedNames).forEach(function(id) {
            destinationColors.push(ThemeRepository.getEntityObject(id, sourceColors.customizedNames[id], Constants.CUSTOMIZED_NAME));
        });
    }
    if (sourceColors.contrastRatioViolations) {
        Object.keys(sourceColors.contrastRatioViolations).forEach(function(id) {
            destinationColors.push(ThemeRepository.getEntityObject(id, sourceColors.contrastRatioViolations[id], Constants.CONTRAST_RATIO_VIOLATED));
        });
    }
    if (sourceColors.overrides) {
        Object.keys(sourceColors.overrides).forEach(function(id) {
            destinationColors.push(ThemeRepository.getEntityObject(id, sourceColors.overrides[id], Constants.COLOR_HOOK_OVERRIDDEN));
        });
    }

    if (sourceColors.baseColors) {
        Object.keys(sourceColors.baseColors).forEach(function(componentId) {
            var compBaseColors = sourceColors.baseColors[componentId];
            Object.keys(compBaseColors).forEach(function(id) {
                var baseColor = compBaseColors[id];
                var baseColorCustObj = {
                    id: id,
                    value: baseColor.value,
                    component: componentId,
                    type: Constants.COMPONENT_BASE_HOOK_OVERRIDDEN,
                };
                if (baseColor.hook) {
                    baseColorCustObj.hook = baseColor.hook;
                }
                destinationColors.push(baseColorCustObj);
            });

        });
    }
    if (sourceColors.componentOverrides) {
        Object.keys(sourceColors.componentOverrides).forEach(function(compHookId) {
            var compHook = sourceColors.componentOverrides[compHookId];
            var compHookCustObj = {
                id: compHookId,
                value: compHook.value,
                type: Constants.COMPONENT_HOOK_OVERRIDDEN
            };
            if (compHook.hook) {
                compHookCustObj.hook = compHook.hook;
            }
            destinationColors.push(compHookCustObj);
        });
    }
};

ThemeRepository.getThemeIdForStyleRecord = function(styleId) {
    try {
        var themeStyleM2M = new GlideRecordSecure(Constants.M2M_THEME_STYLE_TABLE_NAME);
        themeStyleM2M.addQuery(Constants.STYLE_COLUMN_FIELD, styleId);
        themeStyleM2M.query();

        if (themeStyleM2M.next()) {
            var themeId = themeStyleM2M.getValue(Constants.THEME_COLUMN_FIELD);
            return themeId;
        }
        return null;
    } catch (e) {
        return null;
    }
}

ThemeRepository.isStyleRecordForThemeCreatedByTB = function(styleId) {
    try {
        var themeId = ThemeRepository.getThemeIdForStyleRecord(styleId);
        if (themeId) {
            return ThemeRepository.isThemeCreatedByTB(themeId);
        }
        return false;
    } catch (e) {
        return false;
    }
};

ThemeRepository.isVariantRecord = function(styleId) {
    try {
        var styleGr = new GlideRecordSecure(Constants.SYS_UX_STYLE_TABLE_NAME);
        styleGr.get(styleId);
        if (styleGr) {
            var type = styleGr.getValue(Constants.TYPE_COLUMN_FIELD);
            if (type === Constants.STYLE_VARIANT_TYPE) {
                return true;
            }
        }
        return false;
    } catch (e) {
        return false;
    }
};

ThemeRepository.getStyleRecordName = function(styleId) {
    try {
        var styleGr = new GlideRecordSecure(Constants.SYS_UX_STYLE_TABLE_NAME);
        styleGr.get(styleId);
        if (styleGr) {
            var styleRecordName = styleGr.getValue(Constants.NAME_COLUMN_FIELD);
            return styleRecordName;
        }
        return null;
    } catch (e) {
        return null;
    }
};

ThemeRepository.getStyleRecordType = function(styleId) {
    try {
        if (ThemeRepository.isVariantRecord(styleId)) {
            return Constants.STYLE_VARIANT_TYPE;
        } else if (ThemeRepository.getStyleRecordName(styleId) === Constants.COLORS_STYLE_TYPE) {
            return Constants.COLORS_STYLE_TYPE;
        } else if (ThemeRepository.getStyleRecordName(styleId) === Constants.SHAPE_STYLE_TYPE) {
            return Constants.SHAPE_STYLE_TYPE;
        } else if (ThemeRepository.getStyleRecordName(styleId) === Constants.TYPOGRAPHY_STYLE_TYPE) {
            return Constants.TYPOGRAPHY_STYLE_TYPE;
        } else if (ThemeRepository.getStyleRecordName(styleId) === Constants.IMAGERY_STYLE_TYPE) {
            return Constants.IMAGERY_STYLE_TYPE;
        } else {
            return null;
        }
    } catch (e) {
        return null;
    }
};

ThemeRepository.showThemeBuilderInfoInStyleRecord = function(styleId) {
    try {
        var themeId = ThemeRepository.getThemeIdForStyleRecord(styleId);
        if (themeId) {
            return ThemeRepository.isThemeCreatedByTB(themeId) && themeId !== Constants.USWDS_THEME_ID && ThemeRepository.getStyleRecordType(styleId) != null;
        }
        return false;
    } catch (e) {
        return false;
    }
}
ThemeRepository.deleteCustomFontFamily = function(deleteCustomFontFamilyInput) {
    var logObject = {
        messageType: Constants.ERROR_LOG_TYPE,
    };
    try {
        if (typeof deleteCustomFontFamilyInput !== 'object' || !Array.isArray(deleteCustomFontFamilyInput.fontIds)) {
            throw new Error("Invalid input: Expected an object with 'fontIds' as an array");
            return;
        }
        // Extract the fontIds array from the input object
        var fontIds = deleteCustomFontFamilyInput.fontIds;
        // Check if the array is empty
        if (fontIds.length === 0) {
            throw new Error("No font IDs provided to delete.");
            return;
        }
        var themeGr = ThemeRepository.getGR(Constants.SYS_UX_THEME_TABLE_NAME, Constants.SYS_ID_QUERY_KEY + deleteCustomFontFamilyInput?.themeId);
        if (!(themeGr && themeGr.isValidRecord())) throw new Error("No valid theme id present");

        var typographyStyleGr = undefined;
        var fontFamilyName = undefined;
        for (var i = 0; i < fontIds.length; i++) {
            var m2mAssetGr = new GlideRecord(Constants.M2M_STYLE_ASSET_TABLE_NAME);
            var fontId = fontIds[i];
            // Query the record by Sys ID
            if (m2mAssetGr.get(fontId)) {
                // If record is found, delete it
                typographyStyleGr = m2mAssetGr.style.getRefRecord();
                const assetGR = m2mAssetGr.asset.getRefRecord();
                fontFamilyName = assetGR.getValue('name');
                m2mAssetGr.deleteRecord();
            } else {
                gs.warn("Font record with Sys ID " + fontId + " not found.");
            }
        }
        var gr = new GlideRecord(Constants.M2M_STYLE_ASSET_TABLE_NAME);
        gr.addQuery('style', typographyStyleGr.getValue('sys_id'));
        var grAsset = gr.addJoinQuery(Constants.SYS_UX_THEME_ASSET_TABLE_NAME, 'asset', 'sys_id');
        grAsset.addCondition('name', fontFamilyName);
        gr.query();
        if (gr.getRowCount() < 1) {
            ThemeRepository.updateCustomizationForDeletedFont(deleteCustomFontFamilyInput.themeId, fontFamilyName)
        }
        return {
            customization: {
                ...themeGr
            },
            typography: {
                ...typographyStyleGr
            }
        }
    } catch (e) {
        gs.error(
            Constants.THEME_BUILDER_PREFIX +
            'Error while deleting a  custom font: ' +
            e.toString()
        );
        logObject.message = gs.getMessage('There was an error when deleting a custom font. Try it again or contact your system administrator for more help.');
        return logObject;
    }
}
ThemeRepository.updateCustomizationForDeletedFont = function(themeId, fontFamilyName) {
    var customizationGr = ThemeRepository.getCustomizationGR(themeId);
    if (customizationGr) {
        const transformedCustomizationObj = ThemeRepository.transformCustomizationStrToObject(customizationGr.getValue(Constants.CUSTOMIZATION_COLUMN_FIELD));
        const customFonts = transformedCustomizationObj?.typography?.customFonts;
        const indexOfFont = customFonts?.findIndex(font => (font?.name === fontFamilyName));
        if (indexOfFont != -1) customFonts?.splice(indexOfFont, 1);
        customizationGr.setValue(Constants.CUSTOMIZATION_COLUMN_FIELD, ThemeRepository.transformCustomizationObjToStr(transformedCustomizationObj));
        customizationGr.update();
    }
};

ThemeRepository.prototype = {
    type: 'ThemeRepository'
};
