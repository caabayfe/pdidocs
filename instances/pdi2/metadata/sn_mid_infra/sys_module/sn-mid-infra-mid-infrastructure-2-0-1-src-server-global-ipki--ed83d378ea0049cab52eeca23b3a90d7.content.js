var SessionDataUtil = Class.create();
SessionDataUtil.prototype = {
    initialize: function() {},

    /**
     * Retrieves a session property by name.
     * @param {string} propertyName - The name of the session property.
     * @returns {string} The value of the session property.
     */
    getProperty: function(propertyName) {
        return gs.getSession().getProperty(propertyName);
    },

    type: 'SessionDataUtil'
};
