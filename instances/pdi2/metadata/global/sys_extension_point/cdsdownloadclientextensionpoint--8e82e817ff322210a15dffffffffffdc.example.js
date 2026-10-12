var CDSDownloadClientExtensionPoint = Class.create();
CDSDownloadClientExtensionPoint.prototype = {
    initialize: function() {
    },

    /**
     * Checks if extension point is valid for given table name, only the first applicable extension point will run
     * @param {string} table - name of client-side table who we are downloading data for
     * @returns {boolean} if extension point is applicable to that table
     */
    isApplicable: function(table) {
        return false;
    },

    /**
     * Runs function given metadata before table is updated for each page of data
     * @param {Object} metadata - object storing metadata returned by server
     */
    beforeUpdate: function(metadata) {
        return ;
    },

    /**
     * Runs function given metadata after table is updated for each page of data
     * @param {Object} metadata - object storing metadata returned by server
     */
    afterUpdate: function(metadata) {
        return ;
    },

    type: 'CDSDownloadClientExtensionPoint'
};
