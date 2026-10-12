function transform(input) {
    var PLAYBOOK_FIELD_LIST_EMPTY = gs.getMessage("[Empty]");

    function convertNullToEmptyString(value) {
        return value === null ? "" : value;
    }

    function convertElementInfo(info) {
        var label = info.label || "";
        var value = info.value || "";
        var displayValue = info.displayValue || "";
        var type = info.type || "string";
        var reference = info.reference;

        var converted = {
            label: label,
            isHTMLType: false
        };

        //If the value being passed in is PLAYBOOK_FIELD_LIST_EMPTY, return that
        //string regardless of type
        if (value === PLAYBOOK_FIELD_LIST_EMPTY) {
            converted.value = {
                type: "string",
                value: displayValue,
            };
            return converted;
        }

        // 'now-label-value-stacked' won't render and fails silently if any of the
        // 'value' properties we pass to is 'null', thus needing to convert all
        // 'null' to empty string;
        switch (type) {
            case "reference":
                converted.value = {
                    type: "text-link",
                    label: convertNullToEmptyString(displayValue),
                    href: "javascript:void(0)",
                    table: reference,
                    sysId: value,
                    playbookTextLinkRecord: {
                        table: reference,
                        sysId: value,
                    },
                };
                break;
            case "url":
                converted.value = {
                    type: "text-link",
                    label: displayValue,
                    href: value || "",
                    opensWindow: true,
                };
                break;
            case "html":
            case "translated_html":
                converted.value = {
                    type: "html",
                    value: convertNullToEmptyString(value),
                };
                converted.isHTMLType = true;
                break;
            default:
                // Defaults to 'string' type
                converted.value = convertNullToEmptyString(displayValue);
        }

        return converted;
    }

    var experienceProperties = input.experienceProperties;
    var fieldListProperties = JSON.parse(input.fieldListProperties);
    var htmlValues = [];

    var reduceFieldListProperties = function(result, prop) {
		var trimmedProp = prop.trim();
        if (!experienceProperties.hasOwnProperty(trimmedProp)) return result;

        var relatedProperties =
            (experienceProperties[trimmedProp] && experienceProperties[trimmedProp].relatedProperties) || [];
        if (!Array.isArray(relatedProperties) || !relatedProperties.length)
            return result;

        result[trimmedProp] = relatedProperties.map(function(prop) {
            var elementData = prop.elementData;
            var info = convertElementInfo({
                label: prop.label || "",
                value: prop.value || PLAYBOOK_FIELD_LIST_EMPTY,
                displayValue: prop.displayValue || PLAYBOOK_FIELD_LIST_EMPTY,
                type: elementData.type || "string",
                reference: elementData.reference,
            });

            if (info.isHTMLType) htmlValues.push(prop.value);

            return info;
        });

        return result;
    };

    var fieldListItems = fieldListProperties.reduce(
        reduceFieldListProperties, {}
    );

    return {
        fieldListItems: fieldListItems,
        htmlValues: htmlValues
    };
}
