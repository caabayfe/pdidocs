var ValueDisplayValueModel = function(glideRecord, columnName) {
    var glideElement = glideRecord.getElement(columnName);
    var canRead = glideElement && glideElement.canRead();

    var value = canRead ? glideElement.toString() : "";
    var displayValue = canRead ? glideRecord.getDisplayValue(columnName) : "";

    return {
        value: value,
        display_value: displayValue,
    };
};
