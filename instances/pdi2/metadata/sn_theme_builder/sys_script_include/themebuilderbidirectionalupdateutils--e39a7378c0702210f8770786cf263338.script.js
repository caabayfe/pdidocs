var ThemeBuilderBiDirectionalUpdateUtils = Class.create();
ThemeBuilderBiDirectionalUpdateUtils.prototype = {
    initialize: function() {},
    handleColorStyleRecordUpdate: function(themeID, styleId, ourOldValue, ourNewValue, type) {
        var oldJson = JSON.parse(ourOldValue);
        var newJson = JSON.parse(ourNewValue);
        var differences = [];

        // Compare the 'base' key
        this.compareKeyValues(oldJson.base, newJson.base, 'base_color', differences);

        // Compare the 'properties' key
        this.compareKeyValues(oldJson.properties, newJson.properties, 'color', differences);

        if (differences.length > 0) {
            for (let i = 0; i < differences.length; i++) {
                if (differences[i].type === 'base_color') {
                    this.updateThemeCustomizationRecord(differences?.[i]?.id, differences?.[i]?.value, themeID, 'color_hook_overridden', type, styleId);
                } else {
                    this.updateThemeCustomizationRecord(differences?.[i]?.id, differences?.[i]?.value, themeID, 'component_hook_overridden', type, styleId);
                }
            }
        } else {
            gs.info("No differences found.");
        }
    },
    updateThemeCustomizationRecord: function(id, value, themeID, type, recordType, styleId) {
        var customGR = new GlideRecord('sys_ux_theme_customization');
        customGR.addQuery('theme', themeID);
        customGR.query();
        if (customGR.next()) {
            if (!customGR?.customization) {
                // If customization is not present (null, undefined, or empty), set a default value
                customGR.customization = JSON.stringify({});
            }
            var customizationValue = JSON.parse(customGR.customization);
            const secondaryBrandColorHook = '--now-color_brand--secondary';
            if (id == secondaryBrandColorHook) {
                colorData = {
                    colors: [{
                        "id": "isSecondaryColorUpdated",
                        "value": true,
                        "type": "secondary_color_updated"
                    }]
                };
            }
            colorData = {
                colors: [{
                    id: id,
                    type: type,
                    value: value
                }]
            };
            if (recordType == 'variant') {
                //first find the variant and then add color and styleID
                if (customizationValue.hasOwnProperty('variants')) {
                    let variantFound = false;
                    let variantColorFound = false;
                    for (let i = 0; i < customizationValue.variants.length; i++) {
                        if (customizationValue.variants[i].id == styleId) {
                            for (let j = 0; j < customizationValue.variants[i].colors.length; j++) {
                                if (customizationValue?.variants?.[i].colors?.[j]?.id == id) {
                                    customizationValue.variants[i].colors[j].value = value;
                                    variantFound = true;
                                    variantColorFound = true;
                                    break;
                                }
                            }
                            if (!variantColorFound) {
                                customizationValue.variants[i].colors.push(colorData.colors[0]);
                                variantFound = true;
                                variantColorFound = true;
                                break;
                            }
                        }
                    }
                    if (!variantFound) {
                        let variantData = {
                            id: "" + styleId,
                            colors: [colorData.colors]
                        };
                        customizationValue.variants.push(...variantData);
                    }
                    customGR.customization = JSON.stringify(customizationValue);
                    customGR.update();
                } else {
                    //if first time variant is modified
                    customizationValue.variants = [{
                        id: "" + styleId,
                        colors: colorData.colors
                    }];
                    customGR.customization = JSON.stringify(customizationValue);
                    customGR.update();
                }
            } else if (recordType == 'core') {
                //this is for style,imagery,typograpy
                if (customizationValue.hasOwnProperty('colors')) {
                    let colorFound = false;
                    for (var i = 0; i < customizationValue.colors.length; i++) {
                        if (customizationValue?.colors?.[i]?.id === id) {
                            customizationValue.colors[i].value = value;
                            colorFound = true;
                            break;
                        }
                    }
                    if (!colorFound) {
                        customizationValue.colors.push(...colorData.colors);
                    }
                    customGR.customization = JSON.stringify(customizationValue);
                    customGR.update();
                } else {
                    customizationValue.colors = colorData.colors;
                    customGR.customization = JSON.stringify(customizationValue);
                    customGR.update();
                }
            }
        } else {
            gs.info('customization record not found.');
        }
    },
    compareKeyValues: function(oldObj, newObj, key, differences) {
        if (oldObj && newObj) {
            for (var subKey in oldObj) {
                if (oldObj.hasOwnProperty(subKey) && newObj.hasOwnProperty(subKey)) {
                    var oldValue = oldObj[subKey];
                    var newValue = newObj[subKey];
                    if (oldValue !== newValue) {
                        differences.push({
                            id: subKey,
                            value: newValue,
                            type: key
                        });
                    }
                }
            }
        }
    },
    isThemeBuilderTheme: function(themeId) {
        return ThemeRepository.isThemeCreatedByTB(themeId);
    },
    handleBidirectionalUpdate: function(currentGlideRecord, previousGlideRecord) {
        const { name, type } = currentGlideRecord;
        if (name == 'Colors' && (type == 'variant' || type == 'core')) {
            this.handleColorStyleUpdate(currentGlideRecord, previousGlideRecord);
        }
    },
    handleColorStyleUpdate: function(currentColorRecord, previousColorRecord) {
        var fieldName = 'style';
        var m2mGR = new GlideRecord('m2m_theme_style');
        m2mGR.addQuery(fieldName, currentColorRecord.sys_id);
        m2mGR.query();
        if (!m2mGR.next()) return; // Exit if no m2m_theme_style record is found
        if (!this.isThemeBuilderTheme(m2mGR.theme)) return; // Exit if the theme is not a Theme Builder theme

        var oldValue = previousColorRecord[fieldName];
        var newValue = currentColorRecord[fieldName];

        if (oldValue !== newValue) {
            this.handleColorStyleRecordUpdate(
                m2mGR.theme,
                currentColorRecord.sys_id,
                oldValue,
                newValue,
                currentColorRecord.type
            );
        }

    },
    type: 'ThemeBuilderBiDirectionalUpdateUtils'
};
