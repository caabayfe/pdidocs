function checkIfJsonValid(styleJSON) {
    try {
        JSON.parse(styleJSON);
        return true;
    } catch (error) {
        return false;
    }
}

function checkIfRequiredKeysExist(styleJSON) {
    try {
        var colorRecordObj = JSON.parse(styleJSON);
        return "base" in colorRecordObj && "properties" in colorRecordObj;
    } catch (error) {
        return false;
    }
}

function isValidRGB(rgbString) {
    try {
        // Split the string by commas and trim whitespace
        var rgbValues = rgbString.split(',').map(function(value) {
            return value.trim();
        });

        // Check if the array has exactly 3 elements
        if (rgbValues.length !== 3) {
            return false;
        }

        // Check if each value is an integer between 0 and 255
        for (var i = 0; i < 3; i++) {
            if (!/^\d+$/.test(rgbValues[i])) {
                return false;
            }
            var intValue = parseInt(rgbValues[i], 10);
            if (isNaN(intValue) || intValue < 0 || intValue > 255) {
                return false;
            }
        }
        return true;
    } catch (error) {
        return false;
    }

}

function checkIfBaseValuesAreValidRGB(styleJSON) {
    try {
        var colorRecordObj = JSON.parse(styleJSON);
        var baseObj = colorRecordObj.base;
        for (var baseKey in baseObj) {
            var baseValue = baseObj[baseKey];
            if (!isValidRGB(baseValue)) {
                return false;
            }
        }
        return true;
    } catch (error) {
        return false;
    }
}

function onSubmit() {
    var validActionsForClientScript = ['sysverb_update', 'sysverb_update_and_stay', 'sysverb_insert', 'sysverb_insert_and_stay'];
    var actionName = g_form.getActionName();
    var validRecordNames = ['Imagery', 'Typography', 'Colors', 'Shape and Form'];
    var styleRecordName = g_form.getValue('name');
    var styleRecordType = g_form.getValue('type');
    var USWebDesignThemeId = '7a2773b45f2311101e21a016617313df';

    if (validActionsForClientScript.indexOf(actionName) === -1 || (validRecordNames.indexOf(styleRecordName) === -1 && styleRecordType !== 'variant')) {
        return true;
    } else {
        g_form.clearMessages();
        if (g_scratchpad.isThemeBuilderStyleRecordValid)
            return true;
        var ga = new GlideAjax('ClientThemeRepository');
        ga.addParam('sysparm_name', 'getThemeDetailsForStyleRecord');
        ga.addParam('sysparm_styleId', g_form.getUniqueValue());
        ga.getXMLAnswer(ResponseFunction);
        return false;
    }

    function ResponseFunction(response) {
        try {
            var themeDetails = JSON.parse(response);
            var isThemeCreatedByTB = themeDetails.isThemeCreatedByTB;
            if (isThemeCreatedByTB) {
                var themeBuilderLink;
                var themeId = themeDetails.themeId;
                if (styleRecordType === 'variant') {
                    themeBuilderLink = '<a target="_blank" href="now/theme-builder/edit-colors/' + themeId + '/params/variant-id/' + g_form.getUniqueValue() + '">Theme Builder</a>';
                } else {
                    switch (styleRecordName) {
                        case 'Imagery':
                            themeBuilderLink = '<a target="_blank" href="now/theme-builder/edit-imagery/' + themeId + '">Theme Builder</a>';
                            break;
                        case 'Typography':
                            themeBuilderLink = '<a target="_blank" href="now/theme-builder/edit-typography/' + themeId + '">Theme Builder</a>';
                            break;
                        case 'Colors':
                            themeBuilderLink = '<a target="_blank" href="now/theme-builder/edit-colors/' + themeId + '">Theme Builder</a>';
                            break;
                        case 'Shape and Form':
                            themeBuilderLink = '<a target="_blank" href="now/theme-builder/edit-shape/' + themeId + '">Theme Builder</a>';
                            break;
                        default:
                            break;
                    }
                }

                var styleJSON = g_form.getValue('style');
                var gwt = new GwtMessage();
                if (!checkIfJsonValid(styleJSON)) {
                    var invalidJSONMessage = gwt.getMessage('Your JSON is invalid. Update your theme with {0} for the best experience.', themeBuilderLink);
                    if (themeId === USWebDesignThemeId) {
                        invalidJSONMessage = gwt.getMessage('Your JSON is invalid. Preview your theme with {0} for the best experience.', themeBuilderLink);
                    }
                    g_form.addErrorMessage(invalidJSONMessage);
                    return false;
                }
                if (styleRecordName === 'Colors' || styleRecordType === 'variant') {
                    if (!checkIfRequiredKeysExist(styleJSON)) {
                        var missingKeysMessage = gwt.getMessage('Your JSON is missing valid base and properties data. Update your theme with {0} for the best experience.', themeBuilderLink);
                        if (themeId === USWebDesignThemeId) {
                            missingKeysMessage = gwt.getMessage('Your JSON is missing valid base and properties data. Preview your theme with {0} for the best experience.', themeBuilderLink);
                        }
                        g_form.addErrorMessage(missingKeysMessage);
                        return false;
                    }
                    if (!checkIfBaseValuesAreValidRGB(styleJSON)) {
                        var invalidRGBMessage = gwt.getMessage('The RGB values in your JSON are not valid. Update your theme with {0} for the best experience.', themeBuilderLink);
                        if (themeId === USWebDesignThemeId) {
                            invalidRGBMessage = gwt.getMessage('The RGB values in your JSON are not valid. Preview your theme with {0} for the best experience.', themeBuilderLink);
                        }
                        g_form.addErrorMessage(invalidRGBMessage);
                        return false;
                    }
                }
            }
            g_scratchpad.isThemeBuilderStyleRecordValid = true;
            g_form.submit(actionName);

        } catch (e) {
            g_form.addErrorMessage(e.toString());
        }
    }
}
