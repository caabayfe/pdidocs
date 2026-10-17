var ProminGlideUtilSNC = Class.create();
ProminGlideUtilSNC.prototype = {
    initialize: function() {
    },

	/**
     * @param {string} table
     * @returns {boolean}
     */
    hasReadAccess: function(table) {
        var gSecurityManager = new GlideSecurityManager();
        var grTable = new GlideRecord(table);

        return gSecurityManager.tableLevelACLAllow(grTable, 'read');
    },

    type: 'ProminGlideUtilSNC'
};
