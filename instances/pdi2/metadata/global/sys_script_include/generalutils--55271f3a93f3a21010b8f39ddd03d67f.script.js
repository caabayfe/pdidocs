var GeneralUtils = {};
GeneralUtils.SysPropertyUtils = {
    /**
     * @param {string} propertyName
     * @param {string} propertyDefaultValue
     * @returns {string[]}
     */
    parseCsvProperty: function (propertyName, propertyDefaultValue) {
        return gs
            .getProperty(propertyName, propertyDefaultValue)
            .split(',')
            .map(value => value.trim())
            .filter(Boolean);
    },

    /**
     * @param {string} propertyName
     * @param {number} propertyDefaultValue
     * @returns {number}
     */
    parseIntegerProperty: function (propertyName, propertyDefaultValue) {
        var propertyValue = Math.floor(Number(gs.getProperty(propertyName, propertyDefaultValue)));
        return isNaN(propertyValue) ? propertyDefaultValue : propertyValue;
    }
};
