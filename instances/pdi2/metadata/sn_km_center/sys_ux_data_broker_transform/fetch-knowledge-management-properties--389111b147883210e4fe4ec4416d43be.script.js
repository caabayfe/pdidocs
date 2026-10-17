function transform() {
    /**
     * Returns the label corresponding to a choice value from a comma-separated choices string.
     * Supports both "Label=Value" and "Value" formats.
     */
    function getChoiceLabel(choicesStr, propValue) {
        if (!choicesStr || !propValue) return null;

        const choiceStrings = choicesStr.split(',');
        for (let i = 0; i < choiceStrings.length; i++) {
            const choiceString = choiceStrings[i].trim();
            const choiceParts = choiceString.split('=');

            if (choiceParts.length === 2) {
                const label = choiceParts[0].trim();
                const value = choiceParts[1].trim();
                if (value === propValue) return label;
            } else {
                // Format like "Value" (no "="), label and value are the same
                if (choiceString === propValue) return choiceString;
            }
        }

        return null; // Not found
    }

    const result = {
        categories: []
    };

    let propertiesFound = false;

    try {
		var packages  = ['Knowledge Management - External Content Integration','Knowledge Management Advanced', 'Knowledge Management Core', 'Knowledge Management', 'Knowledge Center'];
        const categoryGr = new GlideRecordSecure('sys_properties_category');
        categoryGr.addQuery('sys_package.name', 'IN',packages);
        categoryGr.query();

        while (categoryGr.next()) {
            var categoryId = categoryGr.getUniqueValue();
            var categoryName = categoryGr.getDisplayValue('name');

            if (!categoryGr.canRead()) {
                continue;
            }

            const categoryObj = {
                sysId: categoryId,
                label: categoryName,
                properties: []
            };

            try {
                // Query properties linked to the category
                const m2mGr = new GlideRecordSecure('sys_properties_category_m2m');
                m2mGr.addQuery('category', categoryId);
                m2mGr.orderBy('order');
                m2mGr.query();

                while (m2mGr.next()) {
                    propertiesFound = true;
                    const propertyId = m2mGr.getValue('property');

                    try {
                        const propGr = new GlideRecordSecure('sys_properties');
                        if (!propGr.get(propertyId)) {
                            gs.error(gs.getMessage("KC Knowledge Properties Error Property not found with ID: {0}", [propertyId]));
                            continue;
                        }

                        if (!propGr.canRead()) {
                            continue;
                        }

                        const propSysId = propGr.getUniqueValue();
                        const propName = propGr.getValue('name');
                        const propType = propGr.getValue('type') || '';
                        const propDesc = propGr.getDisplayValue('description') || '';
                        let propValue = propGr.getValue('value') || '';
                        const choicesStr = propGr.getValue('choices') || '';
                        const choicesArray = [];
						let selectedChoice ;

                        // Convert value to label if property is a choice list
                        if (propType === "choicelist") {
							if (propValue) {
                                selectedChoice = propValue;
                            }
                            propValue = getChoiceLabel(choicesStr, propValue);
                        }

                        // Parse choices string into array of choice objects
                        if (choicesStr) {
                            const choiceStrings = choicesStr.split(',');
                            for (let i = 0; i < choiceStrings.length; i++) {
                                const choice = choiceStrings[i].trim();
                                const parts = choice.split('=');

                                const choiceObj = (parts.length === 2) ? {
                                    id: parts[1].trim(),
                                    label: parts[0].trim()
                                } : {
                                    id: choice,
                                    label: choice
                                };

                                choicesArray.push(choiceObj);
                            }
                        }

                        // Construct property object
                        const propertyObj = {
                            sysId: propSysId,
                            name: propName,
                            type: propType,
                            description: propDesc,
                            value: propValue,
                            choices: choicesArray,
							selectedChoice: selectedChoice
                        };

                        categoryObj.properties.push(propertyObj);

                    } catch (propEx) {
                        gs.error(gs.getMessage("KC Knowledge Properties Error processing property with ID {0}: {1}", [propertyId, propEx.message]));
                    }
                }

            } catch (catEx) {
                gs.error(gs.getMessage("KC Knowledge Properties Error processing category {0}: {1}", [categoryName, catEx.message]));
            }

            // Add category only if properties found
            if (categoryObj.properties.length > 0) {
                categoryObj.count = categoryObj.properties.length;
                result.categories.push(categoryObj);
            }
        }

    } catch (outerEx) {
        gs.error(gs.getMessage("KC Knowledge Properties Error unexpected failure: {0}", [outerEx.message]));
    }

    return result;
}
